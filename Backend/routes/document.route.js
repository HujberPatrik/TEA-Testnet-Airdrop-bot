const express = require('express');
const router = express.Router();
const path = require('path');
const documentService = require('../documentService');

// Dokumentum generálása a fix sablonból
router.post('/generate', express.json(), async (req, res) => {
  try {
    const { data } = req.body;

    console.log('Kapott adatok:', data); // Debug

    if (!data) {
      return res.status(400).json({ error: 'Hiányzó adatok' });
    }
    
    // Fix sablon elérési útja
    const templatePath = path.join(documentService.templatesDir, 'engedelyezo.docx');
    
    const docBuffer = await documentService.generateDocument(templatePath, data);
    
    res.setHeader('Content-Disposition', `attachment; filename=${data.nev || 'engedelyezo'}.docx`);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.send(docBuffer);
  } catch (error) {
    console.error('Dokumentum generálás hiba:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;