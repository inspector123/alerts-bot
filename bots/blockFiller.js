// Bot which backfills old or missing blocks using archive node.



import axios from 'axios'
import api from '../utils/axios.js'
import { BigNumber } from 'bignumber.js'
import { Telegraf } from 'telegraf';
import wallets from '../utils/wallets.js'
import UniV2FactoryABI from '../abi/uniswapFactoryABI.json' assert { type: "json" };
import { ethers } from "ethers"
import USDCABI from "../abi/usdcabi.json" assert { type: "json" };
import USDTABI from "../abi/usdtabi.json" assert { type: "json" };
import WETHABI from '../abi/wethabi.json' assert { type: "json" };
import DAIABI from '../abi/DAIABI.json' assert { type: "json" };
import univ3v2ABI from '../abi/univ3v2abi.json' assert { type: "json" };
import tokenABI from '../abi/tokenABI.json' assert { type: "json" };
import univ2PairABI from '../abi/univ2PairABI.json' assert { type: "json" };
import univ3PoolABI from '../abi/uniV3PoolABI.json' assert { type: "json" };
import KyberswapABI from '../abi/KyberswapABI.json' assert { type: "json" };
import basicTokenABI from '../abi/basicTokenABI.json' assert { type: "json" };
import swapParser from '../utils/swapParser.js'
import Constants from "../utils/constants.js"

const { daiContract, disallowedPools, disallowedSymbols, disallowedTo, 
    mevBot1, mevBot2, busdETH, USDCUSDT, v2USDTDAI, sushiswapUSDTv2, v3DAI_2, v2USDC, 
    pancakeUSDC, pancakeUSDT, v2USDT, v3_DaiUSDCv4, v3USDC, v3Usdt, v3DaiUsdt,
    KyberSwap, KyberSwapInBetweenContract, USDC, WETH, WBTC, FRAX, BUSD, DAI, USDT,
    acceptedRouters, botContracts, UniswapV3Router2, OneInchV4Router,OneInchv5Router,SushiSwapRouter, UniswapV2, StablesOrEth, apiKey } = Constants;
import SwapParser from '../utils/swapParser.js';

export class BlockFiller {

    chatId;
    archiveProvider;
    swapParser;


    constructor(chatId, archiveUrl) {
        this.chatId = chatId;
        this.archiveProvider = new ethers.providers.JsonRpcProvider(archiveUrl);
        this.swapParser = new SwapParser(archiveUrl);
        this.contractsSetup();
    }

    async contractsSetup() {
        

        this.WETH = new ethers.Contract(WETH, WETHABI, this.archiveProvider);
        this.USDC = new ethers.Contract(USDC, USDCABI, this.archiveProvider);
        this.USDT = new ethers.Contract(USDT, USDTABI, this.archiveProvider);
        this.DAI = new ethers.Contract(DAI, DAIABI, this.archiveProvider);

        await this.intervalGetPrice();

    }

    async fillBlocksFromBehind(blocks) {
        // step 1: get first blockNumber in your database.
        const response = await api.get(`/api/blocks/1?min=true`);
        const { minBlockNumber } = response.data.data[0];

        // for (let block = minBlockNumber - blockNumber; block < minBlockNumber; block++) {
        //     this.WETH.queryFilter("Deposit", )
        // }
        const time1 = Date.now();
        const wethDepositEvents = await this.WETH.queryFilter("Deposit", minBlockNumber-blocks,minBlockNumber-1);
        const wethWithdrawalEvents = await this.WETH.queryFilter("Withdrawal", minBlockNumber-blocks, minBlockNumber-1);
        const usdcEvents = await this.USDC.queryFilter("Transfer", minBlockNumber-blocks, minBlockNumber-1);
        const usdtEvents = await this.USDT.queryFilter("Transfer", minBlockNumber-blocks, minBlockNumber-1);
        const daiEvents = await this.DAI.queryFilter("Transfer", minBlockNumber-blocks, minBlockNumber-1);

        const allEvents = [wethDepositEvents, wethWithdrawalEvents, usdcEvents,usdtEvents,daiEvents]
        let uniqueEvents = [...new Map(allEvents.map((m) => [m.transactionHash, m])).values()].flat();
        uniqueEvents.forEach(event=>{
            this.swapParser.grabSwap(event, this.etherPrice, this.btcPrice);
        })
        
        const totalTime = Date.now()-time1;
        console.log(totalTime/1000);
        // console.log(queryFilterResponse_WETH);
        // con

    }

    async sendToApi() {

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
}