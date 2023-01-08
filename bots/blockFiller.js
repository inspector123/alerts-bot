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

        const blockNumber = await this.archiveProvider.getBlockNumber();

        console.log(`latest archive block: ${blockNumber}`)

        await this.intervalGetPrice();

    }

    async fillBlocksFromBehind(blocks) {
        // step 1: get first blockNumber in your database.
        const iterations = blocks/1000
        if (!Number.isInteger(blocks/1000)) {console.log('Not Integer'); return;}
        for (let i = 0; i <= iterations; i++) {
            const response = await api.get(`/api/blocks/1?min=true`);
            const { minBlockNumber } = response.data.data[0];
            console.log('starting block: ', minBlockNumber)

            // for (let block = minBlockNumber - blockNumber; block < minBlockNumber; block++) {
            //     this.WETH.queryFilter("Deposit", )
            // }
            const time1 = Date.now();
            const wethDepositEvents = await this.WETH.queryFilter("Deposit", minBlockNumber-1000,minBlockNumber-1);
            const wethWithdrawalEvents = await this.WETH.queryFilter("Withdrawal", minBlockNumber-1000, minBlockNumber-1);
            const usdcEvents = await this.USDC.queryFilter("Transfer", minBlockNumber-1000, minBlockNumber-1);
            const usdtEvents = await this.USDT.queryFilter("Transfer", minBlockNumber-1000, minBlockNumber-1);
            const daiEvents = await this.DAI.queryFilter("Transfer", minBlockNumber-1000, minBlockNumber-1);

            const allEvents = [wethDepositEvents, wethWithdrawalEvents, usdcEvents,usdtEvents,daiEvents]
            let uniqueEvents = [...new Map(allEvents.map((m) => [m.transactionHash, m])).values()].flat();
            // uniqueEvents.forEach(async event=>{
            //     await this.swapParser.grabSwap(event, this.etherPrice, this.btcPrice);
            // })
            let swaps = []
            for (let j = 0; j < uniqueEvents.length; j++) {
                let blockSwaps = await this.swapParser.grabSwap(uniqueEvents[j],this.etherPrice,this.btcPrice)
                
                swaps = [...swaps, blockSwaps]
            }
            
            const totalTime = Date.now()-time1;
            await this.sendToApi(swaps)
            console.log(`time for next ${1000*iterations} blocks: ${totalTime/1000}`)
        }

    }

    async sendToApi(swaps) {
        try {
            //Blocks
            let _swaps = swaps.flat().filter(b=>b != undefined)
            
            for (let i in _swaps) {
                const response = await api.post(`/api/blocks`, _swaps[i]);
            }
            this.swapParser.currentBlockSwaps = []
           
        } catch (e) {
            console.log(e)
            this.previousBlockSwaps = []

        }
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