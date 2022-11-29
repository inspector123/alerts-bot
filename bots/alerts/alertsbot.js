import { Telegraf } from 'telegraf';
import { run } from './watch.js';

export class AlertBot {

    constructor(chatId) {
        this.chatId = chatId;
        this.wallets = wallets;
        bot.launch();
    }

    start = () => {
        bot.command('start', ctx => {
            bot.telegram.sendMessage(CHAT_ID, `Welcome. Hit /run to begin.`, {
            })
            
            
        
        })
    }

    run = () => {
        bot.command('run',ctx=>{

        bot.telegram.sendMessage(ctx.chat.id,`Running...`)
        run(bot, ctx, ctx.chat.id)
        })
    }
}
const bot = new Telegraf('5802732074:AAFOFJTQf97hZyXZvrkLbLcsKGStBQOlw4Y');

const CHAT_ID = -1001855095247;


bot.command('wallet_single', ctx => { 
    bot.telegram.
    bot.telegram.sendMessage(ctx.chat.id, 'Added single wallet', {
    })
    
    //run(bot, ctx, wallets)
})

bot.command('add_wallets', ctx=>{
    console.log(ctx.message)
    //addWallets(ctx);
    //run(bot, ctx, wallets)
})



const addWallets = (ctx) => {
    
    try {
        const newText = ctx.message.text.slice(13);

        const arr = newText.split(',').map(t=>t.replace(' ', ''))
        console.log(arr)
        wallets = [...wallets, ...arr]
        console.log(wallets)
        bot.telegram.sendMessage(ctx.chat.id, `New Wallets: ${wallets.reduce((i,j)=>`${i}, ${j}`)}`)
    } catch (e) {
        console.log(e)
        bot.telegram.sendMessage(ctx.chat.id, 'You fucked up adding the wallets, try again')
    }
}

