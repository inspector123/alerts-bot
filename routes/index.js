import express from 'express'
import { getBlock, createBlock, deleteBlock } from '../controllers/block';
import { getContractByAddress, createContract, deleteContract, updateContract } from '../controllers/contract';
const router = express.Router();

router.route("/").get(controllers.getAllTodos).post(controllers.createTodo);
router
 .route("/:id")
 .get(controllers.getTodo)
 .put(controllers.updateTodo)
 .delete(controllers.deleteTodo);
module.exports = router;