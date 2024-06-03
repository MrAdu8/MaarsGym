const connection  = require('../database');
const { validationResult } = require('express-validator');

const getNextAutoIncreament = async (connection) => {
    const result = await connection.query('SELECT AUTO_INCREMENT FROM information_schema.TABLES WHERE TABLE_SCHEMA = "jimdb" AND TABLE_NAME = "customer"');
    return result[0].AUTO_INCREMENT;
};

const generateCustomId = (prefix, year, id) => {
    return `${prefix}${year}${id.toString().padStart(6, '0')}`;
};

const newcustomer = async(req, res, next) => {
    try {
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
        const { Name, PhoneNo, Email, Address, MedicalCondition } = req.body;

        const year = new Date().getFullYear();
        const nextId = await getNextAutoIncreament(connection);
        const Id = generateCustomId('Maars', year, nextId);
        const data = {
            Id,
            Name,
            PhoneNo,
            Email,
            Address,
            MedicalCondition,
        };
        const sql = 'INSERT INTO customer SET ?'
        const add = await connection.query(sql, data);
        await connection.commit();
        res.apiResponse = {
            status: 'success',
            message: 'Customer added Successfully',
        };
        next();

    } catch (error) {
        console.log(error);
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

const oldcustomer = async (req, res, next) => {
    const { Id } = req.body;
    try {
        const oldcus = await connection.query('SELECT * FROM customer WHERE Id = ?', [Id]);
        res.apiResponse = {
            status: 'success',
            statusCode: 404,
            message: 'User Found',
            data: oldcus,
          }
          return next();

    } catch (error) {
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

const updatecustomer = async(req, res, next) => {
    try {
      await connection.beginTransaction();
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        await connection.rollback();
        res.apiResponse = {
          status: 'failed',
          statusCode: 404,
          message: 'your data is not validate, something is not correct !!',
          error: errors
        }
        next();
      }
  
      const id = req.params.id;
      const { Name, PhoneNo, Email, Address, MedicalCondition } = req.body;
      const updatedOn = new Date();
      const userData = {
        Name,
        PhoneNo,
        Email,
        Address,
        MedicalCondition,
      };
      const sqlData = "UPDATE customer SET ? WHERE Id = ?";
      const result = await connection.query(sqlData, [userData, id]);
      await connection.commit();
      res.apiResponse = {
        status: 'success',
        data: result
      };
      next();
    } catch (error) {
        console.log(error);
      await connection.rollback();
      res.apiResponse = {
        status: 'failed',
        statusCode: 500,
        message: 'Internal server error',
        error: 'You cannot access user data; something is wrong!!',
        data: error,
      };
      next();
    }
  };

module.exports = { newcustomer, oldcustomer, updatecustomer };