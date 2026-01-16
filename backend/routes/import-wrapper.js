// simple import-wrapper placeholder for backward compat
const express = require('express');
const router = express.Router();
router.post('/:tabla', (req, res) => {
  res.status(501).json({ success: false, message: 'Import no implementado en esta versión' });
});
module.exports = router;
