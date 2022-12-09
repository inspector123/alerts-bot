import express from 'express'
import { getBlock, getAllBlocks, createBlock, deleteBlock } from '../controllers/block.js';
import { getAllContracts, getContractByAddress, createContract, deleteContract, updateContract } from '../controllers/contract.js';
const router = express.Router();

//blocks table
router.route("/api/blocks").get(getAllBlocks)
    .post(createBlock);

router.route("/api/blocks/:blockNumber")
    .get(getBlock)
    .delete(deleteBlock)

//contracts table
router.route("/api/contracts")
    .get(getAllContracts)
    .post(createContract);

router.route("/api/contracts/:address")
    .get(getContractByAddress)
    .put(updateContract)
    .delete(deleteContract);
export default router;