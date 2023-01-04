import { Watcher } from './bots/watcher_ethers.js'
import wallets from "./bots/wallets.js"
import express from "express"
import cors from "cors"
import router from './routes/index.js'
import AppError from "./utils/AppError.js";
import errorHandler from "./utils/errorHandler.js";
const AlertBotKey = '5802732074:AAFOFJTQf97hZyXZvrkLbLcsKGStBQOlw4Y';
const VolumeBotKey = "5974906041:AAFGovND1cdDX3dPZ3TBgXnweO6Zv89oZAE";
import bodyParser from 'body-parser'
const app = express();

app.use(bodyParser.json())
app.use(router);

app.use(cors());

app.all("*", (req, res, next) => {
 next(new AppError(`The URL ${req.originalUrl} does not exists`, 404));
});
app.use(errorHandler);
const PORT = 3000;
app.listen(PORT, () => {
 console.log(`server running on port ${PORT}`);
});


const CHAT_ID_CHANNEL = -1001855095247;
const CHAT_ID_DISCUSSION = -1001882676825;
const CHAT_ID_CHANNEL_BETA = -1001839931719;
const testnetStatus = false
const localNodeIp = "192.168.0.228"
const httpPort = "9535"
const wssPort = "9536"

const httpUrl = `http://${localNodeIp}:${httpPort}`
const wsUrl = `ws://${localNodeIp}:${wssPort}`

const watcher = new Watcher(CHAT_ID_CHANNEL, wallets, AlertBotKey, VolumeBotKey, testnetStatus, httpUrl, wsUrl);
//watcher.runVolumeCheck(1)