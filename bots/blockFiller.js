// Bot which backfills old or missing blocks using archive node.



import axios from 'axios'
import api from '../utils/axios.js'
import { BigNumber } from 'bignumber.js'
import { Telegraf } from 'telegraf';
import wallets from '../utils/wallets.js'
import UniV2FactoryABI from '../abi/uniswapFactoryABI.json' assert { type: "json" };
import { ethers, utils } from "ethers"
import USDCABI from "../abi/usdcabi.json" assert { type: "json" };
import USDTABI from "../abi/usdtabi.json" assert { type: "json" };
import WETHABI from '../abi/wethabi.json' assert { type: "json" };
import univ3v2ABI from '../abi/univ3v2abi.json' assert { type: "json" };
import tokenABI from '../abi/tokenABI.json' assert { type: "json" };
import univ2PairABI from '../abi/univ2PairABI.json' assert { type: "json" };
import univ3PoolABI from '../abi/uniV3PoolABI.json' assert { type: "json" };
import KyberswapABI from '../abi/KyberswapABI.json' assert { type: "json" };
import basicTokenABI from '../abi/basicTokenABI.json' assert { type: "json" };
import swapParser from '../utils/swapParser.js'


