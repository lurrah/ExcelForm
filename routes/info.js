var express = require('express');
var router = express.Router();

const { WorksheetController } = require('../controllers/worksheet.js');

const wsController = new WorksheetController();

/* GET form page. */
router.get('/', function(req, res, next) { 
    req.session.entryData = null;
    res.render('info', {title: 'Excel Form'}); 
});

router.get('/search-entries', async (req, res) => await wsController.searchEntries(req, res));

module.exports = router;
