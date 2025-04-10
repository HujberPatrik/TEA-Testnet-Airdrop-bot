const express = require('express');
const { getAllStatusz, insertStatusz, deleteStatusz, updateStatusz } = require('../controllers/statusz.controller');
const router = express.Router();

router.get('/statusz', getAllStatusz);
router.post('/statusz', insertStatusz);
router.delete('/statusz', deleteStatusz);
router.put('/statusz/:id', updateStatusz); // Új PUT végpont

module.exports = router;


