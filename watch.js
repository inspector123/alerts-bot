
import axios from 'axios'
import { BigNumber } from 'bignumber.js'
import { get } from 'http';
import path from 'path'
import Web3 from 'web3';


const ZmokRpc = {
    MainnetArchive: {Http:'http://api.zmok.io/archive/ddrxnhgtnvivsmkj',Wss:"", Https:'https://api.zmok.io/archive/ddrxnhgtnvivsmkj'},
    Mainnet:{Http:'http://api.zmok.io/mainnet/dr6hhpfzbdbw02tt',Wss:"wss://api.zmok.io/mainnet/m9w6qf9hzy8otaz3", Https:'https://api.zmok.io/mainnet/dr6hhpfzbdbw02tt'},
    Ropsten:{Http:'https://nd-956-261-887.p2pify.com/3514e113ffeec96265dbadd4d269618f',Wss:"wss://ws-nd-956-261-887.p2pify.com/3514e113ffeec96265dbadd4d269618f", Https:'https://nd-956-261-887.p2pify.com/3514e113ffeec96265dbadd4d269618f'},
    Frontrun: {Http:'http://api.zmok.io/fr/cazc7ppjlx8q04t1',Wss:"wss://api.zmok.io/fr/cazc7ppjlx8q04t1", Https:'https://api.zmok.io/fr/cazc7ppjlx8q04t1'},
    Rinkeby: {Http: 'https://nd-124-352-437.p2pify.com/0994e8509acdbcd17fd085032fa03ba2', Wss: 'wss://ws-nd-124-352-437.p2pify.com/0994e8509acdbcd17fd085032fa03ba2', Https: 'https://nd-124-352-437.p2pify.com/0994e8509acdbcd17fd085032fa03ba2' }
}


const UniswapV3Router2 = '0x68b3465833fb72a70ecdf485e0e4c7bd8665fc45'
const OneInchv5Router = '0x1111111254eeb25477b68fb85ed929f73a960582'
const KyberSwap = '0x617dee16b86534a5d792a4d7a62fb491b544111e'
const apiKey = `3UNWDPMM65ARUPABPKM9MQXEAM3MYAATN6`;

const getEtherscan = async () => {
  let ABI = {};
  const url = `https://api${
    testnet ? `-rinkeby` : ``
  }.etherscan.io/api?module=contract&action=getabi&address=${address}&apikey=${apiKey}`;

  await axios.get(url).then((r) => {
    console.log(r);
    if (r.data.status !== 0) {
      if (r.data.message != "NOTOK") {
        ABI = JSON.parse(r.data.result);
      }
    }
  });
  return ABI;
}


