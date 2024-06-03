const express = require('express');
const { newcustomer, getcus } = require('../controller/EnquiryCtrl');
const router = express.Router();
const globalResponse = require('../helper/globalResponse');
const { body } = require('express-validator');

const validationUser = [
    body('Name').isLength({min: 3}).withMessage('Name Should be at least 3 characters'),
    body('PhoneNo').isLength({ min: 7, max: 15 }).withMessage('Phone number must be exactly 10 digits'),
    body('Email').isEmail().withMessage('Invalid email address'),
]

router.post('/', validationUser, newcustomer,  globalResponse );
router.get('/', getcus, globalResponse );

module.exports = router;