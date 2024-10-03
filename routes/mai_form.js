var express = require('express');
var router = express.Router();

const { WorksheetController } = require('../controllers/worksheet.js');
const { ChangeLogController } = require('../controllers/changeLog.js');


const wsController = new WorksheetController();
const logController = new ChangeLogController();

/* GET form page. */
router.get('/', function(req, res, next) {
  res.render('mai_form', {title: 'Mai Form'});
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
  res.redirect('/mai-form');
});

router.patch('/edit-entry', async (req, res) => await wsController.editEntry(req, res));

router.post('/add-entry', async (req, res) => await wsController.addEntry(req, res));

router.post('/add-log', async(req, res) => await logController.addLog(req, res));


module.exports = router;
