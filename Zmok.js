export const ZmokRpc = {
    MainnetArchive: {Http:'http://api.zmok.io/archive/ddrxnhgtnvivsmkj',Wss:"", Https:'https://api.zmok.io/archive/ddrxnhgtnvivsmkj'},
    Mainnet:{Http:'https://api.zmok.io/mainnet/4pjcsinknvgzqloz',Wss:"wss://api.zmok.io/mainnet/4pjcsinknvgzqloz", Https:'https://api.zmok.io/mainnet/dr6hhpfzbdbw02tt'},
    Ropsten:{Http:'https://nd-956-261-887.p2pify.com/3514e113ffeec96265dbadd4d269618f',Wss:"wss://ws-nd-956-261-887.p2pify.com/3514e113ffeec96265dbadd4d269618f", Https:'https://nd-956-261-887.p2pify.com/3514e113ffeec96265dbadd4d269618f'},
    Frontrun: {Http:'http://api.zmok.io/fr/cazc7ppjlx8q04t1',Wss:"wss://api.zmok.io/fr/cazc7ppjlx8q04t1", Https:'https://api.zmok.io/fr/cazc7ppjlx8q04t1'},
    Rinkeby: {Http: 'https://nd-124-352-437.p2pify.com/0994e8509acdbcd17fd085032fa03ba2', Wss: 'wss://ws-nd-124-352-437.p2pify.com/0994e8509acdbcd17fd085032fa03ba2', Https: 'https://nd-124-352-437.p2pify.com/0994e8509acdbcd17fd085032fa03ba2' },
    Goerli: {Http: "", Wss: ""}
}
export const Chainstack = {
    Mainnet: "https://nd-462-099-449.p2pify.com/266dfa17d54ddcfb2a4382498c4aedc9",
    Testnet: "https://nd-956-261-887.p2pify.com/3514e113ffeec96265dbadd4d269618f",
    Rinkeby: "https://nd-124-352-437.p2pify.com/0994e8509acdbcd17fd085032fa03ba2"
}


/* notes

//other... for getPair();
const UniV2FactoryAddress = "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f"

/testnet stuff
//const WETHRopsten = "0xc778417E063141139Fce010982780140Aa0cD5Ab"
    //weth to pepebet
    //0xb76d3c3e4aeb2bb399be4a4510c28a60ed9b453b009d404ab07e05fb4afd5dda

    //pepebet to weth
    //0x15561e64745c81d4c5927044373027117219eab3e5ce78261144027a32c1e8d4

    //usdc to pepebet
    //0x8544eac09dc26ab8eddf524d2cf5b6ed8c64d5c5fd9zc9fea411bbf528d516d38

    //usdt to pepebet
    //0x3a0fed98c8e96c6c41cb13a51cc8b5faa5dddefd0d7e3fa913d66f5bcbe39c9b

    //pepebet to usdt
    //0x57e36692a244acb165b0993dcbc085f536931c26834829dcc14319c4fb5b68df



CREATE TABLE block(id int NOT NULL AUTO_INCREMENT,
block int NOT NULL,
symbol varchar(50) NOT NULL,
contract varchar(50) NOT NULL,
amount varchar(50) NOT NULL,
volumeUSD int NOT NULL,
type varchar(50) NOT NULL,
timestamp varchar(50) NOT NULL,
PRIMARY KEY (id)
);

CREATE TABLE Contract(id int NOT NULL AUTO_INCREMENT,
symbol varchar(50) NOT NULL,
decimals varchar(50) NOT NULL,
contract varchar(50) NOT NULL,
age varchar(50) NOT NULL,
volume5m varchar(50) NOT NULL,
volume15m varchar(50) NOT NULL,
volume1h varchar(50) NOT NULL,
volume1d varchar(50) NOT NULL,
PRIMARY KEY (id)

);
CREATE TABLE BlockEvents(id int NOT NULL AUTO_INCREMENT,
blockNumber VARCHAR(100),
symbol VARCHAR(100),
contract VARCHAR(100),
usdVolume double,
usdPrice double,
isBuy VARCHAR(100),
txHash VARCHAR(100),
wallet VARCHAR(100),
router VARCHAR(100),
logIndex VARCHAR(100),
v3Orv2 VARCHAR(100), 
isEpiWallet VARCHAR(100),
etherPrice double,
PRIMARY KEY(id)
);

    const body = req.body.map(c=>{
        const length = Object.values(c).length * 2;
        return Array(2).fill(Object.values(c)).flat(); 
    })
    // let duplicateKeyUpdate = conn.query(`INSERT INTO table (symbol,contract,age,volume5m,volume15m,volume1h,volume1d,avgBuy5,avgBuy15,avgBuyH,BuyRatio5,BuyRatio15,BuyRatioH)
    // VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?) 
    // ON DUPLICATE KEY
    //     UPDATE symbol= ?,contract= ?,age= ?,volume5m= ?,volume15m= ?,volume1h= ?,volume1d= ?,avgBuy5= ?,avgBuy15= ?,avgBuyH= ?,BuyRatio5= ?,BuyRatio15= ?,BuyRatioH= ?;
    // `.repeat(req.body.length), body)
*/

