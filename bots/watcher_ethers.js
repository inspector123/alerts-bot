
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
import univ2PairABI from './abi/univ2PairABI.json' assert { type: "json" };
import univ3PoolABI from './abi/uniV3PoolABI.json' assert { type: "json" };
import KyberswapABI from './abi/KyberswapABI.json' assert { type: "json" };
import basicTokenABI from './abi/basicTokenABI.json' assert { type: "json" };
import { _TypedDataEncoder } from 'ethers/lib/utils.js';


//import { Interface } from 'ethers';

const apiKey = `3UNWDPMM65ARUPABPKM9MQXEAM3MYAATN6`;

//contracts for log.address filters
const USDC = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
const USDT = "0xdAC17F958D2ee523a2206206994597C13D831ec7";
const WETH = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
const DAI = "0x6B175474E89094C44Da98b954EedeAC495271d0F";
const BUSD = "0x4Fabb145d64652a948d72533023f6E7A623C7C53";
const FRAX = "0x853d955aCEf822Db058eb8505911ED77F175b99e"
const WBTC = "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599"
const StablesOrEth = [USDC,USDT,DAI,WETH,BUSD, FRAX, WBTC]

//routers
const UniswapV3Router2 = '0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45'
const OneInchv5Router = '0x1111111254EEB25477B68fb85Ed929f73A960582'
const KyberSwap = '0x617Dee16B86534a5d792A4d7A62FB491B544111E'
const UniswapV2 = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D"
const SushiSwapRouter = "0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F"
const KyberSwapInBetweenContract = "0x4Fe5b965E3BD76eFf36280471030ef9b0E6e2C1D"
const RainbowRouter = "0x00000000009726632680FB29d3F7A9734E3010E2"
//check for sushiswap / rainbow swap functions
const OneInchV4Router = "0x1111111254fb6c44bAC0beD2854e76F90643097d"
const ShibaSwap = "0x03f7724180aa6b939894b5ca4314783b0b36b329"
const coinbasewalletProxy0x = "0xe66b31678d6c16e9ebf358268a790b763c133750"
const _0xExchangeProxy = "0xdef1c0ded9bec7f1a1670819833240f027b25eff"
const paraswapAugustus = "0xdef171fe48cf0115b1d80b88dc8eab59176fee57"
const acceptedRouters = [UniswapV2, UniswapV3Router2,OneInchV4Router,OneInchv5Router,KyberSwap, SushiSwapRouter,RainbowRouter, coinbasewalletProxy0x, _0xExchangeProxy, paraswapAugustus]

const bigcapbot1="0xb7fd3575c614d8f2ffd50ce48c199b0aafa2c0bc"
const bigcapbot2="0x63af5004090c15a2df73e9b2a4064801ce70da30"
const botContracts= ["0xa612d7680a249581beDEE885ddCed743E8BCaa9e", "0x27dE7D1dEbaBBE7f63383F9A81793b3f19438321",bigcapbot1, bigcapbot2]

//Pools

const v3DaiUsdt = "0x6f48ECa74B38d2936B02ab603FF4e36A6C0E3A77"
const v3Usdt = "0x11b815efB8f581194ae79006d24E0d814B7697F6"
const v3USDC = "0x88e6A0c2dDD26FEEb64F039a2c41296FcB3f5640"
const v3_DaiUSDCv4 = "0x5777d92f208679DB4b9778590Fa3CAB3aC9e2168"
const v2USDT = "0x0d4a11d5EEaaC28EC3F61d100daF4d40471f1852"
const pancakeUSDT = "0x17C1Ae82D99379240059940093762c5e4539aba5"
const pancakeUSDC = "0x2E8135bE71230c6B1B4045696d41C09Db0414226"
const v2USDC = "0xB4e16d0168e52d35CaCD2c6185b44281Ec28C9Dc"
const v3DAI_2 = "0x60594a405d53811d3BC4766596EFD80fd545A270"
const sushiswapUSDTv2 = "0x06da0fd433C1A5d7a4faa01111c044910A184553"
const v2USDTDAI = "0xB20bd5D04BE54f870D5C0d3cA85d82b34B836405"
const USDCUSDT = "0x3416cF6C708Da44DB2624D63ea0AAef7113527C6"
const busdETH = "0xC2923b8a9683556A3640ccc2961B2F52B5C4459A"
const disallowedPools = [v3DaiUsdt,v3Usdt,v3USDC, v3_DaiUSDCv4, v2USDT, pancakeUSDT, pancakeUSDC, v2USDC, v3DAI_2, sushiswapUSDTv2, v2USDTDAI, USDCUSDT, busdETH]

