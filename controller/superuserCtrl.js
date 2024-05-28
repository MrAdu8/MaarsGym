const connection  = require('../database');
const bcrypt = require('bcrypt');

const signin = async(req, res, next) => {
    try {
        const { Id, Name, Password, Role } = req.body;
        if (!Id || !Name || !Password || !Role) {
            res.status(400).json({error: 'Name password or role is missing'});
        };
        const hashpass = await bcrypt.hash(Password, 10)
        const data = {
            Id,
            Name,
            Password: hashpass,
            Role
        };
        const sql = 'INSERT INTO superuser SET ?'
        const add = await connection.query(sql, data);

    } catch (error) {
        console.log(error);
    }
};

module.exports = { signin }