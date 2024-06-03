const connection  = require('../database');
const { validationResult } = require('express-validator');

const newcustomer = async(req, res, next) => {
    try {
      await connection.beginTransaction();
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            await connection.rollback();
            res.apiResponse = {
                status: 'failed',
                statusCode: 404,
                message: 'Validation Failed',
                error : errors
            }
            next();
        };
        const { Name, PhoneNo, Email } = req.body;
        const data = {
            Name,
            PhoneNo,
            Email,
        };
        const sql = 'INSERT INTO enquiry SET ?'
        const add = await connection.query(sql, data);
        await connection.commit();
        res.apiResponse = {
            status: 'success',
            message: 'Customer added Successfully',
            data: add
        };
        next();

    } catch (error) {
        await connection.rollback();
        res.apiResponse = {
            status: 'failed',
            statusCode: 500,
            message: 'Something Failed!!!',
            data: error
        };
        next();
    };
};

const getcus = async (req, res, next) => {
    const { Name } = req.body;
    try {
        const Ecustomer = await connection.query('SELECT * FROM enquiry WHERE Name = ?', [Name]);
        res.apiResponse = {
            status: 'success',
            statusCode: 200,
            message: 'User Found',
            data: Ecustomer,
          }
          return next();

    } catch (error) {
        res.apiResponse = {
            status: 'failed',
            statusCode: 500,
            message: 'Something Failed!!!',
            error: error
        };
        next();
    }
};

module.exports = { newcustomer, getcus };