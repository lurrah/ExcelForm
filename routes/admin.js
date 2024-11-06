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

router.get('/get-logs', async (req, res) => {
    req.session.user = {
        email: 'example@ucf.edu',
        name: 'examplename',
        isAdmin: true,
    }
    console.log(req.session.user);

    await logController.getLogs(req, res)
});
router.get('/get-entry', async (req, res) => await wsController.getEntry(req, res));


router.patch('/mai/edit', async (req, res) => await wsController.editEntry(req, res));

router.post('/mai/add', async (req, res) => await wsController.addEntry(req, res));

router.patch('/change-status', async (req, res) => await logController.changeStatus(req, res));


// router.patch('/mai/admin-edit', async (req, res) => await wsController.getEntry(req, res));



module.exports = router;
