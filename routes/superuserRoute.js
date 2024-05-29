const express = require('express');
const { signin } = require('../controller/superuserCtrl');
const router = express.Router();
const globalResponse = require('../helper/globalResponse');
const { body } = require('express-validator');

const validationUser = [
    body('Name').isLength({min: 3}).withMessage('Name Should be at least 3 characters'),
    body('Password')
        .isLength({min:6}).withMessage('Password must be 6 characters long')
        .matches(/\d/).withMessage('Password must contain a number')
        .matches(/[a-zA-Z]/).withMessage('Password must contain a letter'),
    body('Role').isLength({min: 3}).withMessage('Role must not empty')
]

router.post('/', validationUser, signin, globalResponse);

module.exports = router;