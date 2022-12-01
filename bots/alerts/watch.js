
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
const WETHAddress = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2".toLowerCase()

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


export const run = (bot, ctx, wallets, chatId) => {

    const walletsLowerCase = wallets.map(w=>w.toLowerCase());

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
            const blockNumber = blockHeader.number;
            let _transactions = [];
            await web3Read.eth.getBlock(blockHeader.number).then(async (block) => {
                //let transactions;
                //console.log(block)
                if (block) {
                    //const {transactions} = block;
                    let { transactions } = block;
                    _transactions = transactions;
                    //weth to pepebet
                    //0xb76d3c3e4aeb2bb399be4a4510c28a60ed9b453b009d404ab07e05fb4afd5dda

                    //pepebet to weth
                    //0x15561e64745c81d4c5927044373027117219eab3e5ce78261144027a32c1e8d4

                    //usdc to pepebet
                    //0x8544eac09dc26ab8eddf524d2cf5b6ed8c64d5c5fd9c9fea411bbf528d516d38

                    //usdt to pepebet
                    //0x3a0fed98c8e96c6c41cb13a51cc8b5faa5dddefd0d7e3fa913d66f5bcbe39c9b

                    //pepebet to usdt
                    //0x57e36692a244acb165b0993dcbc085f536931c26834829dcc14319c4fb5b68df

                    //1inch agix to weth
                    //0x6e9c18fcc16b5282ba040631edfffd0a5c688467a83175c8eb4910be4d841481
                    transactions.forEach(async (txHash, index)=> {
                        setTimeout(async ()=>{
                            let tx = await web3Read.eth.getTransactionReceipt(txHash);
                            if (tx != null) {
                                
                                let { from, hash, to } = tx;
                                if (walletsLowerCase.includes(tx.from.toLowerCase())) {
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
                                            const contract = new web3Read.eth.Contract(tokenABI, log.address)
                                            const symbol = await contract.methods.symbol().call();
                                            return {
                                                contract,
                                                symbol,
                                                amount: new BigNumber(web3Read.utils.hexToNumberString(log.data)) / 10**(await contract.methods.decimals().call())
                                                    }
                                        }))
                                        const swapReceive = await Promise.all(swapPairUserLogs.filter(log=>{
                                            return log.topics[2] == tx.from || (log.address == WETHAddress && log.topics[2] == tx.to)
                                        }).map(async log=> {
                                            const contract = new web3Read.eth.Contract(tokenABI, log.address)
                                            const symbol = await contract.methods.symbol().call();
                                            return {
                                                contract,
                                                symbol,
                                                amount: new BigNumber(web3Read.utils.hexToNumberString(log.data)) / 10**(await contract.methods.decimals().call())
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
                            }
                        }, index*300)
                        
                    })
                }
            }).catch(e=>console.log(e))
        }
        catch(e) {
            bot.telegram.sendMessage(chatId,`Error in run application: ${`${e}`}`)
            console.log(e)
        }
    })
}

const sendTelegramSwapMessage = (bot, chatId, tx, swapDetails,tokenPairContract, tokenContractAddress) => {
    if (tx.to.toLowerCase() == UniswapV3Router2) {
        bot.telegram.sendMessage(chatId, 
`New Transaction from \`${tx.from}\`! 
TX HASH: https://etherscan.io/tx/${tx.transactionHash}

Details: 
${swapDetails.received.length ? `Sent: ${swapDetails.sent.amount} ${swapDetails.sent?.symbol}` : ``}

${swapDetails.received.length ? `Received: ${swapDetails.received?.amount} ${swapDetails.received?.symbol}` : ``}
${tokenPairContract.length ? `Dextools: https://dextools.io/app/ether/pair-explorer/${tokenPairContract}` : ``}

${tokenPairContract.length ? `Contract Address: https://etherscan.io/token/${tokenContractAddress}` : ``}
Wallet Link: https://etherscan.io/address/${tx.from}
        
        
        
        `)
    } else if (tx.to == OneInchv5Router) {
        bot.telegram.sendMessage(chatId, `New 1Inchv5 Transaction from ${tx.from}!
        https://etherscan.io/tx/${tx.transactionHash}`)
    } 
    else if (tx.to == KyberSwap) {
        bot.telegram.sendMessage(chatId, `New KyberSwap Transaction from ${tx.from}
        https://etherscan.io/tx/${tx.transactionhash}`)
    } else {
        bot.telegram.sendMessage(chatId, `New Transaction from ${tx.from}!
        https://etherscan.io/tx/${tx.transactionhash}
        
        Tx Input: ${tx.input}
        
        
        
        `)
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