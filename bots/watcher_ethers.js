
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
        this.httpProvider.on('block', (block)=>{
            console.log('latest block: ', block)
            
            // console.log(`
            // TIMESTAMP: ${blockHeader.timestamp} 
            // DateTime: ${new Date(blockHeader.timestamp*1000)} --------------------------
            // Current Time: ${new Date(Date.now())}`
        })

        const _USDC = new ethers.Contract(USDC, USDCABI, this.httpProvider);
        const _USDT = new ethers.Contract(USDT, USDTABI, this.httpProvider);
        const _WETH = new ethers.Contract(WETH, WETHABI, this.httpProvider);
        const uniInterface =  new utils.Interface(univ3v2ABI);
        const tokenInterface = new utils.Interface(tokenABI);

        _WETH.on("Deposit", async (address, amount, event) => {
            
            //conso
            if (address == UniswapV3Router2) {
                const receipt = await event.getTransactionReceipt();
                const fixedLogs = receipt.logs.map(log=>{
                    log.topics = log.topics.map(t=>t.replace('0x000000000000000000000000', '0x'));
                    return log
                })
                const matchingReceiveTokenLog = receipt.logs.filter(log=>{
                    return log.topics[2] == receipt.from.toLowerCase()
                            && log.topics[1] != receipt.to.toLowerCase();
                })
                try { 
                    const _token = new ethers.Contract(matchingReceiveTokenLog[0].address, tokenABI, this.httpProvider)
                    let symbol = await _token.symbol();
                    let decimals =  await _token.decimals();
                } catch(e) {
                    console.log(e, receipt.transactionHash, matchingReceiveTokenLog)
                }

            }

            if (address == OneInchv5Router) {
                const receipt = await event.getTransactionReceipt();
                console.log(`1inch`)
                console.log(receipt.transactionHash)

            }


        })

        _WETH.on("Withdrawal", async (address, amountWETH, event) => {

            //UniV3
            if (address == UniswapV3Router2) {
                let _amountWETH = amountWETH / 10**18;
                const receipt = await event.getTransactionReceipt();
                const fixedLogs = receipt.logs.map(log=>{
                    log.topics = log.topics.map(t=>t.replace('0x000000000000000000000000', '0x'));
                    return log
                })
                const matchingSendTokenLog = receipt.logs.filter(log=>{
                    return log.topics[1] == receipt.from.toLowerCase()
                        && log.topics[2] != receipt.to.toLowerCase()
                        //block sends to contract
                        && log.topics[2] != log.address.toLowerCase();
                })

                try { 
                    const _token = new ethers.Contract(matchingSendTokenLog[0].address, tokenABI, this.httpProvider)
                    let symbol = await _token.symbol();
                    let decimals =  await _token.decimals();
                    let amountTokenSent = ethers.BigNumber.from(matchingSendTokenLog[0].data) / 10**(decimals)
                    const volumeUsd = _amountWETH * this.etherPrice;
                    const price = _amountWETH / amountTokenSent;
                } catch(e) {
                    console.log(e, receipt.transactionHash, matchingSendTokenLog)
                }

                //console.log(matchingSendTokenLog[0])
            }

            //1Inch
            if (address == OneInchv5Router) {
                const receipt = await event.getTransactionReceipt();
                console.log(`1inch`)
                console.log(receipt.transactionHash)

            }

            if (address = SushiSwapRouter)

            // if (address == ) {
            //     const receipt = await event.getTransactionReceipt();
            //     console.log(event.logs)
            //     // const matchingReceiveTokenLog = receipt.logs.filter(log=>{
            //     //     return log.topics[2]?.replace('0x000000000000000000000000', '0x') == receipt.from.toLowerCase()
            //     //             && log.topics[1]?.replace('0x000000000000000000000000', '0x') != receipt.to.toLowerCase();
            //     // })
            //     // // console.log(matchingReceiveTokenLog)
            //     // // console.log(matchingReceiveTokenLog[0].address, 'address')
            //     // console.log(matchingReceiveTokenLog.length, receipt.transactionHash)

            //     // const _token = new ethers.Contract(matchingReceiveTokenLog[0].address, tokenABI, this.httpProvider)
            //     // let symbol = await _token.symbol();
            //     // let decimals =  await _token.decimals();
            //     // console.log(matchingReceiveTokenLog, symbol, decimals)

            // }
        })

        
        // _USDC.on("Transfer", (from, to, amount, event) => {
        //     // ...
        //     //console.log(from, to, amount, event)
        //     //console.log(event)
        //     if (to == UniswapV3Router2) {
        //         console.log(event.transactionHash, 'to univ3')
        //         console.log(event.logs)
        //     }
        //     // if (to == 1) {
        //     //     console.log(event.transactionHash, 'to univ2')
        //     //     console.log(event.logs)
        //     // }
        // });

        // _USDT.on("Transfer", (from, to, amount, event) => {
        //     // ...
        //     //console.log(from, to, amount, event)
        //     //console.log(event)
        //     if (to == UniswapV3Router2) {
        //         console.log(event.transactionHash, 'to uni')
        //         console.log(event)
        //     }
        // });

        // const univ3v2 = new ethers.Contract(UniswapV3Router2, univ3v2ABI, this.httpProvider)
        
        // univ3v2.on("Multicall", (from, to, amount, event)=> {
        //     console.log(event)
        // })
        // const names = univ3v2ABI.map(m=>{
        //    return m.name
        // });
        // const events = USDCABI.filter(m=>m.type=="event")
        // console.log(events)
          

        // const filterUSDC = {
        //     address: USDC,
        //     topics: [
        //         ethers.utils.id("Transfer(address,address,uint256")
        //     ]
        // }

        // const filterUSDT = {
        //     address: USDT,
        //     topics: [
        //         ethers.utils.id("Transfer(address,address,uint256")
        //     ]
        // }

       
        // this.httpProvider.on(filterUSDC, (log, event) => {
        //     console.log('log')
        //     console.log(log)
        //     console.log('event')
        //     console.log(event)
        // })

        // this.httpProvider.on(filterUSDT, (l, e)=>{
        //     console.log('asdf')
        //     console.log(log, event)
        // })

        // const filterWETHDeposit = {
        //     address: WETH,
        //     topics: [
        //         ethers.utils.id("Deposit(")
        //     ]
        // }

        //this.httpProvider.on(filterUSDT)

        //this.httpProvider.filter
        // this.wsProvider.on('newBlockHeaders', n=> {
        //     console.log(n, 'ws')
        // })

        /* Two possible ways:

        web3 way? 
        every block check transactions for tx.to 
        against univ3_2
        then decode function input 
        then get srcToken and destToken

        except... its multicall..
         idk.

         option 2? set up filter on transfer.



        */
    }
    //api

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


    async decodeLogs(txHash, restrictToSwaps) {
        try {
            let tx = await this.web3Http.eth.getTransactionReceipt(txHash);
            const timestamp = new Date().getTime();
            if (tx != null && tx.to != null) {
                let { from, hash, to } = tx;
                if (restrictToSwaps && ![UniswapV2,UniswapV3Router2,OneInchv5Router,KyberSwap].includes(tx.to.toLowerCase()) )  {
                    // if (tx.to == Unicrypt || tx.to == TeamFinance) {
                    //     this.decodeLock(tx)
                    // } else return;
                    return;
                }
                    
                if (tx.logs && tx.logs.length) {
                    console.log('block number: ', this.web3Http.utils.hexToNumberString(tx.blockNumber))
                    console.log('transaction hash: ', tx.transactionHash)
                    const swapPairUserLogs = tx.logs.map(log=>{
                        log.address = log.address.toLowerCase();
                        log.topics = log.topics.map(t=>t.replace('0x000000000000000000000000', '0x'));
                        return log
                    })
                    .filter(log=>{
                        return (
                            ((log.topics.includes(from) && !log.topics.includes(tx.to)) 
                            || (log.address.toLowerCase() == WETHAddress 
                                && log.topics.includes(tx.to)
                                )
                            || (tx.to == KyberSwap && log.address.toLowerCase() == WETHAddress)
                            ) &&
                            log.topics.length == 3 &&
                        //exclude fee
                            !log.topics.includes(log.address)
                        )
                    });
                                        
                    const swapSend = (await Promise.all(swapPairUserLogs.filter((log, index)=>{
                        return (log.topics[1] == tx.from && log.address != WETHAddress) || (log.address == WETHAddress && log.topics[1] == tx.to) || 
                        (tx.to == KyberSwap && log.address == WETHAddress && index == 0);
                    }).map(async log=> {
                        const contract = new this.web3Http.eth.Contract(tokenABI, log.address)
                        let decimals, symbol;
                        //test contract for methods
                        let isTokenContract;
                        await contract.methods.decimals().call().then(d=>{
                            isTokenContract = true
                            decimals = d;
                        }).catch(e=>isTokenContract = false)
                        if (!isTokenContract) {
                            return;
                        } 
                        symbol = await contract.methods.symbol().call();
                        
                        return {
                            address: contract.options.address,
                            symbol,
                            decimals,
                            amount: new BigNumber(this.web3Http.utils.hexToNumberString(log.data)) / 10**(decimals)
                                }
                    }))).filter(r=>r != undefined)
                    const swapReceive = (await Promise.all(swapPairUserLogs.filter(log=>{
                        return log.topics[2] == tx.from || (log.address == WETHAddress && log.topics[2] == tx.to)
                    }).map(async log=> {
                        const contract = new this.web3Http.eth.Contract(tokenABI, log.address)
                        let decimals, symbol;
                        //test contract for methods
                        let isTokenContract;
                        await contract.methods.decimals().call().then(d=>{
                            isTokenContract = true
                            decimals = d;
                        }).catch(e=>isTokenContract = false)
                        if (!isTokenContract) {
                            return;
                        } 
                        symbol = await contract.methods.symbol().call();
                       // console.log(symbol)
                        //symbol == 'UNI-V2' ? console.log(log) : null;
                        return {
                            address: contract.options.address,
                            symbol,
                            decimals,
                            amount: new BigNumber(this.web3Http.utils.hexToNumberString(log.data)) / 10**(decimals)
                            }
                    }))).filter(r=>r != undefined && r.symbol != "WBTC")
                    //console.log(swapSend,swapReceive)
                    const swapDetails = swapSend && swapReceive ? {sent: swapSend[0], received: swapReceive[0]}: []
                    let type, price, blockTableObject
                    if (swapDetails.sent && swapDetails.received) {

                        //filter WETH to Stablecoin transfers.
                        if (["USDC", "USDT", "WETH"].includes(swapDetails.sent.symbol) 
                            && ["USDC", "USDT", "WETH"].includes(swapDetails.received.symbol) ) {
                                return;
                        }
                        if (swapDetails.sent && ["USDC","USDT","WETH", "BUSD"].includes(swapDetails.sent.symbol)) {
                            //tokenPairContract = await swapDetails.received.contract.methods.uniswapV2Pair().call();
                            type = "buy";
                            //price = swapDetails.
                            let volume = swapDetails.sent.symbol == 'WETH' ? new BigNumber (swapDetails.sent.amount * this.etherPrice) : swapDetails.sent.amount
                            //console.log(volume)
                            //tokenContractAddress = swapDetails.received.contract.address;
                            blockTableObject = 
                            {
                                blockNumber: this.web3Http.utils.hexToNumber(tx.blockNumber),
                                symbol: swapDetails.received.symbol,
                                decimals: swapDetails.received.decimals,
                                contractAddress: swapDetails.received.address,
                                amount: swapDetails.received.amount,
                                usdVolume: volume,
                                timestamp,
                                type: type,
                                txHash: tx.transactionHash
                            }
                            //console.log(blockTableObject)

                            return blockTableObject
                        }
                        if (swapDetails.received && ["USDC","USDT","WETH", "BUSD"].includes(swapDetails.received.symbol)) {
                            type = "sell";
                            //tokenPairContract = await swapDetails.sent.contract.methods.uniswapV2Pair().call();
                            //console.log(swapDetails.received.amount, this.etherPrice)
                            let volume = swapDetails.received.symbol == 'WETH' ? new BigNumber (swapDetails.received.amount * this.etherPrice) : new BigNumber(swapDetails.received.amount)
                            blockTableObject = 
                            {
                                blockNumber: this.web3Http.utils.hexToNumber(tx.blockNumber),
                                symbol: swapDetails.sent.symbol,
                                decimals: swapDetails.sent.decimals,
                                contractAddress: swapDetails.sent.address,
                                amount: swapDetails.sent.amount,
                                usdVolume: volume,
                                timestamp,
                                type: type,
                                txHash: tx.transactionHash
                            }

                            return blockTableObject
                        }
                        return;
                    } else return;
                    

                }
            }
        } catch(e) {
            console.log(e)
        }
    }

    runBlockCheck (restrictToSwaps) {

        
        const subscriptionNewBlockHeaders = this.web3ws.eth.subscribe('newBlockHeaders', (err, res) => {
            if (err) console.error(err);
        })
    
        subscriptionNewBlockHeaders.on('data', async (blockHeader) => {
    
            try {
    
                console.log(`---------------BLOCKHEADER FOR BLOCK ${blockHeader.number} 
                            TIMESTAMP: ${blockHeader.timestamp} 
                            DateTime: ${new Date(blockHeader.timestamp*1000)} --------------------------
                            Current Time: ${new Date(Date.now())}`)
                const blockNumber = blockHeader.number;
                let _transactions = [];
                let block = await this.web3Http.eth.getBlock(blockNumber);
                if (block) {
                    let { transactions } = block;
                    transactions.forEach(async (txHash, index) => {
                        setTimeout(async ()=>{
                            let result =  await this.decodeLogs(txHash, restrictToSwaps)
                            
                        }, index*15)
                        
                    })
                }
            }
            catch(e) {
                this.alertBot.telegram.sendMessage(this.chatId,`Error in run application: ${`${e}`}`)
                console.log(e)
            }
        })
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


