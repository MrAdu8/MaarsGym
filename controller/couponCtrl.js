const connection  = require('../database');
const { validationResult } = require('express-validator');

const newcoupon = async(req, res, next) => {
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
        const { Value, Name, Type } = req.body;
        const data = {
            Value,
            Name,
            Type
        };
        const sql = 'INSERT INTO coupon SET ?'
        const add = await connection.query(sql, data);
        await connection.commit();
        res.apiResponse = {
            status: 'success',
            message: 'Coupon added Successfully',
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

const deletecoupon = async (req, res, next) => {
    const { Name } = req.body;
    try {
        await connection.beginTransaction();
        const sql = 'DELETE FROM coupon WHERE Name = ?';
        const deleteC = await connection.query(sql, [Name]);
        if (deleteC.affectedRows === 0) {
            await connection.rollback();
            res.apiResponse = {
                status: 'failed',
                statusCode: 400,
                message: 'Coupon not found',
            };
            return next();
        }
        await connection.commit();
        res.apiResponse = {
            status: 'success',
            statusCode: 200,
            message: 'User Deleted Successfully',
            data: deleteC,
          }
          return next();

    } catch (error) {
        console.log(error);
        await connection.rollback();
        res.apiResponse = {
            status: 'failed',
            statusCode: 500,
            message: 'Something Failed!!!',
            error: error
        };
        next();
    }
};

module.exports = { newcoupon, deletecoupon };