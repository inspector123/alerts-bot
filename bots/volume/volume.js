import { Telegraf } from "telegraf"

const BOT_KEY = "5974906041:AAFGovND1cdDX3dPZ3TBgXnweO6Zv89oZAE"

const bot = new Telegraf(BOT_KEY);

bot.command('start', ctx => {
    bot.telegram.sendMessage(CHAT_ID, `Welcome. Hit /run to begin.`, {
    })
    
    
    

})