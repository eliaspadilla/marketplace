const express = require('express');
const { estadisticasVendedor } = require('../controllers/stats.controller');
const { verificarToken }        = require('../middlewares/auth.middleware');
const { soloVendedor }          = require('../middlewares/role.middleware');

const router = express.Router();

router.use(verificarToken);
router.use(soloVendedor);

router.get('/vendor', estadisticasVendedor);

module.exports = router;
