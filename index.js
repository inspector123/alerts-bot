import { Telegraf } from 'telegraf';
import { run } from './watch.js';
const bot = new Telegraf('5802732074:AAFOFJTQf97hZyXZvrkLbLcsKGStBQOlw4Y');
let wallets = [];
bot.command('start', ctx => {
    console.log(ctx.from)
    bot.telegram.sendMessage(ctx.chat.id, `Welcome. Run /add_wallets followed by comma separated list of wallets,
        then hit /run.
        Pls note this runs on my server, so it's not the next etherdrops, just my own thing.
        `, {
    })
    
    

})

bot.command('wallet_single', ctx => { 
    bot.telegram.sendMessage(ctx.chat.id, 'Added single wallet', {
    })
    
    //run(bot, ctx, wallets)
})

bot.command('add_wallets', ctx=>{
    console.log(ctx.message)
    addWallets(ctx);
    //run(bot, ctx, wallets)
})

bot.command('run',ctx=>{
    bot.telegram.sendMessage(ctx.chat.id,`Running...`)
    run(bot, ctx, wallets)
})

bot.launch();

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



