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
            statusCode: '404',
            message: 'Something Failed!!!',
            error: error
        };
        next();
    };
};

const login = async (req, res, next) => {
    const { Name, Password } = req.body;
    try {
        const [ rows ] = await connection.query('SELECT * FROM superuser WHERE Name = ?', [Name]);
        const existingUser = rows;

        if (existingUser.length === 0 || !existingUser[0]) {
          res.apiResponse = {
            status: 'failed',
            statusCode: 200,
            message: 'User not Found',
          }
          return next();
        };
        const matchpass = await bcrypt.compare(Password, existingUser[0].Password);
        if (!matchpass) {
            res.apiResponse = {
              status: 'failed',
              statusCode: 200,
              message: 'Password is wrong',
            }
            return next();
          };

    } catch (error) {
        await connection.rollback();
        res.apiResponse = {
            status: 'failed',
            statusCode: '404',
            message: 'Something Failed!!!',
            error: error
        };
        next();
    }
};

module.exports = { signin, login }