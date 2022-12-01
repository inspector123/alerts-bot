


//what does watcher class need? 


//what functions does it run?
    //block watching function
    //variety of bot message sending functions
    //holds wallets, all variables, etc. and can be updated dynamically

/* what is the schematic?

Watcher starts ??

starts eth websocket

when that's called we call the telegram bot and it lets us know something has happened.


what if we want to change something in the application on the fly?

*/

import axios from 'axios'
import { BigNumber } from 'bignumber.js'
import { get } from 'http';
import path from 'path'
import { Telegraf } from 'telegraf';
import Web3 from 'web3';
import { run } from './alerts/watch.js';
import wallets from './wallets.js'


const ZmokRpc = {
    MainnetArchive: {Http:'http://api.zmok.io/archive/ddrxnhgtnvivsmkj',Wss:"", Https:'https://api.zmok.io/archive/ddrxnhgtnvivsmkj'},
    Mainnet:{Http:'https://api.zmok.io/mainnet/4pjcsinknvgzqloz',Wss:"wss://api.zmok.io/mainnet/4pjcsinknvgzqloz", Https:'https://api.zmok.io/mainnet/dr6hhpfzbdbw02tt'},
    Ropsten:{Http:'https://nd-956-261-887.p2pify.com/3514e113ffeec96265dbadd4d269618f',Wss:"wss://ws-nd-956-261-887.p2pify.com/3514e113ffeec96265dbadd4d269618f", Https:'https://nd-956-261-887.p2pify.com/3514e113ffeec96265dbadd4d269618f'},
    Frontrun: {Http:'http://api.zmok.io/fr/cazc7ppjlx8q04t1',Wss:"wss://api.zmok.io/fr/cazc7ppjlx8q04t1", Https:'https://api.zmok.io/fr/cazc7ppjlx8q04t1'},
    Rinkeby: {Http: 'https://nd-124-352-437.p2pify.com/0994e8509acdbcd17fd085032fa03ba2', Wss: 'wss://ws-nd-124-352-437.p2pify.com/0994e8509acdbcd17fd085032fa03ba2', Https: 'https://nd-124-352-437.p2pify.com/0994e8509acdbcd17fd085032fa03ba2' },
    Goerli: {Http: "", Wss: ""}
}


const UniswapV3Router2 = '0x68b3465833fb72a70ecdf485e0e4c7bd8665fc45'
const OneInchv5Router = '0x1111111254eeb25477b68fb85ed929f73a960582'
const KyberSwap = '0x617dee16b86534a5d792a4d7a62fb491b544111e'
const apiKey = `3UNWDPMM65ARUPABPKM9MQXEAM3MYAATN6`;
const WETHAddress = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2".toLowerCase()
const UniswapV2 = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D"
const WETHRopsten = "0xc778417E063141139Fce010982780140Aa0cD5Ab"

export class Watcher {

    walletsLowerCase = wallets.map(w=>w.toLowerCase());
    chatId;
    alertBot;
    volumeBot;
    testnet;
    wssProvider;
    httpProvider
    web3ws;
    web3Http;
    running = false;

    
    constructor(chatId, wallets, alertBotKey, volumeBotKey, testnet) {
        this.chatId = chatId;
        this.wallets = wallets;
        this.alertBot = new Telegraf(alertBotKey);
        this.volumeBot = new Telegraf(volumeBotKey);
        this.startBots();
        if (testnet) {
            this.wssProvider = ZmokRpc.Goerli.Wss;
            this.httpProvider = ZmokRpc.Goerli.Http;
        } else {
            this.wssProvider = ZmokRpc.Mainnet.Wss;
            this.httpProvider = ZmokRpc.Mainnet.Http;
        }
        this.web3ws = new Web3(new Web3.providers.WebsocketProvider(this.wssProvider));
        this.web3Http = new Web3(new Web3.providers.HttpProvider(this.httpProvider));

    }

    startBots = async () => {

        this.alertBot.command('start', ctx => {
            this.alertBot.telegram.sendMessage(this.chatId, `Welcome. Hit /runAlertBot to begin.`, {
            })
            
            
        
        })
        this.volumeBot.command('start', ctx => {
            this.volumeBot.telegram.sendMessage(this.chatId, `Welcome. Hit /runVolumeBot to begin.`, {
            })
            
            
        
        })
        this.volumeBot.command('r', ctx=>{
            if (!this.running) {
                this.volumeBot.telegram.sendMessage(this.chatId, `Running`)
                this.runBlockCheck()
                this.running = true
            } else {
                this.volumeBot.telegram.sendMessage(this.chatId, `Already running.`)

            }
        })

        this.alertBot.launch();
        this.volumeBot.launch();
    }

    

