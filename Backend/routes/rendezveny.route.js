const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/rendezveny.controller');
const { getAllKerveny, getKervenyById, insertKerveny, updateKerveny, updateKervenyStatus,saveCostsAndAdvance, getFamulusPricesByKervenyId ,getUniversityPricesByKervenyId,clearCostsForType} = require('../controllers/rendezveny.controller');

// Végpontok definiálása
router.get('/kerveny', ctrl.getAllKerveny);
router.get('/kerveny/:id', ctrl.getKervenyById);
router.get('/kerveny/famulus/:id', ctrl.getFamulusPricesByKervenyId);
router.get('/kerveny/egyetem/:id', ctrl.getUniversityPricesByKervenyId);
router.post('/kerveny', ctrl.insertKerveny);
router.put('/kerveny/:id', ctrl.updateKerveny);
router.patch('/kerveny/:id/status', ctrl.updateKervenyStatus);
router.post('/kerveny/:id/costs/commit', ctrl.saveCostsAndAdvance);

// DOCX letöltés endpoint (a router az appban /api alá van mountolva, ezért itt NEM kell /api)
router.get('/kerveny/egyetem/:id/docx', ctrl.downloadUniversityDocx);
router.get('/kerveny/egyetem/:id/docx-tags', ctrl.listUniversityDocxTags);

// Törlés endpoint
router.delete('/:id/costs', async (req, res) => {
  try {
    const { id } = req.params;
    const type = (req.query.type || '').toLowerCase(); // 'famulus' | 'uni'
    if (!['famulus', 'uni'].includes(type)) return res.status(400).json({ error: 'type must be famulus or uni' });
    await clearCostsForType(id, type);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;


