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

bot.command('run',ctx=>{
    bot.telegram.sendMessage(-1001855095247,`Running...`)
    run(bot, ctx, wallets, chatId)
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

wallets = [
    "0xfed3d7216792066A442bbE2b3E1166F15Bdd334a",
    "0x01436EfC8f74d2Fb9EC1e7Bb9e7A073ae4C1De81",
    "0x02EDcE34b9dA220C862C8900f9839235bD0BE331",
    "0x05f6875132b910976ee165171b78D7965e0fBF5C",
    "0x06c10575Da3959F0702b2EFD911c8EE2307af5e0",
    "0x0760b489263A4bCD02415d3A5f765a5e09b05a0E",
    "0x0c87FcB7B8e7C1c55819c29A6abd86F336c032ff",
    "0x0cf0E9720Fe0523C91b4573E9C9A5B9d0054763F",
    "0x0d0b52d74b172ab650646B652360A92503752653",
    "0x0De80fdCdfc4908226F423AD787D729856013Bab",
    "0x125D8585a465D19C0fa0156c0a860986b0d74d42",
    "0x13e3923A151a4E95a17b65d9e697EA8258Cc8790",
    "0x1465A11Ccb4BBAF5F94608607dEfA78CEd27c9e6",
    "0x155aC5AdF389BC6b41b193260e7a6aad51907289",
    "0x15e1c55944b15cE71a51cE45caAd7cd7E73a045A",
    "0x181D196184FB475d3Eff07a5704d7888A61BC09A",
    "0x183959eD8D7ecaECd88D0Fe3f0af9DdE834B609e",
    "0x1987ACd303E390705A659d9B456f681F83C9bEf3",
    "0x1C5A1Ea0eC55Ee28277Db347569750461fb7b0Ae",
    "0x1E97CE0f3d182a280e2b9Db75d4415214474Fc39",
    "0x1EE634b1e917B9dcF1AF3B8f4945B8EFb3e24189",
    "0x1f6934c591361943b3695fEc80e6Ef03fA965BeB",
    "0x20051A00C2116bF74124F2E4EcCa788324cb534A",
    "0x214466D828d88e84a590c1f185d21a223BC571Ac",
    "0x21Ba83DcA6f9004E6c769eDAda617830015e8E63",
    "0x21F8dDE1E270850dBa37D489C97717fc0dA7Bb78",
    "0x2502586e18242A64FF01273eE81182F95A580918",
    "0x2627eCb2FaC325243c229BF79Aac26131EB1E59c",
    "0x270890b658c80222752c1985F8bF25867b1e304B",
    "0x27b16b6651437c3F7D43d8ABDe4A071f744e83c6",
    "0x2AB77580c22Dad9804120A4C26dbCF523d4c6FAE",
    "0x2BfAb5813b3c766E135dAA2483bF3A247Eea35d3",
    "0x2dabb756612a313f4e9Cb99A5ac3ff0f33D6347B",
    "0x2E24974dBDc9F29789aE10505E8a58Caab1Be638",
    "0x2e7aC529c264f2C2a4E94374d2AcA7E40559464b",
    "0x2e87DdD4c2ED7972B4fc603b82Aa595a9b1518FB",
    "0x2FaC67a0a53B8c455024809F7c75DF827BA35337",
    "0x3111d276765b9ADC48E735A81228eb50648ABD56",
    "0x39074B2b4434bf3115890094e1360e36d42ecbBd",
    "0x3dEa0e9ef7CbCECd97f6CbBD4175A7e55C4E3D88",
    "0x3e4966e46EEB03cAE2A4476cEFF1C2B562CD7306",
    "0x43464f6e18B322029Eb94fa2bA3618acdEcf62C6",
    "0x43b3336180B3512acc831cb8d8A4c69a989FB9A7",
    "0x44bF9C80D9FB6d5dfFc382C04340DBfBCbD1CB04",
    "0x45B6dB056D362E7dAC59e52165f5841ec88201ca",
    "0x46c124918CFDA29c79526f03BeeBa647a30C548A",
    "0x47cF0b0F692D69e817E06b9BEaDbA96FE763edAe",
    "0x48F47cAcFEDF1518ca6F8E097224b14399F524Dc",
    "0x49822BB99Ad8AE257df9ad2C2fDaE55684f3ab0F",
    "0x4b223f086ebC0b926B26F893508Eeb6D3922B00C",
    "0x4cE5B2cA5C7f467919a76cE32D1c173a47aADF00",
    "0x4D93367a8D8d2651Fe7BE025042098C6d700Bc59",
    "0x4DE0D11Fc72Db9E05b1Ed3C4A74363FF0EDA2B35",
    "0x4Df8c0721460505f66BB1dAF26df3640E476e523",
    "0x4ECCcf2A2c3f8a8a6Fd3c4f1f34a98d8C138546D",
    "0x4f0aAECb778473E83591885E1539e6D4A41c4AD1",
    "0x4F1B83Bc5CDbcE3Dc933022501Cb277dC1894593",
    "0x518bB649f440b30B3fc959A76B2f87E89e47A093",
    "0x528339625Fabd9e921bc54d12276548d806e344e",
    "0x528655e046085359dDC05CE3ce9bF7f44F0A6710",
    "0x53054252012d5FbD2cB8d5f21f3a1D61CBBe6045",
    "0x572A90844EAcdF0E5a5D7507d7DB585299f37943",
    "0x580b5A7687dEfc6A977D8D0d2be271D856d957Fa",
    "0x5aAa4b8442F2A70D3cdBE579F65bBc8D63500589",
    "0x5Aad9AF6234A17D2b2E143e022418f3a221ea4E7",
    "0x5C5566077C1e5A3f1a9E84Cf8A8C3735E3518b43",
    "0x5D83192b5A78a55b42d8f9d4cfdA6131d102e365",
    "0x5E0023780468125D51a74b200457F1Be1820a079",
    "0x5f318F9f25bc6a204648e2095CC72e6e13491a0C",
    "0x616EE10Ec814B7c7B9F08A749759B327D7E91355",
    "0x63C7623b21B1591Ab4a936947E41Cce672F743dD",
    "0x648851aA6c6fcDa74786824a961A78CB62e6438b",
    "0x657340f8F3187bB251700edE07140aaA93C08c35",
    "0x6693a48820e7f3Cb991B3B91ADb18ec7A3540Ad8",
    "0x6728317cC55BFB4Bd1F31Cd5C11af4d7aF2672ca",
    "0x68E0389f5678F1F15346a136d3E3096a84040c9c",
    "0x6939f1aF0A0Fba6B6cbFC7C92d4D95FeFf609486",
    "0x69E18aeb9a0CCAA8cb9bBC9c138fa68d8E194709",
    "0x6BAf9240AB6Ae4c08e52bdC4DFDbb738D38379D5",
    "0x6D0Be69c79dDd3b20Fd7aDb864f95198e2346431",
    "0x6E721EFC716cE8C61Bbc64BD132B93E5B8f97242",
    "0x6F59e4C4E49D848f86CDACd72b6c0CeC2e3086bD",
    "0x73225a55d13f2f49A0F9160185C558aEc4992f95",
    "0x738fb02BF04eca212ff06aC453F64351335e16eE",
    "0x74694619b98477D171AA39B4b2857e82c7D50DC9",
    "0x74afb95d6009aE84151C3B311154f0Fa98f0ED1b",
    "0x750D2291C172Ba2893975f0F47d6E023b50ae7f4",
    "0x77431448e4a27398bD7a1FA59608e64840fDAD09",
    "0x777C0c48d075bE588492a43dFaeff72df84C6da3",
    "0x797Dd4ed69d6d16293063e1d300787dbdD6A9080",
    "0x7a6f83812FF444a105F844114017D081551534BA",
    "0x7b456d8ba886Cb6ddaD6E487f93Ff405E458ABD9",
    "0x7B67615A9cc83c8291Ff4C0AA7Dc8f761710D771",
    "0x7eE7Ca94CBDF719B6e42254F521FD973b4E30c25",
    "0x7F5a98b17dAE11E0f6463A57221b9324Ca49Eed3",
    "0x7Ff7B5D9c57b582Fe8C37988a1335Df6A4411DBD",
    "0x8095085601781EA121A4057D5E59c64B94b21f67",
    "0x82565FE670CB58b8AD98B884334445FcDBc1900F",
    "0x831200292B72343b989f2b0d6D47387458cf5448",
    "0x83fa79A991DA40db1287089391E5091B0C6D2E19",
    "0x849379269311C1a8C7787435E7079ab803Cb32A0",
    "0x84ea2A031e88f43dE8744aF8ad9d2db41aE4EbA0",
    "0x852ea10e6a473538ecbcc78ad5A372AaA3Ca9dB9",
    "0x865DdA84a13a874d4c3688355220a787aC541685",
    "0x86d1372d7d5513e9dc41962DbbB212ee1b3cd62A",
    "0x87c5A7AAA44Db939A728cF05E31b8411A14b2579",
    "0x89d7724b810952F1F797A9B248e3391bD8b663d6",
    "0x8A416f3319067fa39f0ee16ba1fBCcF7a428DDF1",
    "0x8AE7d8C342b712f25b9AfCd911942845B1502731",
    "0x8c2d18745E40681B585ddC82D2665B9073505A82",
    "0x8d71B684F77971A93CD2494B61E30aaDdDf2bfEB",
    "0x8Dea68E74F20159bE3b053cf69825A715Bae7285",
    "0x8E49e23ec603d6D3382BE66B56c14ef6030642c4",
    "0x8E8D9D2CB1E9Ef808810441Bb753B430CBB1231C",
    "0x8F0592CadaAE3A976F462fA3fC4f0A7E76a30145",
    "0x9207efB648FF76b5Eb913ca095e6605329007262",
    "0x9260a1a14F0B717924Db87be79D395ccf940f457",
    "0x92e6a1F995eAd011B9d9A842EeE81D8B1ee874fc",
    "0x945Fd6604C7E52F25341570AdF7822d6d3A2E9d5",
    "0x945FF7f46D84879d6578666E62386b73429e7e74",
    "0x96FDb0b8C300231f6a85b209656eD0C7be1C92fD",
    "0x9706B1f577AaCdd20BC010a221cf1A3fB7f5d0aC",
    "0x9aa061b3a00106E787C166Ec510f530270a67f34",
    "0x9AE97D10942B99E69D91F07cB8b23930b40571fE",
    "0x9b0814d90ea4bCcD19d450166B35c446005d9fde",
    "0x9bFa7a8C6B710BAb45306Fd1B6fa3C9C608FFe7d",
    "0x9d95Fb84aD539213a26a042625cB46DB29C4B991",
    "0x9E7FBD1743C1a9e5fC67833206be37e6dfb1873e",
    "0x9F3Bc5C15C519984504Dfc185e0410388e533915",
    "0xA04638bA01d935D5740664903AeDB954770CC10a",
    "0xA192092036526d84D7c3BFb51a3a3a68E160EFE3",
    "0xA19754139453b423A605F88728193DCB5475Aa3b",
    "0xA363fD751A99469CF07201e13a6e40d3f9d8D72E",
    "0xA476395209C7e1B24E2b2D07bDe58343f5Da35D5",
    "0xA48215DD5F1590569f287Ee11a0D47bF1ee98425",
    "0xA4a93CE2C19899e2350c0741baBDD2C5E053a2Bb",
    "0xA7ff0998102919e86B94CD47b85249914Fe333ff",
    "0xA869cf3Aeed80c2F800d6dE265eB8cd4EAc7ea4E",
    "0xAB31B389565C80409096a5dCCD2D9BF8cdCd0C58",
    "0xab95D41730f18DeB552848121Eb237B6D20DC9b5",
    "0xabaD830bd69b2B4a661629594c06289101A9b68c",
    "0xAf75aFd1859Ab66cA6b705b8D7e356055D82dc4F",
    "0xB0e5Fca26530Bf1dF65cdE4d2f90eBB0a9D9cD80",
    "0xB2Ac386726cc9cb20609598e7B49A31c7eeD2336",
    "0xb404011065daf1F4C99F387141CD79bF3DAfcAc6",
    "0xB52084Dc529662079362c9dCDD0700667CD3CBe7",
    "0xb54B3af64645A06AbDbcD8CAA4365c44BebcCCa0",
    "0xB657111Ca34672af7658FB08A5692368A8bfF9e1",
    "0xBaD6aeC0041109c9BFAc3Bd8C4A6e6F99d6b64ac",
    "0xbb48e65DBD9d82B733D56CeDb4181bA6d0CE045C",
    "0xbCC159F12669E2310a649BC677f46CE4e00f05F5",
    "0xbd1D1B21AaAC8490F0a385cE9977Dc81e658aE03",
    "0xBd9b8156b74F2FB47FdAfBA42efA94AbDAD9D5F9",
    "0xBf45Fe64dFf0dffa6fa88ca8FE420F0d5735969B",
    "0xC0885039f684C27d6eCdB550084366bF3b0697Ff",
    "0xC0F0848385c1fC5629d30C9bB374f2EAdFD681EA",
    "0xC115c7A545284399a708d87bE435F4D4ed139906",
    "0xC4a5882d79aE758749E9A031BfDbF77D106D44EC",
    "0xC51cD7160045eCc2370aCA4accdD4604F09EC87C",
    "0xc79EFe95D2290D69a7C6D9Ec35C0377a3a528671",
    "0xcA055956c0751e789A61c47E48Bada24f9C10F45",
    "0xcA73C0d56e49e1Ba629DEFcfF007497630c3D926",
    "0xCB001734CF4b55F9BA43FF1f61c4C03BD0Dc9065",
    "0xcb303387BFc82D2995A8F694a21a5C9Aa29763Ac",
    "0xCB48238d0F658964b82C9cf1A21a1E84B584ca49",
    "0xcc47af9E29bB3b61820381F0bE35025f74B43cbE",
    "0xccF0dfD340Af3eb33ecB8F60f66604956D111FB8",
    "0xCd51D6BF4c4486A119dAFb910b1B26a40623683D",
    "0xcFC97Fb0A6D1fb14db4a7F62F9e3CafD7e5e22CA",
    "0xd043B2fA09D8259c55D8Bd2B5fd1Bf40B782Fe68",
    "0xd10de8a88Fd20B4a7ab589Dc25165852676c24ce",
    "0xd15aeFb267617b42d8F99f7916Bf892fCD6F6822",
    "0xd2Ff5e8b3565B864bf557B5a3C59de89636B1e06",
    "0xd3F6AA77e76F0C59dCEC2663b6004e79D5C58771",
    "0xd5aBa1957753354fE61a8962C1903E935a513fe8",
    "0xD6e97F4be3b433c1D8b43A7eD8db7Dfc8C4feC45",
    "0xD866dF63230f798940761e604AE745683b79BdC6",
    "0xd9536D18B7710be629Ebb7e7aAc91eAfc96Ef025",
    "0xda3bf4bAC3a23456B24049FF255771f13ef26a27",
    "0xdBe7C4f94A7Db068F6C611ed4948743D61FEc943",
    "0xdC7Cf74718321D647e550222c9B9955b7d8cE47e",
    "0xe00576Dfd6120f7E26239a6869d66371E2c6DF3d",
    "0xE215513f85adf65d6C058F4ff060B5Aa2F7647c3",
    "0xE6472133973da6b78d28E187F92273A3240f6182",
    "0xE778825c1322C94bD7C162309E61daA3aE0b2faA",
    "0xeaB774CD126e4FE51E52Ab09146C1457541Fe13A",
    "0xEB8985208D540b01Abea10b77946A35B22d1b295",
    "0xEdCBf00Aef6F3d9B62516487e8F9798A76d5D160",
    "0xeFfC9e242075A316b3cdB777befA3CbC7e3ecC2C",
    "0xF3A4303af4888d4882eA99565C0bB923921ca263",
    "0xF6eee975191cAC1bB0b50cF382Ffc2633538E258",
    "0xF74e934FA848B443538f6600f64a12b35Ccaa815",
    "0xf79519F556855017Dc4863DED43aC0d443066b84",
    "0xF9fbc068F49d253B8Af727e2eD83C2E53ED6966E",
    "0xFB0eB9D34bD83a86681e278216D7f85F8A918815",
    "0xFb3E4331282A4f43fe360DDAfa6D1dF62fE1ba9C",
    "0xfc0C781A0a78E6359CaE40b7021eB80604B5cd89",
    "0xfc98B38327204827e2eAaDbC17b6682bAD0ebeC1",
    "0xfE83e3d5096aD14c0AFB93047fa840bfC948f358"
    ]