    async decodeUniV3Router2(txHash) {
        try {
            let tx = await this.web3Http.eth.getTransactionReceipt(txHash);
            if (tx != null) {
                
                let { from, hash, to } = tx;
                    if (tx.to.toLowerCase() == UniswapV3Router2.toLowerCase()) {
                        console.log(txHash, tx.from, 'nonUniTX')
                        return;
                    }
                        
                    
                if (tx.logs) {
                    const swaps = []
                    const swapPairUserLogs = tx.logs.map(log=>{
                        log.address = log.address.toLowerCase();
                        log.topics = log.topics.map(t=>t.replace('0x000000000000000000000000', '0x'));
                        return log
                    })
                    .filter(log=>{
                        // log.topics.includes(from) ||  && 
                        return (
                            ((log.topics.includes(from) && !log.topics.includes(tx.to)) || (log.address.toLowerCase() == WETHAddress && log.topics.includes(tx.to))) &&
                            log.topics.length == 3 &&
                        //exclude fee
                            !log.topics.includes(log.address)
                        )
                    });

                                        
                    const swapSend = await Promise.all(swapPairUserLogs.filter(log=>{
                        return log.topics[1] == tx.from || (log.address == WETHAddress && log.topics[1] == tx.to)
                    }).map(async log=> {
                        const contract = new this.web3Http.eth.Contract(tokenABI, log.address)
                        const symbol = await contract.methods.symbol().call();
                        return {
                            contract,
                            symbol,
                            amount: new BigNumber(this.web3Http.utils.hexToNumberString(log.data)) / 10**(await contract.methods.decimals().call())
                                }
                    }))
                    const swapReceive = await Promise.all(swapPairUserLogs.filter(log=>{
                        return log.topics[2] == tx.from || (log.address == WETHAddress && log.topics[2] == tx.to)
                    }).map(async log=> {
                        const contract = new this.web3Http.eth.Contract(tokenABI, log.address)
                        const symbol = await contract.methods.symbol().call();
                        return {
                            contract,
                            symbol,
                            amount: new BigNumber(this.web3Http.utils.hexToNumberString(log.data)) / 10**(await contract.methods.decimals().call())
                            }
                    }))
                    const swapDetails = swapSend && swapReceive ? {sent: swapSend[0], received: swapReceive[0]}: []
                    console.log(tx.from, swapDetails)
                    let tokenPairContract, tokenContractAddress;
                    if (swapDetails.sent.length && ["USDC","USDT","WETH"].includes(swapDetails.sent.symbol)) {
                        tokenPairContract = await swapDetails.received.contract.methods.uniswapV2Pair().call();
                        tokenContractAddress = swapDetails.received.contract.address;
                    }
                    if (swapDetails.received.length && ["USDC","USDT","WETH"].includes(swapDetails.received.symbol)) {
                        console.log('asdklfj')
                        tokenPairContract = await swapDetails.sent.contract.methods.uniswapV2Pair().call();
                        tokenContractAddress = swapDetails.sent.contract.address;
                    }
                    
                    sendTelegramSwapMessage(bot,ctx,tx,swapDetails, tokenPairContract, tokenContractAddress)
                }
            }
        } catch(e) {
            console.log(e)
        }
    }

