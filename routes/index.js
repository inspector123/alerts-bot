import express from 'express'
import { getBlock, updateBlockNumber, createBlock} from '../controllers/block';
import { getAllContracts, getContractByAddress, createContract, deleteContract, updateContract } from '../controllers/contract';
const router = express.Router();

//blocks table
router.route("/api/blocks")
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