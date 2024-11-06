var express = require('express');
var router = express.Router();

const { WorksheetController } = require('../controllers/worksheet.js');

const wsController = new WorksheetController();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Home' });
});

router.get('/login', function(req, res, next) {
  req.session.user = {
    email: 'example@ucf.edu',
    name: 'examplename',
    admin: 0,
  }
  res.send('Logged in');
})

router.get('/logout', function(req, res, next) {
  req.session.destroy();
  res.send('Logged out');
})

router.get('/get-entry', async (req, res) => await wsController.getEntry(req, res));



module.exports = router;
