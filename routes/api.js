const express = require('express');
const router = express.Router();

const PoomController = require('../controllers/PoomController');
const PosrController = require('../controllers/PosrController');
const OciController = require('../controllers/OciRoundtripController');
const OciCartController = require('../controllers/OciCartController');
const CheckHeadersController = require('../controllers/CheckHeadersController');

// Route to handle cxml punchout setup request
router.post('/cxml-punchout', PosrController.POSR);

// Route to hande OCI Round trip 
router.post('/oci-roundtrip', OciController.OciLogin);

// Route to receive the cxml cart
router.post('/cxml-data', PoomController.POOM);

// Route to receive the cxml cart
router.post('/oci-data', OciCartController.OciCart);

// Route to recieve Checkheaders' URL
router.post('/check-headers', CheckHeadersController.CheckHeaders);

// Rroute to fetch XML data by ID
router.get('/cxml-data/:id', PoomController.getXmlDataById);

// Route to retrieve OCI Cart data by ID
router.get('/oci-data/:id', OciCartController.getDataById);


module.exports = router;
