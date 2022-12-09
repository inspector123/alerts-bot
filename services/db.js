import mysql from 'mysql';
const conn = mysql.createConnection({
 host: "localhost",
 user: "ethDBUser",
 password: "lengthallowopen123A!",
 database: "eth_swaps",
});

conn.connect();

export default conn;