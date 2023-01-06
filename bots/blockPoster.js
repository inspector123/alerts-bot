
import axios from 'axios'
import api from '../utils/axios.js'
import { BigNumber } from 'bignumber.js'
import { Telegraf } from 'telegraf';
import wallets from '../utils/wallets.js'
import UniV2FactoryABI from '../abi/uniswapFactoryABI.json' assert { type: "json" };
import { ethers, utils } from "ethers"
import USDCABI from "../abi/usdcabi.json" assert { type: "json" };
import USDTABI from "../abi/usdtabi.json" assert { type: "json" };
import WETHABI from '../abi/wethabi.json' assert { type: "json" };
import univ3v2ABI from '../abi/univ3v2abi.json' assert { type: "json" };
import tokenABI from '../abi/tokenABI.json' assert { type: "json" };
import univ2PairABI from '../abi/univ2PairABI.json' assert { type: "json" };
import univ3PoolABI from '../abi/uniV3PoolABI.json' assert { type: "json" };
import KyberswapABI from '../abi/KyberswapABI.json' assert { type: "json" };
import basicTokenABI from '../abi/basicTokenABI.json' assert { type: "json" };
import SwapParser from '../utils/swapParser.js'
import Constants from "../utils/constants.js"
const { daiContract, disallowedPools, disallowedSymbols, disallowedTo, 
    mevBot1, mevBot2, busdETH, USDCUSDT, v2USDTDAI, sushiswapUSDTv2, v3DAI_2, v2USDC, 
    pancakeUSDC, pancakeUSDT, v2USDT, v3_DaiUSDCv4, v3USDC, v3Usdt, v3DaiUsdt,
    KyberSwap, KyberSwapInBetweenContract, USDC, WETH, WBTC, FRAX, BUSD, DAI, USDT,
    acceptedRouters, botContracts, UniswapV3Router2, OneInchV4Router,OneInchv5Router,SushiSwapRouter, UniswapV2, StablesOrEth, apiKey } = Constants;

//import { Interface } from 'ethers';

export class BlockPoster {

    walletsLowerCase = wallets.map(w=>w.toLowerCase());
    chatId;
    alertBot;
    volumeBot;
    testnet;
    running = false;
    volumeRunning = false;
    interrupt = false;
    UniV2Factory;
    etherPrice;
    btcPrice;
    currentBlockSwaps = [];
    started;
    swapParser;

    constructor(chatId, wallets, alertBotKey,httpUrl, archiveUrl) {
        this.chatId = chatId;
        this.wallets = wallets;
        this.alertBot = new Telegraf(alertBotKey);
        this.blocks = 0;
        this.httpProvider = new ethers.providers.JsonRpcProvider(httpUrl);
        this.archiveProvider = new ethers.providers.JsonRpcProvider(archiveUrl);
        this.swapParser = new SwapParser(httpUrl);
        
    }
    async start() {
        this.startBots();
        this.runEthersBlockCheck();
    }

    
    async sendToApi(previousBlockSwaps) {
        
        try {
            //Blocks
            let swaps = previousBlockSwaps.flat().filter(b=>b.blockNumber)
            
            
            for (let i in swaps) {
                const response = await api.post(`/api/blocks`, swaps[i]);
            }
           
        } catch (e) {
            console.log(e)
            this.previousBlockSwaps = []

        }

        this.swapParser.currentBlockSwaps = [];
        // how will i calculate volume5m,volume15m,volume1h,volume1D?
        // naive implementation: get all contracts, add volume to last volume entry.

                //lol.
    }

