const express = require('express');
const { newcoupon, deletecoupon } = require('../controller/couponCtrl');
const router = express.Router();
const globalResponse = require('../helper/globalResponse');
const { body } = require('express-validator');

const validationUser = [
    body('Value').isLength({min: 3}).withMessage('Value should at least 3'),
    body('Name').isLength({ min: 3, max: 20 }).withMessage('Discount code at least 3 charater minium'),
    body('Type').isLength({min: 3}).withMessage('You have to do something'),
]

router.post('/', validationUser, newcoupon,  globalResponse );
router.delete('/', validationUser, deletecoupon,  globalResponse );

module.exports = router;