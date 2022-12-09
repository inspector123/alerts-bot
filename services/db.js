import mysql from 'mysql2';
const conn = mysql.createConnection({
 host: "192.168.0.178",
 port: 3306,
 user: "ethDBUser",
 password: "lengthallowopen123A!",
 database: "eth_swaps"
});

conn.connect();

export default conn;