    async sendToTelegram(currentBlockSwaps) {
        let swaps = currentBlockSwaps.flat().filter(s=>s.blockNumber).filter(s=>s.isEpiWallet);
        if (swaps.length) {
            swaps.forEach(swap=> {
                this.alertBot.telegram.sendMessage(this.chatId, 
                    `New transaction from ${swap.wallet} on ${swap.router}
${swap.isBuy ? `Bought ` : `Sold`} $${swap.usdVolume} worth of ${swap.symbol}
TXHASH: https://etherscan.io/tx/${swap.txHash}
CONTRACT ADDRESS: https://etherscan.io/address/${swap.contract}
WALLET: https://etherscan.io/address/${swap.wallet}
                `)
            })
        }
        

    }

    
    async runEthersBlockCheck(blocks) {
        if (blocks) this.blocks = blocks;

        await this.intervalGetPrice();
        this.httpProvider.on('block', async (block)=>{
            console.log('latest block: ', block)
            this.blockTxHashes = [];


            if (this.swapParser.currentBlockSwaps.length) {
                this.previousBlockSwaps = this.swapParser.currentBlockSwaps;
                this.swapParser.currentBlockSwaps = [];
                // console.log(this.previousBlockSwaps)
                await this.sendToApi(this.previousBlockSwaps);
                //await this.sendToTelegram(this.previousBlockSwaps);
               // this.previousBlockSwaps = [];

            }


        })

        const _WETH = new ethers.Contract(Constants.WETH, WETHABI, this.httpProvider);
        const _USDC = new ethers.Contract(Constants.USDC, USDCABI, this.httpProvider);
        const _USDT = new ethers.Contract(Constants.USDT, USDTABI, this.httpProvider);
        //let i = 0;

        _WETH.on("Deposit", async (address, amount, event) => {
            
            if (this.blockTxHashes.includes(event.transactionHash)) {
                return;
            }
            this.blockTxHashes = [...this.blockTxHashes, event.transactionHash]

            if (address == Constants.UniswapV3Router2
                || address  == Constants.OneInchv5Router || address == Constants.UniswapV2 || address == Constants.OneInchV4Router || address == Constants.KyberSwapInBetweenContract) {
                    this.swapParser.grabSwap(event, this.etherPrice, this.btcPrice);
                }
            

        })

        _WETH.on("Withdrawal", async (address, amount, event) => {
            if (this.blockTxHashes.includes(event.transactionHash)) {
                return;
            }
            this.blockTxHashes = [...this.blockTxHashes, event.transactionHash]
            if (address == UniswapV3Router2
                || address  == OneInchv5Router || address == UniswapV2 || address == OneInchV4Router || address == KyberSwapInBetweenContract) {
                    this.swapParser.grabSwap(event, this.etherPrice, this.btcPrice);
                }

        })
        _USDC.on("Transfer", async (to,from,amount,event)=>{
            if (this.blockTxHashes.includes(event.transactionHash)) {
                return;
            }
            this.blockTxHashes = [...this.blockTxHashes, event.transactionHash]
            this.swapParser.grabSwap(event, this.etherPrice, this.btcPrice);
            //const rcpt = await event.getTransactionReceipt();

        })
        _USDT.on("Transfer", async (to,from,amount,event)=>{
            if (this.blockTxHashes.includes(event.transactionHash)) {
                return;
            }
            this.blockTxHashes = [...this.blockTxHashes, event.transactionHash]
            this.swapParser.grabSwap(event, this.etherPrice, this.btcPrice);
            
        })
//


    }
    


    async getEtherPrice() {
        const url = `https://api.etherscan.io/api?module=stats&action=ethprice&apikey=${Constants.apiKey}`;
        
        await axios.get(url).then((r) => {
            if (r.data.status !== 0) {
                if (r.data.message != "NOTOK") {
                    this.etherPrice = parseInt(r.data.result.ethusd)
                    const {ethusd, ethbtc} = r.data.result;
                    //console.log(r.data.result)
                    //console.log(ethusd/ethbtc);
                    this.btcPrice = ethusd/ethbtc

                    console.log('Current Price of Ether: $', this.etherPrice)
                    console.log('Current Price of BTC:', this.btcPrice)
                    return;
                } else {
                    console.log('Error getting price')
                    return;
                }
            } 
        }).catch(e=>{
            console.log(e)
            this.etherPrice = 1200;
            this.btcPrice = 16000;
        });
        return;
    }

    async intervalGetPrice() {
        await this.getEtherPrice();
        setInterval(this.getEtherPrice, 60000)
    }

    startBots = async () => {
        this.alertBot.command('chatId', ctx=>this.alertBot.telegram.sendMessage(ctx.chat.id, `Chat Id is ${ctx.chat.id}`))
        
        // this.volumeBot.command('interrupt', ()=>{
        //     this.volumeBot.telegram.sendMessage(this.chatId, `Attempting to interrupt...`)
        //     this.interrupt = true;
        // })
        // this.volumeBot.command('restart', ()=>{
        //     this.volumeBot.telegram.sendMessage(this.chatId, `Attempting to restart...`)
        //     this.interrupt = false;
        // })
        this.alertBot.command('start', ctx => {
            if (this.started) {

                this.alertBot.telegram.sendMessage(this.chatId, `already running you cuck`, {
                })
            } else {
                this.alertBot.telegram.sendMessage(this.chatId, `running, ${ctx.chat.id}`, {
                })
                this.started = true;
                //this.runEthersBlockCheck();
            }
            
            
        })
            
       

        this.alertBot.launch();
        //this.volumeBot.launch();
    }

    
    decodeLock(tx) {
        //not implemented. 
        //for now, i can just check. 
        //theres enough time to do that. check indy and check honeypotisbot.
        return;
    }

    checkHoneypot(tx) {
        //not implemented
        return;
    }
}

/*
${tokenPairContract ? `Dextools: https://dextools.io/app/ether/pair-explorer/${tokenPairContract}` : ``}
${tokenPairContract ? `Contract Address: https://etherscan.io/token/${tokenContractAddress}` : ``}
*/

// unsubscribeNewBlockHeaders() {
// subscriptionNewBlockHeaders.unsubscribe((err: Error, success: boolean) => {
//     if (success) {console.log('Successfully unsubscribed')}
// })


