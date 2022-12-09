import mysql from 'mysql';
const conn = mysql.createConnection({
 host: "localhost",
 user: "root",
 password: "",
 database: "eth_swaps",
});

conn.connect();

export default conn;