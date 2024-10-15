const ChangeLog = require('../models/changeLog.js');

class ChangeLogController {
    constructor () {
        this.log = new ChangeLog();
    }

    async getLogs(req, res) {
        try {
            const filter = req.headers.statusType;

            const response = await this.log.getLogs(filter);
            return res.json(response);

        } catch(err) {
            console.log('Error fetching logs:', err);

        }
    }

    async addLog(req, res) {
        try {
            const log_info = req.body.log_info;

            const response = await this.log.addLog(log_info);

            return res.json(response);
        } catch(err) {
            console.log('Error adding request to the Change Log:', err);
        }
    }
}

module.exports = { ChangeLogController };