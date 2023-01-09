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
    KyberSwap, KyberSwapInBetweenContract, USDC, WETH, WBTC, FRAX, BUSD, DAI, USDT, wstETH,
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
        
        const blockNumber = await this.archiveProvider.getBlockNumber();

        console.log(`latest archive block: ${blockNumber}`)
    }

    async fillBlocksFromBehind(blocks) {
        // step 1: get first blockNumber in your database.
        const iterations = blocks/1000
        if (!Number.isInteger(blocks/1000)) {console.log('Not Integer'); return;}
        for (let i = 0; i < iterations; i++) {
            const response = await api.get(`/api/blocks/1?min=true`);
            const { minBlockNumber } = response.data.data[0];
            console.log('starting block: ', minBlockNumber)

            // for (let block = minBlockNumber - blockNumber; block < minBlockNumber; block++) {
            //     this.WETH.queryFilter("Deposit", )
            // }
            const time1 = Date.now();
            // const wethDepositEvents = await this.WETH.queryFilter()
            // let _events = []
            // for (let j = 1; j < 1000; j++) {
            //     let _events = await this.WETH.queryFilter("Withdrawal", minBlockNumber-j-1, minBlockNumber-j);
            //     _wethWithdrawalEvents = [..._wethWithdrawalEvents , _events]
            // }
            // const wethWithdrawalEvents = await this.WETH.queryFilter("Withdrawal", minBlockNumber-1000, minBlockNumber-1);
            // console.log(_wethWithdrawalEvents.slice(0,10))
            // console.log(wethWithdrawalEvents.flat().length, _wethWithdrawalEvents.flat().length)
            // console.log(_wethWithdrawalEvents.flat().map(b=>b.blockNumber).sort((a,b)=>a-b))
            const v3topic = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("Swap(address,address,int256,int256,uint160,uint128,int24)"))
            const v2topic = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("Swap(address,uint256,uint256,uint256,uint256,address)"))
            // const filter = {
            //     topics: [v2topic],
            //     fromBlock: minBlockNumber-1000,
            //     toBlock: minBlockNumber-999
            // }
            //  const test = await this.archiveProvider.getLogs(filter)
            // console.log(test)
            // let fromBlock, toBlock
            let swapLogs = [];
            for (let j = 0; j<1000; j++) {
                let fromBlock =  minBlockNumber - j - 1, toBlock = minBlockNumber-j;
                let _swapLogs = await this.archiveProvider.getLogs({topics:[[v2topic,v3topic]], fromBlock,toBlock})
                console.log(`${j} of 1000`)
                swapLogs = [...swapLogs, _swapLogs.flat()]




            }

            console.log(swapLogs.flat().filter(l=>!disallowedPools.includes(l.address)).length)
            // for (let k in swapLogs) {
            //     let parsedSwap = await this.swapParser.grabSwap(swapLogs[k]);
            //    // await this.sendToApiSingle(parsedSwap);
            // }
            const totalTime = Date.now()-time1;
            console.log(`time for next ${1000*iterations} blocks: ${totalTime/1000}`)
        }

    }

    async sendToApiSingle(swap) {
        try {
            if (!swap || swap == undefined || swap == {} || swap.usdPrice == undefined) return;
            const response = await api.post(`/api/blocks`, swap)
        } catch(e) {
            console.log('send single failed', e.response.data.err, swap)
        }
    }

    async sendToApi(swaps) {
        try {
            //Blocks
            if (!swaps || !swaps.length) return;
            let _swaps = swaps
            
            for (let i in _swaps) {
                const response = await api.post(`/api/blocks`, _swaps[i]);
            }
            this.swapParser.currentBlockSwaps = []
           
        } catch (e) {
            console.log(e)
            this.previousBlockSwaps = []

        }
    }


}