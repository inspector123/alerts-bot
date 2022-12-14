
import axios from 'axios'
import api from '../utils/axios.js'
import { BigNumber } from 'bignumber.js'
import { Telegraf } from 'telegraf';
import wallets from './wallets.js'
import UniV2FactoryABI from './abi/uniswapFactoryABI.json' assert { type: "json" };
import { ethers, utils } from "ethers"
import USDCABI from "./abi/usdcabi.json" assert { type: "json" };
import USDTABI from "./abi/usdtabi.json" assert { type: "json" };
import WETHABI from './abi/wethabi.json' assert { type: "json" };
import univ3v2ABI from './abi/univ3v2abi.json' assert { type: "json" };
import tokenABI from './abi/tokenABI.json' assert { type: "json" };

//import { Interface } from 'ethers';

const apiKey = `3UNWDPMM65ARUPABPKM9MQXEAM3MYAATN6`;

//contracts for log.address filters
const USDC = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
const USDT = "0xdAC17F958D2ee523a2206206994597C13D831ec7";
const WETH = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";

//routers
const UniswapV3Router2 = '0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45'
const OneInchv5Router = '0x1111111254EEB25477B68fb85Ed929f73A960582'
const KyberSwap = '0x617dee16b86534a5d792a4d7a62fb491b544111e'
const UniswapV2 = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D"
const SushiSwapRouter = "0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F"
const KyberSwapInBetweenContract = "0x4Fe5b965E3BD76eFf36280471030ef9b0E6e2C1D"





export class Watcher {

    walletsLowerCase = wallets.map(w=>w.toLowerCase());
    chatId;
    alertBot;
    volumeBot;
    testnet;
    // wssProvider;M
    // httpProvider;
    // archiveProvider;
    // web3Archive;
    // web3ws;
    // web3Http;
    running = false;
    volumeRunning = false;
    interrupt = false;
    UniV2Factory;
    etherPrice;
    currentBlockSwaps = [];
    
    constructor(chatId, wallets, alertBotKey, volumeBotKey, testnet, httpUrl, wsUrl) {
        this.chatId = chatId;
        this.wallets = wallets;
        this.alertBot = new Telegraf(alertBotKey);
        this.volumeBot = new Telegraf(volumeBotKey);
        this.startBots();
        if (testnet) {

            // this.wssProvider = ZmokRpc.Goerli.Wss;
            // this.httpProvider = ZmokRpc.Goerli.Http;
            // this.archiveProvider = ZmokRpc.MainnetArchive.Ropsten;
        } else {


            this.httpProvider = new ethers.providers.JsonRpcProvider(httpUrl);
            this.wsProvider = new ethers.providers.WebSocketProvider(wsUrl)
            // this.wssProvider = ZmokRpc.Mainnet.Wss;
            // this.httpProvider = ZmokRpc.Mainnet.Http;
            // this.archiveProvider = ZmokRpc.MainnetArchive.Http;
        }
        // this.web3ws = new Web3(new Web3.providers.WebsocketProvider(this.wssProvider));
        // this.web3Http = new Web3(new Web3.providers.HttpProvider(this.httpProvider));
        // this.web3Archive = new Web3(new Web3.providers.HttpProvider(this.archiveProvider));
        // this.UniV2Factory = new this.web3Http.eth.Contract(UniV2FactoryABI, UniV2FactoryAddress);
        //this.getEtherPrice();

        this.runEthersBlockCheck();

    }
    async testRun() {
        // const response = await api.get('/api/Blocks');
        // console.log(response)
        await this.runVolumeCheck(5);
        
    }

