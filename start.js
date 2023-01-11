import { BlockPoster } from './bots/blockPoster.js'
import * as dotenv from 'dotenv'
import { BlockFiller } from './bots/blockFiller.js'
import wallets from "./utils/wallets.js"
import express from "express"
import cors from "cors"
import router from './routes/index.js'
import AppError from "./utils/AppError.js";
import errorHandler from "./utils/errorHandler.js";
import bodyParser from 'body-parser'

dotenv.config();
const AlertBotKey = process.env.ALERT_BOT_KEY;
const app = express();

app.use(bodyParser.json())
app.use(router);

app.use(cors());

app.all("*", (req, res, next) => {
 next(new AppError(`The URL ${req.originalUrl} does not exist`, 404));
});
app.use(errorHandler);
const PORT = 3000;
app.listen(PORT, () => {
 console.log(`server running on port ${PORT}`);
});


const CHAT_ID_CHANNEL = -1001855095247;
const CHAT_ID_DISCUSSION = -1001882676825;
const CHAT_ID_CHANNEL_BETA = -1001839931719;
const CHAT_ID_BETA_TEST = -896152552
const testnetStatus = false
const fullNodeIp = "192.168.0.228"
const archiveNodeIp = "192.168.0.155"
const httpPort = "9535"
const chatId = CHAT_ID_BETA_TEST;
//const wssPort = "9536" not using wss atm

const fullNodeUrl = `http://${fullNodeIp}:${httpPort}`
const archiveUrl = `http://${archiveNodeIp}:${httpPort}`

const blockPoster = new BlockPoster(chatId, wallets, AlertBotKey, fullNodeUrl, archiveUrl);
blockPoster.start();

// const blockFiller = new BlockFiller(chatId, archiveUrl);
// blockFiller.fillBlocksFromBehind(1000);