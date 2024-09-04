var express = require('express');
var router = express.Router();

const { WorksheetController } = require('../controllers/worksheet.js');

const wsController = new WorksheetController();
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Home' });
});

//router.get('/worksheet', async (req, res) => await wsController.getWS(req, res));

router.get('/get-entry', async (req, res) => await wsController.getEntry(req, res));



module.exports = router;
