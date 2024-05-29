const connection  = require('../database');
const bcrypt = require('bcrypt');
const { validationResult } = require('express-validator');

const signin = async(req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.apiResponse = {
                status: 'failed',
                statusCode: '400',
                message: 'Validation Failed',
                error : errors
            }
            next();
        };
        const { Id, Name, Password, Role } = req.body;
        const hashpass = await bcrypt.hash(Password, 10)
        const data = {
            Id,
            Name,
            Password: hashpass,
            Role
        };
        const sql = 'INSERT INTO superuser SET ?'
        const add = await connection.query(sql, data);
        res.apiResponse = {
            status: 'success',
            data: add
        };
        next();

    } catch (error) {
        console.log(error);
    }
};

module.exports = { signin }