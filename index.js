const { Telegraf } = require('telegraf');

const bot = new Telegraf('5802732074:AAFOFJTQf97hZyXZvrkLbLcsKGStBQOlw4Y');

bot.command('start', ctx => {
    console.log(ctx.from)
    bot.telegram.sendMessage(ctx.chat.id, 'hello there! Welcome to my new telegram bot.', {
    })
    setTimeout(()=>bot.telegram.sendMessage(ctx.chat.id, 'check this out!! a thing happened!!!!'), 10000)
})

bot.launch();
