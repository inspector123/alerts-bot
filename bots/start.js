import { Watcher } from './watcher.js'
import wallets from "./wallets.js"
const AlertBotKey = '5802732074:AAFOFJTQf97hZyXZvrkLbLcsKGStBQOlw4Y';
const VolumeBotKey = "5974906041:AAFGovND1cdDX3dPZ3TBgXnweO6Zv89oZAE";

const CHAT_ID_CHANNEL = -1001855095247;
const CHAT_ID_DISCUSSION = -1001874917769;

const Watcher = new Watcher(CHAT_ID_DISCUSSION, wallets, AlertBotKey, VolumeBotKey);

//send bot commands through watcher

//??

//