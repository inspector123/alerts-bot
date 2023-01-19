import express from 'express'
import { getBlock, getAllBlocks, createBlock, deleteBlock, getMinBlockNumber } from '../controllers/block.js';
import { getAllContracts, createContracts, deleteContract, updateContract } from '../controllers/contract.js';
import { createPair, getPairByPairAddress } from '../controllers/pair.js';
const router = express.Router();
//


//blocks table
router.route("/api/blocks").get(getAllBlocks)
    .post(createBlock);

router.route("/api/blocks/:blockNumber")
    .get(getBlock)
    .get(getMinBlockNumber)
    .delete(deleteBlock)


//contracts table
router.route("/api/contracts")
    .get(getAllContracts)
    .post(createContracts);

router.route("/api/contracts/:id")
    .put(updateContract)
    .delete(deleteContract);

 
//PAIRS

router.route("/api/pairs")
.post(createPair);

router.route("/api/pairs/:pairAddress")
.get(getPairByPairAddress)


export default router;