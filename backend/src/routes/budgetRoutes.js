const express = require('express');
const { calculate, getDestinationFoodMenu } = require('../controllers/budgetController');

const router = express.Router();

// Allow public budget calculation and food menu exploration
router.get('/food-menu', getDestinationFoodMenu);
router.post('/calculate', calculate);

module.exports = router;