    async runEthersBlockCheck() {

        await this.intervalGetPrice();
        this.httpProvider.on('block', async (block)=>{
            console.log('latest block: ', block)
            this.currentBlock = block;
            if (this.currentBlockSwaps.length) {
                //console.log(this.currentBlockSwaps);
                const response = await api.post(`/api/blocks`, this.currentBlockSwaps).then(r=>console.log(r.status)).catch(e=>console.error(e));
                this.currentBlockSwaps = [];
            }



            //as soon as new block comes, post results of old block.
        })
        const _WETH = new ethers.Contract(WETH, WETHABI, this.httpProvider);
        let i = 0;

        _WETH.on("Deposit", async (address, amount, event) => {
            
            const properAmountWETH = amount / 10**18;

            if (address == UniswapV3Router2 
            || address == OneInchv5Router //|| address == UniswapV2
            ) {
                let swapsToAdd = await this.parseTokenTransferFromWETHLog(event,true,properAmountWETH);
                this.currentBlockSwaps = [...this.currentBlockSwaps, swapsToAdd]
            }

        })

        _WETH.on("Withdrawal", async (address, amountWETH, event) => {

            let properAmountWETH = amountWETH / 10**18;
            //UniV3
            if (address == UniswapV3Router2 
                || address == OneInchv5Router //|| address == UniswapV2 || address = KyberSwapInBetweenContract ... etc....
                ) {
                    let swapsToAdd = await this.parseTokenTransferFromWETHLog(event,false,properAmountWETH);
                    this.currentBlockSwaps = [...this.currentBlockSwaps, swapsToAdd]
            }

            if (address == SushiSwapRouter) {
                console.log('sushiswap')
            }

        })

        
    }

    //if isDeposit is false then it's a withdrawal
    async parseTokenTransferFromWETHLog(event, isDeposit, amountWETH) {
        const receipt = await event.getTransactionReceipt();
        const fixedLogs = receipt.logs.map(log=>{
            log.topics = log.topics.map(t=>t.replace('0x000000000000000000000000', '0x'));
            return log
        }).filter(log=>log.topics.length == 3);
        let matchingTokenLog = [];
        if (isDeposit) {
            matchingTokenLog = fixedLogs.filter(log=>{
                return log.topics[2] == receipt.from.toLowerCase()
                        && log.topics[1] != UniswapV3Router2.toLowerCase()
                        && log.topics[1] != OneInchv5Router.toLowerCase();
             })
        } else {
            matchingTokenLog = fixedLogs.filter(log=>{
                return log.topics[1] == receipt.from.toLowerCase()
                    && log.topics[2] != receipt.to.toLowerCase()
                    //block sends to contract
                    && log.topics[2] != log.address.toLowerCase();
            })

        }
        try { 
            const _token = new ethers.Contract(matchingTokenLog[0].address, tokenABI, this.httpProvider)
            let name = await _token.name();
            let symbol = await _token.symbol();
            let decimals =  await _token.decimals();
            let amountTokenSent = ethers.BigNumber.from(matchingTokenLog[0].data) / 10**(decimals)
            const usdVolume = amountWETH * this.etherPrice;
            const usdPrice = amountWETH / amountTokenSent * this.etherPrice;

            return {
                blockNumber: receipt.blockNumber,
                symbol: `${symbol}`,
                contract: matchingTokenLog[0].address,
                usdVolume: `${usdVolume}`,
                usdPrice: `${usdPrice}`,
                isBuy: `${isDeposit}`,
                txHash: receipt.transactionHash
            }
            //

            
        } catch(e) {
            console.log(receipt.transactionHash)
            console.log(e, `isDeposit ? ${isDeposit}`, receipt.transactionHash, matchingTokenLog, fixedLogs, event)
        }
    }


    async getEtherPrice() {
        const url = `https://api.etherscan.io/api?module=stats&action=ethprice&apikey=${apiKey}`;
        
        await axios.get(url).then((r) => {
            if (r.data.status !== 0) {
                if (r.data.message != "NOTOK") {
                    console.log('Current Price of Ether: $', r.data.result.ethusd)
                    this.etherPrice = parseInt(r.data.result.ethusd)
                    return;
                } else {
                    console.log('Error getting price')
                    return;
                }
            } 
        }).catch(e=>{
            console.log(e)
            this.etherPrice = 1300;
        });
        return;
    }

    async intervalGetPrice() {
        await this.getEtherPrice();
        setInterval(this.getEtherPrice, 60000)
    }

