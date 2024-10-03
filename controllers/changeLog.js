const ChangeLog = require('../models/changeLog.js');

class ChangeLogController {
    constructor () {
        this.log = new ChangeLog();
    }

    async getLogs(req, res) {
        try {
            const filter = req.headers.statusType;

            const response = await this.log.getLogs(filter);
            console.log(response);
            return res.json(response);

        } catch(err) {
            console.log('Error fetching logs:', err);

        }
    }

    async addLog(req, res) {
        try {
            const values = req.body.values;

            const response = await this.log.addLog(values);

            return res.json(response);
        } catch(err) {
            console.log('Error adding request to the Change Log:', err);
        }
    }
}

module.exports = { ChangeLogController };