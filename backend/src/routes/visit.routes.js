const express = require('express');
const { registrarVisita, obtenerVisitas } = require('../controllers/visit.controller');

const router = express.Router();

router.post('/', registrarVisita);
router.get('/',  obtenerVisitas);

module.exports = router;
