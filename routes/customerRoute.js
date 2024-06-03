const express = require('express');
const { newcustomer, oldcustomer, updatecustomer } = require('../controller/customerCtrl');
const router = express.Router();
const globalResponse = require('../helper/globalResponse');
const { body } = require('express-validator');

const validationUser = [
    body('Name').isLength({min: 3}).withMessage('Name Should be at least 3 characters'),
    body('PhoneNo').isLength({ min: 7, max: 15 }).withMessage('Phone number must be exactly 10 digits'),
    body('Email').isEmail().withMessage('Invalid email address'),
    body('Address').isLength({min: 3}).withMessage('Role must not empty'),
    body('MedicalCondition').isLength({min: 2}).withMessage('Role must not empty'),
]

router.post('/', validationUser, newcustomer,  globalResponse );
router.get('/', oldcustomer,  globalResponse );
router.post('/:id', updatecustomer,  globalResponse );

module.exports = router;