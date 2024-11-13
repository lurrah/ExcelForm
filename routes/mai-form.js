var express = require('express');
var router = express.Router();

const { WorksheetController } = require('../controllers/worksheet.js');
const { ChangeLogController } = require('../controllers/changeLog.js');
//const { EntryInfoController } = require('.//controllers/EntryInfo.js');


const wsController = new WorksheetController();
const logController = new ChangeLogController();

/* GET form page. */
router.get('/', function(req, res, next) {
  const isAdmin = req.session.user.isAdmin;
  res.render('mai-form', {title: 'Mai Form', isAdmin},);
});

router.get('/get-entry', async (req, res) => {
  if (req.session.entryData) {
    res.json(req.session.entryData);
  } else {
    return res.json(null);
  }
});

router.post('/store-data', async (req, res) => {
  req.session.entryData = req.body; 
  console.log(req.session);
  res.redirect('/mai-form');
});

router.post('/add-log', async(req, res) => await logController.addLog(req, res));

router.post('/get-log', async(req, res) => await logController.getLog(req, res));



module.exports = router;
