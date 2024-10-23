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

    async changeStatus(req, res) {
        try {
            const log_id = req.body.log_id;
            const status = req.body.status;

            console.log(status);
            console.log(log_id)
            const response = await this.log.changeStatus(log_id, status);

            return res.json(response);
        } catch(err) {
            console.log('Error changing status:', err);
        }
    }
}

module.exports = { ChangeLogController };