const disallowedSymbols = ["BUSD", "USDT", "USDC", "DAI", "WETH"]


//Contracts
const mevBot1 = "0x000000000035b5e5ad9019092c665357240f594e"
const mevBot2 = "0xe8c060f8052e07423f71d445277c61ac5138a2e5"


const disallowedTo = [mevBot1, mevBot2, "0x00000000008c4fb1c916e0c88fd4cc402d935e7d"]

const daiContract = "0x6B175474E89094C44Da98b954EedeAC495271d0F"





export class Watcher {

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

    constructor(chatId, wallets, alertBotKey, volumeBotKey, testnet, httpUrl, wsUrl) {
        this.chatId = chatId;
        this.wallets = wallets;
        this.alertBot = new Telegraf(alertBotKey);
        this.volumeBot = new Telegraf(volumeBotKey);
        this.startBots();
        if (testnet) {
            console.log('testnet')
        } else {


            this.httpProvider = new ethers.providers.JsonRpcProvider(httpUrl);
            this.wsProvider = new ethers.providers.WebSocketProvider(wsUrl)
        }
        this.blocks = 0;
        this.runEthersBlockCheck();
    }
    async testRun() {
        await this.runVolumeCheck(5);
        
    }
    
    async sendToApi(previousBlockSwaps) {
                
        //const response = await api.post(`/api/blocks`, this.currentBlockSwaps).then(r=>console.log(r.status)).catch(e=>console.error(e));


        
        try {
            //Blocks
            let swaps = previousBlockSwaps.flat().filter(b=>b.blockNumber)
            
            
            for (let i in swaps) {
                const response = await api.post(`/api/blocks`, swaps[i])
            }
           
            
            

            // let contractsToPost;
            // //Contracts
            // let contracts = currentBlockSwaps.map(b=> {
            //     return {symbol: b.symbol,contract: b.contract,age: 0,volume5m: b.volume,volume15m: b.volume,volume1h: 0,volume1d: 0,avgBuy5M: 0,avgBuy15: 0,avgBuyH: 0,BuyRatio5: 0,BuyRatio15: 0,BuyRatioH: 0}

            // })
            // //but... you only want to post for volume15 if the contract is older than 15 minutes.
            // this.count5Blocks++;
            // this.count15Blocks++;
            // this.count60Blocks++;
            // if (this.count5Blocks == 5) contracts.volume5m = 0;
            // if (this.count15Blocks == 15) contracts.volume15m = 0;
            // if (this.count60Blocks == 60) contracts.volume1h = 0;
            // const { data : {data}} = await api.get(`/api/contracts`)
            // if (data.length) {
            //     const contractsArray = contracts.map(c=>c.contracts)
            //     const contractsToUpdate = data.filter(c=> contractsArray.includes(c.contract))
            //     contractsToUpdate.forEach(async c=> {
            //         await api.put(`api/contracts/${c.id}`, c).then(r=>console.log(r.data)).catch(e=>e.data)
            //     })
            //     const contractsToPost = data.filter(c=>!contractsArray.includes(c.contract)).map(c=>{
            //         delete c.id;
            //         return c
            //     });
            // } else {
            //     contracts = 
            // }

            // const result = await api.post(`/api/contracts`, contractsToPost).then(r=>console.log(r.data)).catch(e=>console.error(e.data));

            // ///interesting... use post\





            
            

            
            //const response = await api.post(`/api/contracts`, contracts).then(r=>console.log(r)).catch(e=>console.log(e))
        } catch (e) {
            console.log(e.response.data)
            this.previousBlockSwaps = []

        }

        this.currentBlockSwaps = [];
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


            if (this.currentBlockSwaps.length) {
                this.previousBlockSwaps = this.currentBlockSwaps;
                this.currentBlockSwaps = [];
                // console.log(this.previousBlockSwaps)
                await this.sendToApi(this.previousBlockSwaps);
                await this.sendToTelegram(this.previousBlockSwaps);
               // this.previousBlockSwaps = [];

            }


        })

        const _WETH = new ethers.Contract(WETH, WETHABI, this.httpProvider);
        const _USDC = new ethers.Contract(USDC, USDCABI, this.httpProvider);
        const _USDT = new ethers.Contract(USDT, USDTABI, this.httpProvider);
        //const _Kyberswap = new ethers.Contract(KyberSwap, KyberswapABI, this.httpProvider);
        //let i = 0;

        _WETH.on("Deposit", async (address, amount, event) => {
            
            if (this.blockTxHashes.includes(event.transactionHash)) {
                return;
            }
            this.blockTxHashes = [...this.blockTxHashes, event.transactionHash]

            if (address == UniswapV3Router2
                || address  == OneInchv5Router || address == UniswapV2 || address == OneInchV4Router || address == KyberSwapInBetweenContract) {
                    this.grabSwap(event);
                }
            

        })
        _WETH.on("Withdrawal", async (address, amount, event) => {
            if (this.blockTxHashes.includes(event.transactionHash)) {
                return;
            }
            this.blockTxHashes = [...this.blockTxHashes, event.transactionHash]
            if (address == UniswapV3Router2
                || address  == OneInchv5Router || address == UniswapV2 || address == OneInchV4Router || address == KyberSwapInBetweenContract) {
                    this.grabSwap(event);
                }

        })
        _USDC.on("Transfer", async (to,from,amount,event)=>{
            if (this.blockTxHashes.includes(event.transactionHash)) {
                return;
            }
            this.blockTxHashes = [...this.blockTxHashes, event.transactionHash]
            this.grabSwap(event);
            //const rcpt = await event.getTransactionReceipt();

        })
        _USDT.on("Transfer", async (to,from,amount,event)=>{
            if (this.blockTxHashes.includes(event.transactionHash)) {
                return;
            }
            this.blockTxHashes = [...this.blockTxHashes, event.transactionHash]
            this.grabSwap(event);
            
            //const rcpt = await event.getTransactionReceipt();

        })
