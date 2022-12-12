
import axios from 'axios'
import api from '../utils/axios.js'
import { BigNumber } from 'bignumber.js'
import { Telegraf } from 'telegraf';
import wallets from './wallets.js'
import UniV2FactoryABI from './uniswapFactoryABI.json' assert { type: "json" };
import { ethers } from "ethers"


const UniswapV3Router2 = '0x68b3465833fb72a70ecdf485e0e4c7bd8665fc45'
const OneInchv5Router = '0x1111111254eeb25477b68fb85ed929f73a960582'
const KyberSwap = '0x617dee16b86534a5d792a4d7a62fb491b544111e'
const apiKey = `3UNWDPMM65ARUPABPKM9MQXEAM3MYAATN6`;
const WETHAddress = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2".toLowerCase()
const UniswapV2 = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D".toLowerCase()
const WETHRopsten = "0xc778417E063141139Fce010982780140Aa0cD5Ab"
const UniV2FactoryAddress = "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f"


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

    
    constructor(chatId, wallets, alertBotKey, volumeBotKey, testnet, localNodeUrl) {
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


            const provider = new ethers.providers.JsonRpcProvider("");
            // this.wssProvider = ZmokRpc.Mainnet.Wss;
            // this.httpProvider = ZmokRpc.Mainnet.Http;
            // this.archiveProvider = ZmokRpc.MainnetArchive.Http;
        }
        // this.web3ws = new Web3(new Web3.providers.WebsocketProvider(this.wssProvider));
        // this.web3Http = new Web3(new Web3.providers.HttpProvider(this.httpProvider));
        // this.web3Archive = new Web3(new Web3.providers.HttpProvider(this.archiveProvider));
        // this.UniV2Factory = new this.web3Http.eth.Contract(UniV2FactoryABI, UniV2FactoryAddress);
        //this.getEtherPrice();



        this.intervalGetPrice();
    }
    async testRun() {
        // const response = await api.get('/api/Blocks');
        // console.log(response)
        await this.runVolumeCheck(5);
        
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




const tokenABI = [
    // balanceOf
    {
      constant: true,
      inputs: [{ name: "_owner", type: "address" }],
      name: "balanceOf",
      outputs: [{ name: "balance", type: "uint256" }],
      type: "function",
    },
    {
        inputs: [{
            internalType: "address",
            name: "spender",
            type: "address"
        }, {
            internalType: "uint256",
            name: "amount",
            type: "uint256"
        }],
        name: "approve",
        outputs: [{
            internalType: "bool",
            name: "",
            type: "bool"
        }],
        stateMutability: "nonpayable",
        type: "function"
    },
    {
        inputs: [
          {
            internalType: "address",
            name: "owner",
            type: "address",
          },
          {
            internalType: "address",
            name: "spender",
            type: "address",
          },
        ],
        name: "allowance",
        outputs: [
          {
            internalType: "uint256",
            name: "",
            type: "uint256",
          },
        ],
        stateMutability: "view",
        type: "function",
      },
    {
        inputs: [],
        name: "name",
        outputs: [{
            internalType: "string",
            name: "",
            type: "string"
        }],
        stateMutability: "view",
        type: "function"
    },
    {
        inputs: [],
        name: "symbol",
        outputs: [{
            internalType: "string",
            name: "",
            type: "string"
        }],
        stateMutability: "view",
        type: "function"
    },
    {
        inputs: [],
        name: "decimals",
        outputs: [{
            internalType: "uint256",
            name: "",
            type: "uint256"
        }],
        stateMutability: "view",
        type: "function"
    },

    //uniswapV2Pair
    {
        inputs: [],
        name:"uniswapV2Pair",
        outputs:[{
            internalType:"address",
            name:"",
            type:"address"
        }],
        stateMutability:"view",
        type:"function"
    }
];

// unsubscribeNewBlockHeaders() {
// subscriptionNewBlockHeaders.unsubscribe((err: Error, success: boolean) => {
//     if (success) {console.log('Successfully unsubscribed')}
// })


