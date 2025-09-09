const express = require('express');
const { getAllKerveny, getKervenyById, insertKerveny, updateKerveny, updateKervenyStatus } = require('../controllers/rendezveny.controller');
const router = express.Router();

// Végpontok definiálása
router.get('/kerveny', getAllKerveny);
router.get('/kerveny/:id', getKervenyById);
router.post('/kerveny', insertKerveny);
router.put('/kerveny/:id', updateKerveny);
router.patch('/kerveny/:id/status', updateKervenyStatus);

module.exports = router;