    startBots = async () => {
        this.volumeBot.command('chatId', ctx=>this.volumeBot.telegram.sendMessage(ctx.chat.id, `Chat Id is ${ctx.chat.id}`))
        
        this.volumeBot.command('interrupt', ()=>{
            this.volumeBot.telegram.sendMessage(this.chatId, `Attempting to interrupt...`)
            this.interrupt = true;
        })
        this.volumeBot.command('restart', ()=>{
            this.volumeBot.telegram.sendMessage(this.chatId, `Attempting to restart...`)
            this.interrupt = false;
        })
        this.alertBot.command('start', ctx => {
            this.alertBot.telegram.sendMessage(this.chatId, `Welcome. Hit /runAlertBot to begin.`, {
            })
            
            
        
        })
        this.volumeBot.command('start', ctx => {
            this.volumeBot.telegram.sendMessage(this.chatId, `Welcome.`, {
            })
            
            
        
        })
        this.volumeBot.command('r', ctx=>{
            if (!this.running) {
                this.volumeBot.telegram.sendMessage(this.chatId, `Running`)
                this.runBlockCheck(true)
                this.running = true
            } else {
                this.volumeBot.telegram.sendMessage(this.chatId, `Already running.`)

            }
        })

        this.volumeBot.command('v', async (ctx)=>{
            if (!this.volumeRunning && !this.interrupt) {
                console.log('running volume')
                const blocks = ctx.message.text.slice(3)
                console.log(blocks[0])
                this.volumeBot.telegram.sendMessage(this.chatId, `running volume check on last ${blocks} blocks. Time: ${new Date().getTime()/ 1000}`)
                this.volumeRunning = true
                this.runVolumeCheck(blocks)
                
                
            }
            else {
                this.volumeBot.telegram.sendMessage(this.chatId, `already running volume check`)
            }
        })

        this.alertBot.launch();
        this.volumeBot.launch();
    }


    async volumeLookBack(blocks) {
        let latestBlock = await this.web3Http.eth.getBlockNumber();
        let details = []
        for (let i = 0; i < blocks; i++) {
            let block = await this.web3Http.eth.getBlock(latestBlock - i);
            // console.log(block)
            if (block) {
                let { transactions } = block;
                let allBlockTransactions = []
                const _block = await Promise.all(transactions.map(async (txHash, index) => {
                    const response = await new Promise(resolve => {
                        setTimeout(resolve, index*15);
                      }).then(async ()=>{
                        const result = await this.decodeLogs(txHash, true).then(r=>{
                            if (r) {
                                allBlockTransactions.push(r);
                            }
                        })
                    })
                    return
                }))
                //console.log(allBlockTransactions, "all block transactions")

                details = [...details, allBlockTransactions]
            }
        }
        return details
    }


    async runVolumeCheck(num) {
        const curr = new Date().getTime()/1000
        console.log(`started at ${new Date().getTime()/1000}`)
        await this.volumeLookBack(num).then(async r=>{
            await api.post('/api/blocks', r);
            console.log(`finished at ${new Date().getTime()/ 1000}`)
            const end = new Date().getTime()/ 1000
            console.log(`total time: ${end-curr}`)
            this.volumeRunning = false
        })
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


    routerName(address) {
        switch (address) {
            case UniswapV3Router2:
                return "UniswapV3Router2";
            case OneInchv5Router:
                return "1InchV5";
            case KyberSwap: 
                return "Kyberswap";
            case UniswapV2:
                return "UniswapV2";
            default: 
                return "";
        }
    }
    // SHOULD HAVE SENT TO, RECEIVED FROM
    sendTelegramSwapMessage = (tx, swapDetails, tokenPairContract, tokenContractAddress) => {
        
            this.alertBot.telegram.sendMessage(this.chatId, 
    `New Transaction from ${tx.from}! 
TX HASH: https://etherscan.io/tx/${tx.transactionHash}
Details: 
${swapDetails.sent ? `Sent: ${swapDetails.sent?.amount} ${swapDetails.sent?.symbol}` : ``} /
${swapDetails.received ? `Received: ${swapDetails.received?.amount} ${swapDetails.received?.symbol}` : ``}
Router: ${this.routerName(tx.to)}

Wallet Link: https://etherscan.io/address/${tx.from}
            `)
        // } else if (tx.to == OneInchv5Router) {
        //     this.alertBot.telegram.sendMessage(this.chatId, `New 1Inchv5 Transaction from ${tx.from}!
        //     https://etherscan.io/tx/${tx.transactionHash}`)
        // } 
        // else if (tx.to == KyberSwap) {
        //     this.alertBot.telegram.sendMessage(this.chatId, `New KyberSwap Transaction from ${tx.from}
        //     https://etherscan.io/tx/${tx.transactionhash}`)
        // } else {
        //     this.alertBot.telegram.sendMessage(this.chatId, `New Transaction from ${tx.from}!
        //     https://etherscan.io/tx/${tx.transactionhash}
            
        //     Tx Input: ${tx.input}
            
            
            
        //     `)
        // }
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


