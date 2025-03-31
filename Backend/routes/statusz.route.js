
const express = require('express');
const router = express.Router();
const Statusz = require('../controllers/statusz.controller');

router.get('/statusz', Statusz.getAllStatusz);
router.post('/statuszHozzaad', Statusz.insertStatusz);
router.delete('/statuszTorol', Statusz.deleteStatusz);

module.exports = router;

    
