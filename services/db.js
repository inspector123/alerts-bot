import mysql from 'mysql2';
const conn = mysql.createConnection({
 host: "localhost",
 port: 3306,
 user: "ethDBUser",
 password: "789789789Aa!",
 database: "eth_swaps"
});

conn.connect((err, res) => {
    if (err) console.log(err);
    return;
});

export default conn;