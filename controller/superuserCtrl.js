const connection  = require('../database');
const bcrypt = require('bcrypt');
const { validationResult } = require('express-validator');

const signin = async(req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            await connection.rollback();
            res.apiResponse = {
                status: 'failed',
                statusCode: '400',
                message: 'Validation Failed',
                error : errors
            }
            next();
        };
        const { Name, Password, Role } = req.body;
        const hashpass = await bcrypt.hash(Password, 10)
        const data = {
            Name,
            Password: hashpass,
            Role
        };
        const sql = 'INSERT INTO superuser SET ?'
        const add = await connection.query(sql, data);
        await connection.commit();
        res.apiResponse = {
            status: 'success',
            message: 'User added Successfully',
        };
        next();

    } catch (error) {
        await connection.rollback();
        res.apiResponse = {
            status: 'failed',
            statusCode: 500,
            message: 'Something Failed!!!',
            error: error
        };
        next();
    };
};

const login = async (req, res, next) => {
    const { Name, Password } = req.body;
    try {
        const sql = 'SELECT * FROM superuser WHERE Name = ?'
        const rows = await connection.query(sql, Name);

        if (rows.length === 0) {
            res.apiResponse = {
                status: 'failed',
                statusCode: 400,
                message: 'User not Found',
            };
            return next();
        }

        const existingUser = rows[0];
        const matchPass = await bcrypt.compare(Password, existingUser.Password);
        if (!matchPass) {
            res.apiResponse = {
                status: 'failed',
                statusCode: 400,
                message: 'Password is Wrong',
            };
            return next();
        }

        res.apiResponse = {
            status: 'success',
            message: 'Login Successfully'
        };
        next();

    } catch (error) {
        await connection.rollback();
        res.apiResponse = {
            status: 'failed',
            statusCode: 500,
            message: 'Something Failed!!!',
            error: error.message,
        };
        next();
    }
};

module.exports = { signin, login }