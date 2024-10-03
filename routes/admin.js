var express = require('express');
var router = express.Router();

const { WorksheetController } = require('../controllers/worksheet.js');
const { ChangeLogController } = require ('../controllers/changeLog.js')

const wsController = new WorksheetController();
const logController = new ChangeLogController();

/* GET users listing. */
router.get('/', function(req, res, next) {
    res.render('admin', { title: 'Admin' });
});

router.get('/get-logs', async (req, res) => await logController.getLogs(req, res));


module.exports = router;
