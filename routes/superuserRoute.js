const express = require('express');
const { signin } = require('../controller/superuserCtrl');
const router = express.Router();

router.post('/',signin);

module.exports = router;