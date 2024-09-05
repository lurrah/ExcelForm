var express = require('express');
var router = express.Router();

const { WorksheetController } = require('../controllers/worksheet.js');

const wsController = new WorksheetController();
/* GET form page. */
router.get('/', function(req, res, next) {
  res.render('info', {title: 'Excel Form'});
});

router.get('/get-entry', async (req, res) => await wsController.getEntry(req, res));

router.patch('/edit-entry', async (req, res) => await wsController.editEntry(req, res));

router.post('/add-entry', async (req, res) => await wsController.addEntry(req, res))

module.exports = router;
