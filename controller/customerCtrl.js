require('dotenv').config();
const connection = require('../database');
const { validationResult } = require('express-validator');
const moment = require('moment');
const nodemailer = require('nodemailer');

const sendEmail = (email, message) => {
    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: process.env.MailId,
            pass: process.env.MailPass
        }
    });

    const mailOptions = {
        from: process.env.MailId,
        to: email,
        subject: 'Subscription Details',
        text: message
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
};

const newCustomer = async (req, res, next) => {
    try {
        await connection.beginTransaction();
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            await connection.rollback();
            res.apiResponse = {
                status: 'failed',
                statusCode: 400,
                message: 'Validation Failed',
                error: errors.array()
            };
            return next();
        }

        const { Name, PhoneNo, Email, Address, MedicalCondition, Fees, Coupon, months } = req.body;

        // Insert into customidgen table to get the next CustomId
        const customIdResult = await connection.query('INSERT INTO customidgen (Name) VALUES (?)', [Name]);

        // Check if customIdResult is valid
        if (!customIdResult || !customIdResult.insertId) {
            await connection.rollback();
            res.apiResponse = {
                status: 'failed',
                statusCode: 500,
                message: 'Failed to generate custom ID'
            };
            return next();
        }

        const customId = customIdResult.insertId;
        const year = new Date().getFullYear();
        const customerId = `Maars${year}${customId.toString().padStart(2, '0')}`;
        
        const customerData = {
            Id: customerId,
            Name,
            PhoneNo,
            Email,
            Address,
            MedicalCondition
        };
        const insertCustomerSql = 'INSERT INTO `customer` SET ?';
        await connection.query(insertCustomerSql, customerData);

        // Fetch couponId and Value from coupons table
        const couponResult = await connection.query('SELECT Id, Value FROM `coupon` WHERE Name = ?', [Coupon]);

        // Check if couponResult is valid
        if (!couponResult || couponResult.length === 0) {
            await connection.rollback();
            res.apiResponse = {
                status: 'failed',
                statusCode: 400,
                message: 'Invalid coupon code',
                data: {}
            };
            return next();
        }

        const couponData = couponResult[0];

        if (!couponData || !couponData.Id || !couponData.Value) {
            await connection.rollback();
            res.apiResponse = {
                status: 'failed',
                statusCode: 400,
                message: 'Invalid coupon data retrieved from database',
                data: {}
            };
            return next();
        }

        const couponId = couponData.Id;
        const couponValue = couponData.Value;
        const FinalAmount = parseFloat(Fees) - couponValue;

        // Insert into orders table
        const orderData = {
            CustomerId: customerId,
            CouponId: couponId,
            Total: parseFloat(Fees),
            Discount: couponValue,
            TotalAmount: FinalAmount,
        };
        const insertOrderSql = 'INSERT INTO `order` SET ?';
        await connection.query(insertOrderSql, orderData);

        // Calculate ValidUpto date
        const validUpto = moment().add(parseInt(months), 'months').format('YYYY-MM-DD');

        // Insert into subscriptions table
        const subscriptionData = {
            ValidUpto: validUpto,
            CustomerId: customerId,
        };
        const insertSubscriptionSql = 'INSERT INTO `subscription` SET ?';
        await connection.query(insertSubscriptionSql, subscriptionData);

        await connection.commit();

        // Fetch subscription details
        const [subscriptionDetailsResult] = await connection.query('SELECT * FROM `subscription` WHERE CustomerId = ?', [customerId]);
        
        if (!subscriptionDetailsResult || subscriptionDetailsResult.length === 0) {
            res.apiResponse = {
                status: 'failed',
                statusCode: 500,
                message: 'Failed to fetch subscription details',
                data: {}
            };
            return next();
        }
        
        const subscriptionDetails = subscriptionDetailsResult[0];

        // Send email
        const emailMessage = `Dear ${Name},\n\nRs.${FinalAmount} has been debited from your account to VPA on ${moment().format('DD-MM-YY')}. Your subscription is valid until ${validUpto}.\n\nIf you did not authorize this transaction, please report it immediately by calling 8689832158 Or SMS to 8689832158.\n\nWarm Regards,\nMaars Gym`;
        sendEmail(Email, emailMessage);

        res.apiResponse = {
            status: 'success',
            message: 'Customer, order, and subscription added successfully',
            data: subscriptionDetails
        };
        next();

    } catch (error) {
        console.log(error);
        await connection.rollback();
        res.apiResponse = {
            status: 'failed',
            statusCode: 500,
            message: 'Something Failed!!!',
            error: error.message
        };
        next();
    }
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

module.exports = { newCustomer, oldcustomer, updatecustomer };