    async decodeLogs(txHash) {
        try {
            let tx = await this.web3Http.eth.getTransactionReceipt(txHash);
            if (tx != null) {
                
                let { from, hash, to } = tx;
                    if (tx.to.toLowerCase() == UniswapV3Router2.toLowerCase()) {
                        console.log(txHash, tx.from, 'nonUniTX')
                        return;
                    }
                        
                    
                if (tx.logs) {
                    const swaps = []
                    const swapPairUserLogs = tx.logs.map(log=>{
                        log.address = log.address.toLowerCase();
                        log.topics = log.topics.map(t=>t.replace('0x000000000000000000000000', '0x'));
                        return log
                    })
                    .filter(log=>{
                        // log.topics.includes(from) ||  && 
                        return (
                            ((log.topics.includes(from) && !log.topics.includes(tx.to)) || (log.address.toLowerCase() == WETHAddress && log.topics.includes(tx.to))) &&
                            log.topics.length == 3 &&
                        //exclude fee
                            !log.topics.includes(log.address)
                        )
                    });

                                        
                    const swapSend = await Promise.all(swapPairUserLogs.filter(log=>{
                        return log.topics[1] == tx.from || (log.address == WETHAddress && log.topics[1] == tx.to)
                    }).map(async log=> {
                        const contract = new this.web3Http.eth.Contract(tokenABI, log.address)
                        const symbol = await contract.methods.symbol().call();
                        return {
                            contract,
                            symbol,
                            amount: new BigNumber(this.web3Http.utils.hexToNumberString(log.data)) / 10**(await contract.methods.decimals().call())
                                }
                    }))
                    const swapReceive = await Promise.all(swapPairUserLogs.filter(log=>{
                        return log.topics[2] == tx.from || (log.address == WETHAddress && log.topics[2] == tx.to)
                    }).map(async log=> {
                        const contract = new this.web3Http.eth.Contract(tokenABI, log.address)
                        const symbol = await contract.methods.symbol().call();
                        return {
                            contract,
                            symbol,
                            amount: new BigNumber(this.web3Http.utils.hexToNumberString(log.data)) / 10**(await contract.methods.decimals().call())
                            }
                    }))
                    const swapDetails = swapSend && swapReceive ? {sent: swapSend[0], received: swapReceive[0]}: []
                    console.log(tx.from, swapDetails)
                    let tokenPairContract, tokenContractAddress;
                    if (swapDetails.sent && swapDetails.received) {
                        if (swapDetails.sent && ["USDC","USDT","WETH"].includes(swapDetails.sent.symbol)) {
                            tokenPairContract = await swapDetails.received.contract.methods.uniswapV2Pair().call();
                            tokenContractAddress = swapDetails.received.contract.address;
                        }
                        if (swapDetails.received && ["USDC","USDT","WETH"].includes(swapDetails.received.symbol)) {
                            console.log('asdklfj')
                            tokenPairContract = await swapDetails.sent.contract.methods.uniswapV2Pair().call();
                            tokenContractAddress = swapDetails.sent.contract.address;
                        }
                    }
                    
                    this.sendTelegramSwapMessage(tx,swapDetails, tokenPairContract, tokenContractAddress)
                }
            }
        } catch(e) {
            console.log(e)
        }
    }

    decodeUniV2() {

    }

    decodeKyberSwap() {

    }

    runBlockCheck () {

        
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
                let block = await this.web3Http.eth.getBlock(blockHeader.number);
                if (block) {
                    let { transactions } = block;
                    _transactions = transactions;
                    transactions.forEach(async (txHash, index) => {
                        setTimeout(async ()=>{

                            this.decodeLogs('0x6e7291f3270074f030b7ed6c831d78097c73e0c8785f474be0ea4600ec6cd028')
                            //see tx.to from getTransaction

                            //if tx.to is from UniV3 getTransactionReceipt

                            //if tx.to is univ2 just use tx.input

                            // switch(tx.to) {
                            //     case UniswapV2:
                            //         this.decodeUniV2(tx);
                            //         break;
                            //     case UniswapV3Router2:
                            //         this.decodeUniV3Router2(tx);
                            //         break;
                            //     case KyberSwap: 
                            //         this.decodeKyberSwap(tx);
                            //         break;
                            //     case OneInchv5Router:
                            //         this.decode1Inchv5Router(tx);
                            //         break;
                            //     default:
                            //         break;
                                //find out what happens when someone sends a 
                                //token
                            
                        }, index*2500)
                        
                    })
                }
            }
            catch(e) {
                this.volumeBot.telegram.sendMessage(this.chatId,`Error in run application: ${`${e}`}`)
                console.log(e)
            }
        })
    }
    
    sendTelegramSwapMessage = (tx, swapDetails, tokenPairContract, tokenContractAddress) => {
        
            this.volumeBot.telegram.sendMessage(this.chatId, 
    `New Transaction from \`${tx.from}\`! 
TX HASH: https://etherscan.io/tx/${tx.transactionHash}

Details: 
${swapDetails.sent ? `Sent: ${swapDetails.sent?.amount} ${swapDetails.sent?.symbol}` : ``}

${swapDetails.received ? `Received: ${swapDetails.received?.amount} ${swapDetails.received?.symbol}` : ``}
${tokenPairContract ? `Dextools: https://dextools.io/app/ether/pair-explorer/${tokenPairContract}` : ``}

${tokenPairContract ? `Contract Address: https://etherscan.io/token/${tokenContractAddress}` : ``}
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


