import { Watcher } from './bots/watcher.js'
import wallets from "./bots/wallets.js"
const AlertBotKey = '5802732074:AAFOFJTQf97hZyXZvrkLbLcsKGStBQOlw4Y';
const VolumeBotKey = "5974906041:AAFGovND1cdDX3dPZ3TBgXnweO6Zv89oZAE";

const CHAT_ID_CHANNEL = -1001855095247;
const CHAT_ID_DISCUSSION = -1001882676825;

const watcher = new Watcher(CHAT_ID_DISCUSSION, wallets, AlertBotKey, VolumeBotKey, false);

//send bot commands through watcher

//??

//