//


    }
    async grabSwap(event){
        try {
            const receipt = await event.getTransactionReceipt();
            
            //return if kyberswap ; kyberswap will take care of it
            const addresses = receipt.logs.map(l=>l.address);
            
            if (!acceptedRouters.includes(receipt.to)) return {};
            
            const swapLogs = receipt.logs.filter(log=>log.data.length >= 258 && !disallowedPools.includes(log.address))
            if (swapLogs.length) {
                const v2Logs = swapLogs.filter(log=>log.data.length == 258 && log.topics.length == 3);
                const v3Logs = swapLogs.filter(log=>log.data.length == 322 && log.topics.length == 3);
                let allSwaps = []
               // console.log(swapLogs, 'swaplogs')
                if (v2Logs.length) {
                    //set up v2 pair
                    
                    const v2Swaps = await this.handlev2Logs(v2Logs, receipt);
                    allSwaps = [...allSwaps, v2Swaps].flat()
                    //this.currentBlockSwaps = [...allSwaps, v2Swaps]

                    


                }
                if (v3Logs.length) {
                    const v3Swaps = await this.handlev3Logs(v3Logs, receipt);
                    
                    allSwaps = [...allSwaps, v3Swaps].flat()
                    
                    
                }
                if (v3Logs.length && v2Logs.length) {
                    // console.log('sort v2&v3')
                    // allSwaps = allSwaps.sort((a,b)=>{
                    //     return a.usdVolume > b.usdVolume
                    // })
                    // allSwaps = allSwaps[0]
                   
                }
                this.currentBlockSwaps = [...this.currentBlockSwaps, allSwaps]
                //return allSwaps
            }
        } catch(e) {
            const receipt = await event.getTransactionReceipt();
            console.log(e, event.transactionHash, receipt.logs)
        }
    }
        

    async handlev2Logs(v2Logs, receipt) {
        let v2Swaps = []
        for (let i in v2Logs) {
            //blockObject
            const _interface = new utils.Interface(univ2PairABI);
            const _v2Pair = new ethers.Contract(v2Logs[i].address, univ2PairABI, this.httpProvider);
            //get swap log for v2
            const parsedLog = _interface.parseLog(v2Logs[i]);
            if (parsedLog && parsedLog.signature == 'Swap(address,uint256,uint256,uint256,uint256,address)') {
                //get tokens from pool interface
                const token0 = await _v2Pair.token0();
                const token1 = await _v2Pair.token1();
                if (StablesOrEth.includes(token0) && StablesOrEth.includes(token1)) return {};
                const poolToken = StablesOrEth.includes(token0) ? token0 : token1;
                const desiredToken = poolToken == token0 ? token1 : token0;
                //console.log(poolToken, desiredToken)
                
                //set up contracts
                const _desiredToken = new ethers.Contract(desiredToken, basicTokenABI, this.httpProvider);
                const _poolToken = new ethers.Contract(poolToken, basicTokenABI, this.httpProvider);
                //console.log(poolToken,desiredToken)

                
                //v2
                let details = {
                    poolTokenOut: 0,
                    poolTokenIn: 0,
                    desiredTokenIn: 0,
                    desiredTokenOut: 0
                }

                if (poolToken == token0) {
                    details.poolTokenOut = parsedLog.args.amount0Out,
                    details.poolTokenIn = parsedLog.args.amount0In,
                    details.desiredTokenIn = parsedLog.args.amount1In,
                    details.desiredTokenOut = parsedLog.args.amount1Out
                }
                else {
                    //poolToken = token1
                    details.desiredTokenIn = parsedLog.args.amount0In,
                    details.desiredTokenOut = parsedLog.args.amount0Out,
                    details.poolTokenIn = parsedLog.args.amount1In,
                    details.poolTokenOut = parsedLog.args.amount1Out
                }

                let transactionType,usdVolume = 0,usdPrice = 0, amountPoolTokenWithDecimals, amountDesiredTokenWithDecimals;

                //v3&v2
                const symbol = await _desiredToken.symbol();
                const totalSupply = await _desiredToken.totalSupply();
                const poolDecimals = await _poolToken.decimals();
                const desiredDecimals = await _desiredToken.decimals();
                const desiredSymbol = await _desiredToken.symbol();
                const poolSymbol = await _poolToken.symbol();
                const isStableCoin = [USDC,USDT,BUSD,DAI].includes(poolToken);
                const isWeth = poolToken == WETH;
                const isWBTC = poolToken == WBTC;
                //v2
                //possible scenarios
                /*
                amount1In 0, 2
                amount1Out 2,0
                amount0In 0, 2
                amount0Out 2,0
                */
                if (details.desiredTokenOut == 0 && details.poolTokenIn == 0)  { 
                    transactionType = 0;
                    amountPoolTokenWithDecimals = details.poolTokenOut / 10**poolDecimals
                    amountDesiredTokenWithDecimals = details.desiredTokenIn / 10**desiredDecimals
                    if (isStableCoin) {
                        usdVolume = amountPoolTokenWithDecimals;
                        usdPrice = amountPoolTokenWithDecimals / amountDesiredTokenWithDecimals;
                    } 
                    if (isWeth) {
                        usdVolume = amountPoolTokenWithDecimals * this.etherPrice;
                        usdPrice = amountPoolTokenWithDecimals / amountDesiredTokenWithDecimals * this.etherPrice;
                    }
                    if (isWBTC) {
                        usdVolume = amountPoolTokenWithDecimals * this.btcPrice;
                        usdPrice = amountPoolTokenWithDecimals / amountDesiredTokenWithDecimals * this.btcPrice;
                    }

                } else {
                    transactionType = 1;
                    amountPoolTokenWithDecimals = details.poolTokenIn / 10**poolDecimals;
                    amountDesiredTokenWithDecimals = details.desiredTokenOut / 10**desiredDecimals;
                    if (isStableCoin) {
                        usdVolume = amountPoolTokenWithDecimals
                        usdPrice = amountPoolTokenWithDecimals / amountDesiredTokenWithDecimals;
                    } 
                    if (isWeth) {
                        usdVolume = amountPoolTokenWithDecimals * this.etherPrice;
                        usdPrice = amountPoolTokenWithDecimals / amountDesiredTokenWithDecimals * this.etherPrice;
                    }
                    if (isWBTC) {
                        usdVolume = amountPoolTokenWithDecimals * this.btcPrice;
                        usdPrice = amountPoolTokenWithDecimals / amountDesiredTokenWithDecimals * this.btcPrice;
                    }
                }

                //v3


                    const v2SwapsToAdd = {
                        blockNumber: receipt.blockNumber,
                        symbol: `${desiredSymbol}`,
                        contract: desiredToken,
                        usdVolume: usdVolume,
                        usdPrice: usdPrice,
                        isBuy: transactionType,
                        txHash: receipt.transactionHash,
                        wallet: receipt.from,
                        router: this.routerName(receipt.to),
                        logIndex: v2Logs[i].logIndex,
                        v3Orv2: "v2",
                        isEpiWallet: wallets.includes(receipt.from) || wallets.includes(receipt.from.toLowerCase()),
                        etherPrice: this.etherPrice,
                        marketCap: usdPrice*totalSupply/10**desiredDecimals
                    }
                    v2Swaps = [...v2Swaps, v2SwapsToAdd]
                }
        }
        let sortedSwaps = v2Swaps.filter(s=>!disallowedSymbols.includes(s.symbol)).sort((a,b)=>{
            return a.usdVolume > b.usdVolume

        })
        if (sortedSwaps.length) return sortedSwaps
        else return []
    }
    async handlev3Logs(v3Logs, receipt) {
        try {
        
        let v3Swaps = []
        for (let i in v3Logs) {
            const _interface = new utils.Interface(univ3PoolABI);
            const _v3Pair = new ethers.Contract(v3Logs[i].address, univ2PairABI, this.httpProvider);
            //get swap log for v3
            let parsedLog;
            try {
                parsedLog = _interface.parseLog(v3Logs[i]);
            } catch(e) {
                console.log(e, parsedLog)
            }
             
            // console.log(parsedLog)
            if (parsedLog && parsedLog.signature == 'Swap(address,address,int256,int256,uint160,uint128,int24)') {
                //get tokens from pool interface
                console.log('asdf')
                const token0 = await _v3Pair.token0();
                const token1 = await _v3Pair.token1();
                if (StablesOrEth.includes(token0) && StablesOrEth.includes(token1)) return {};
                const poolToken = StablesOrEth.includes(token0) ? token0 : token1;
                const desiredToken = poolToken == token0 ? token1 : token0;
                let transactionType, usdVolume, usdPrice,amountPoolTokenWithDecimals, amountDesiredTokenWithDecimals;
                //set up contracts
                const _desiredToken = new ethers.Contract(desiredToken, basicTokenABI, this.httpProvider);
                const _poolToken = new ethers.Contract(poolToken, basicTokenABI, this.httpProvider);
                //console.log(parsedLog)
                let poolDecimals, desiredDecimals, desiredSymbol, totalSupply, poolSymbol;
                try {
                    poolDecimals = await _poolToken.decimals();
                    desiredDecimals = await _desiredToken.decimals();
                    desiredSymbol = await _desiredToken.symbol();
                    totalSupply = await _desiredToken.totalSupply();
                    poolSymbol = await _poolToken.symbol();
                } catch(e) {
                    console.log(e, parsedLog, poolToken, desiredToken)
                    return;
                }
                
                //console.log(desiredToken, poolToken, 'success')

                let details = {
                    desiredTokenAmount: 0,
                    poolTokenAmount: 0
                };
                if (desiredToken == token0) {
                    details.desiredTokenAmount = parsedLog.args.amount0,
                    details.poolTokenAmount = parsedLog.args.amount1
                    
                }
                else {
                    details.desiredTokenAmount = parsedLog.args.amount1,
                    details.poolTokenAmount = parsedLog.args.amount0
                }
                amountDesiredTokenWithDecimals = details.desiredTokenAmount / 10**desiredDecimals;
                amountPoolTokenWithDecimals = details.poolTokenAmount / 10 ** poolDecimals;
                const isStableCoin = [USDC,USDT,DAI,].includes(poolToken);
                const isWeth = poolToken == WETH;
                const isWBTC = poolToken == WBTC;
                
                if (details.desiredTokenAmount < 0) {
                
                    transactionType = 1;
                    if (isStableCoin) {
                        usdVolume = amountPoolTokenWithDecimals;
                        usdPrice = amountPoolTokenWithDecimals / -1*amountDesiredTokenWithDecimals;
                    } 
                    if (isWeth) {
                        usdVolume = amountPoolTokenWithDecimals  * this.etherPrice ;
                        usdPrice = (amountPoolTokenWithDecimals * this.etherPrice )/ -1*amountDesiredTokenWithDecimals;
                    }
                    if (isWBTC) {
                        usdVolume = amountPoolTokenWithDecimals  * this.btcPrice ;
                        usdPrice = (amountPoolTokenWithDecimals * this.btcPrice )/ -1*amountDesiredTokenWithDecimals;
                    }
                } 
                if (details.poolTokenAmount < 0) {
                    
                    transactionType = 0;
                    if (isStableCoin) {
                        usdVolume = -1*amountPoolTokenWithDecimals;
                        usdPrice = -1*amountPoolTokenWithDecimals / amountDesiredTokenWithDecimals;
                    } 
                    if (isWeth) {
                        usdVolume = -1*(amountPoolTokenWithDecimals ) * this.etherPrice;
                        usdPrice = -1*amountPoolTokenWithDecimals / amountDesiredTokenWithDecimals * this.etherPrice;
                    }
                    if (isWBTC) {
                        usdVolume = -1*(amountPoolTokenWithDecimals ) * this.btcPrice;
                        usdPrice = -1*amountPoolTokenWithDecimals / amountDesiredTokenWithDecimals * this.btcPrice;
                    }
                }
                //v3
                let marketCap;
                 try {
                    marketCap = usdPrice*totalSupply/10**desiredDecimals;
                 }catch(e) {
                    console.log(e)
                    marketCap = 0;
                 }
                const v3SwapsToAdd =
                {
                    blockNumber: receipt.blockNumber,
                    symbol: `${desiredSymbol}`,
                    contract: desiredToken,
                    usdVolume: usdVolume,
                    usdPrice: usdPrice,
                    isBuy: transactionType,
                    txHash: receipt.transactionHash,
                    wallet: receipt.from,
                    router: this.routerName(receipt.to),
                    logIndex: v3Logs[i].logIndex,
                    v3Orv2: "v3",
                    isEpiWallet: wallets.includes(receipt.from) || wallets.includes(receipt.from.toLowerCase()),
                    etherPrice: this.etherPrice,
                    marketCap,
                }
                
                v3Swaps = [...v3Swaps, v3SwapsToAdd]

            }
        }
        let sortedSwaps = v3Swaps.filter(s=>!disallowedSymbols.includes(s.symbol)).sort((a,b)=>{
            return a.usdVolume > b.usdVolume;
        })
        if (sortedSwaps.length) return sortedSwaps
        else return []
        }
        catch(e) {
            console.log('v3Logs error', e, v3Logs)
        }
    }
    // handleKyberSwapEvent(event) {
    //     this.blockTxHashes = [...this.blockTxHashes, event.transactionHash];
    //     return;
    // }

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
            case OneInchV4Router: 
                return "1InchV4";
            default: 
                return address;
        }
    }


    async getEtherPrice() {
        const url = `https://api.etherscan.io/api?module=stats&action=ethprice&apikey=${apiKey}`;
        
        await axios.get(url).then((r) => {
            if (r.data.status !== 0) {
                if (r.data.message != "NOTOK") {
                    this.etherPrice = parseInt(r.data.result.ethusd)
                    const {ethusd, ethbtc} = r.data.result;
                    console.log(r.data.result)
                    console.log(ethusd/ethbtc);
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
        this.volumeBot.launch();
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


