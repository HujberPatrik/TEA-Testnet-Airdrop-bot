const express = require('express');
const { getAllStatusz, insertStatusz, deleteStatusz, updateStatusz } = require('../controllers/statusz.controller');
const router = express.Router();

router.get('/', getAllStatusz);
router.post('/', insertStatusz);
router.patch('/:id', updateStatusz);
router.delete('/:id', deleteStatusz);

module.exports = router;


