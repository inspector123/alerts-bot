
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
    acceptedRouters, botContracts, UniswapV3Router2, OneInchV4Router,OneInchv5Router,SushiSwapRouter, UniswapV2, StablesOrEth, apiKey , v2topic, v3topic} = Constants;

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
        //Blocks
        let swaps = previousBlockSwaps.flat().filter(b=>b != undefined)
        //console.log(swaps)
        
        for (let i in swaps) {
            try {
                const response = await api.post(`/api/blocks`, swaps[i]);
            } catch(e) {
                console.log(e.response?.err?.data)
            }
        }
        console.log('success')
        this.previousBlockSwaps = []

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
        this.httpProvider.on('block', async (block)=>{
            console.log('latest block: ', block)

            if (this.currentBlockSwaps.length) {
                this.previousBlockSwaps = this.currentBlockSwaps;
                this.currentBlockSwaps = [];
                await this.sendToApi(this.previousBlockSwaps);
                //await this.sendToTelegram(this.previousBlockSwaps);
                this.previousBlockSwaps = [];

            }


        })

        this.httpProvider.on({topics: [[v3topic, v2topic]]}, async (log)=> {
            const response = await this.swapParser.grabSwap(log);
            this.currentBlockSwaps = [...this.currentBlockSwaps, response]
        })

    }
    
    startBots = async () => {
        this.alertBot.command('chatId', ctx=>this.alertBot.telegram.sendMessage(ctx.chat.id, `Chat Id is ${ctx.chat.id}`))
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


