import { Telegraf } from "telegraf"

const BOT_KEY = "5974906041:AAFGovND1cdDX3dPZ3TBgXnweO6Zv89oZAE"

const bot = new Telegraf(BOT_KEY);

bot.command('start', ctx => {
    bot.telegram.sendMessage(ctx.chat.id, `Welcome. Hit /run to begin.`, {
    })
    
    
    

})

//Every block get volume on a coin

//What does that mean?


//Get volume on all coins 

//Commands to get volume on coins for last 5m, 15m, 1m, 5 blocks, 10 blocks, 50 blocks...

//First start manual


//Minutely job, every block


//What are we doing every blocK? We get all the uniswap transactions...


//We get every transaction in each block. Filter by To Uniswap v3 router 2 and to 7a..488d


//OK... we are gonna have a class and we are gonna route through that.

//Based.

//wow, thats a lot lol. fuck me. 


