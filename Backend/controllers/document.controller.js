const path = require('path');
const {
  templatesDir,
  ensureDocxName,
  renderDocx,
  buildUfOfferData,
  generateByTemplateName
} = require('../documentService');

exports.postGenerate = async (req, res) => {
  try {
    const { data = {}, template, templateName, kervenyId } = req.body || {};
    const tpl = (template || templateName || '').trim();

    // Speciális: UF árajánlat -> a kerveny_koltseg táblából építjük a data-t
    if (tpl && tpl.toLowerCase() === 'uf_arajanlat_sablon') {
      const id = kervenyId || data?.id || data?.kerveny_id;
      if (!id) return res.status(400).json({ error: 'Hiányzó kervenyId az UF árajánlathoz.' });

      const prepared = await buildUfOfferData(id);
      const buf = await generateByTemplateName('UF_arajanlat_sablon', prepared);
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
      res.setHeader('Content-Disposition', `attachment; filename="UF_arajanlat_${id}.docx"`);
      return res.send(buf);
    }

    // Általános: megadott sablonnal (vagy default) renderelünk a kapott data-val
    const name = ensureDocxName(tpl || 'default_template');
    const templatePath = path.join(templatesDir, name);
    const buf = await renderDocx(templatePath, data);

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', `attachment; filename="${name}"`);
    return res.send(buf);
  } catch (e) {
    console.error('DOCX generate error:', e);
    const status = e.code === 'TPL_NOT_FOUND' || e.code === 'NO_COSTS' ? 404 : 500;
    return res.status(status).json({ error: e.message || 'DOCX generate failed' });
  }
};