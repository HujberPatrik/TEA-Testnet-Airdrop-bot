const express = require('express');
const { getAllKerveny, getKervenyById, insertKerveny } = require('../controllers/rendezveny.controller');
const router = express.Router();

// Végpontok definiálása
router.get('/kerveny', getAllKerveny);
router.get('/kerveny/:id', getKervenyById);
router.post('/kerveny', insertKerveny);

module.exports = router;