export const run = (bot, ctx, wallets) => {

    const walletsLowerCase = wallets.map(w=>w.toLowerCase());
    console.log(walletsLowerCase)

    const web3ws = new Web3(new Web3.providers.WebsocketProvider(ZmokRpc.Mainnet.Wss))
    const web3Read = new Web3(new Web3.providers.WebsocketProvider(ZmokRpc.Mainnet.Http))

    const subscriptionNewBlockHeaders = web3ws.eth.subscribe('newBlockHeaders', (err, res) => {
        if (err) console.error(err);
    })

    subscriptionNewBlockHeaders.on('data', async (blockHeader) => {

        try {

            console.log(`---------------BLOCKHEADER FOR BLOCK ${blockHeader.number} 
                        TIMESTAMP: ${blockHeader.timestamp} 
                        DateTime: ${new Date(blockHeader.timestamp*1000)} --------------------------
                        Current Time: ${new Date(Date.now())}`)
            let tx = await web3Read.eth.getTransactionReceipt('0x8544eac09dc26ab8eddf524d2cf5b6ed8c64d5c5fd9c9fea411bbf528d516d38');
            const blockNumber = blockHeader.number;
            // let blockTxs;
            let _transactions = [];
            await web3Read.eth.getBlock(blockHeader.number).then(async (block) => {
                let transactions;
                console.log(block)
                if (block) {
                    const {transactions} = block;
                    _transactions = transactions;
                    transactions.forEach(async (txHash, index)=> {
                        setTimeout(async ()=>{
                            let tx = await web3Read.eth.getTransactionReceipt('0x8544eac09dc26ab8eddf524d2cf5b6ed8c64d5c5fd9c9fea411bbf528d516d38');
                            if (tx != null) {
                                
                                let { from, hash, to } = tx;
                                console.log(tx)
                                //const signature = tx.input.substring(0,10)
    
                                //tracking dev wallet TXs
                                if (1==1) {
                                
                                    
                                    
                                    //` Found ${from} @ hash ${hash}`
                                    console.log(`From ${tx.from}`)
                                    console.log(`To: ${tx.to}`)
                                    console.log()
                                    //console.log(tx.logs)
                                    
                                    console.log(`Input: ${tx.input}`)
    
                                    //Uniswap V3 Router 2
                                                                    //console.log(tx.logs)
                                
                                if (tx.logs) {
                                    from = from.slice(2);
                                    to = to.slice(2);
                                    let sentCurrencyContract, sentCurrencyAmount,receivedCurrencyAmount,receivedCurrencyContract;
                                    //chop logs
                                    tx.logs = tx.logs.map(log=>{
                                        log.topics = log.topics.map(topic=>topic.slice(26))
                                        return log
                                    })
                                    
                                    let sentCurrencyLogs = tx.logs.filter(log=>{
                                        return log.topics.includes(from) && from == log.topics[1]
                                    })
                                    if (sentCurrencyLogs.length) {
                                        sentCurrencyContract = new web3Read.eth.Contract(tokenABI, sentCurrencyLogs[0].address);
                                        sentCurrencyAmount = web3Read.utils.hexToNumberString(sentCurrencyLogs[0].data)
                                    }
                                    let receivedCurrencyLogs = tx.logs.filter(log=>{
                                        return log.topics.includes(from) && from == log.topics[2] && !log.topics.includes(to)
                                    })
                                    if (receivedCurrencyLogs.length) {
                                        receivedCurrencyContract = new web3Read.eth.Contract(tokenABI, receivedCurrencyLogs[0].address);
                                        receivedCurrencyAmount = web3Read.utils.hexToNumberString(receivedCurrencyLogs[0].data)
                                    }

                                    console.log(sentCurrencyAmount,receivedCurrencyAmount)
                                    const sentCurrencyName = await sentCurrencyContract.methods.name().call();
                                    const sentCurrencyDecimals = await sentCurrencyContract.methods.decimals().call();
                                    const receivedCurrencyName = await receivedCurrencyContract.methods.name().call();
                                    const receivedCurrencyDecimals = await receivedCurrencyContract.methods.decimals().call();
                                    console.log('received n, d', receivedCurrencyName, receivedCurrencyDecimals)
                                    console.log('sent n,d', sentCurrencyName, sentCurrencyDecimals)
                                    sentCurrencyAmount = new BigNumber(sentCurrencyAmount) / 10**sentCurrencyDecimals
                                    receivedCurrencyAmount = new BigNumber(receivedCurrencyAmount) / 10**receivedCurrencyDecimals
                                    console.log(sentCurrencyAmount, receivedCurrencyAmount)

                                    if (tx.to == UniswapV3Router2) {
                                        console.log(tx.transactionHash, 'asfdjkl')
                                        bot.telegram.sendMessage(ctx.chat.id, 
`New Uniswap Transaction from ${tx.from}! 
Link: https://etherscan.io/tx/${tx.transactionHash}
Details: 
Sent: ${sentCurrencyAmount} ${sentCurrencyName}
Received: ${receivedCurrencyAmount} ${receivedCurrencyName}
Dextools: https://dextools.io/ether/pair-explorer/...
                                        
                                        
                                        
                                        `)
                                    } else if (tx.to == OneInchv5Router) {
                                        bot.telegram.sendMessage(ctx.chat.id, `New 1Inchv5 Transaction from ${tx.from}!
                                        https://etherscan.io/tx/${tx.transactionHash}`)
                                    } 
                                    else if (tx.to == KyberSwap) {
                                        bot.telegram.sendMessage(ctx.chat.id, `New KyberSwap Transaction from ${tx.from}
                                        https://etherscan.io/tx/${tx.transactionhash}`)
                                    } else {
                                        bot.telegram.sendMessage(ctx.chat.id, `New Transaction from ${tx.from}!
                                        https://etherscan.io/tx/${tx.transactionhash}
                                        
                                        Tx Input: ${tx.input}
                                        
                                        
                                        
                                        `)
                                        }
                                    }
                                    
                                }
                            }
                        }, index*2500)
                        
                    })
                }
            })
        }
        catch(e) {
            bot.telegram.sendMessage(ctx.chat.id,`Error in run application: ${`${e}`}`)
            console.log(e)
        }
    })
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
];

// unsubscribeNewBlockHeaders() {
// subscriptionNewBlockHeaders.unsubscribe((err: Error, success: boolean) => {
//     if (success) {console.log('Successfully unsubscribed')}
// })
