import express from 'express'
import * as controllers from '../controllers';
const router = express.Router();

router.route("/").get(controllers.getAllTodos).post(controllers.createTodo);
router
 .route("/:id")
 .get(controllers.getTodo)
 .put(controllers.updateTodo)
 .delete(controllers.deleteTodo);
module.exports = router;