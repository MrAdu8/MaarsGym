require('dotenv').config();
const mysql = require('mysql');
const util = require('util');

var connection = mysql.createConnection({
    host: process.env.host,
    user: process.env.user,
    password: process.env.password,
    database: process.env.database,
});

connection.connect(function(error) {
    if (!!error) {
        console.log(error);
    } else {
        console.log('Database Connected Successfully :)');
    }
});

connection.query = util.promisify(connection.query);

module.exports = connection;