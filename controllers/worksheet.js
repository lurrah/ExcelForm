const Worksheet = require('../models/worksheet.js');

class WorksheetController {
    constructor () {
        this.ws = new Worksheet();
    }

    async getEntry(req, res) {
        try {
            const fName = req.query.fName;
            const response = await this.ws.getEntry(fName);

            if (response.error) {
                return res.json(response);
            }
            // index is for backend purposes
            const entry_info = {
                index: response.index,
                fName: response.values[0][0],
                lName: response.values[0][1],
                email: response.values[0][2],
                description: response.values[0][3]
            } 
            return res.json(entry_info);
        } catch(err) {
            console.log('Error retrieving entry from table:', err);
        }
    }

    async editEntry(req, res) {
        try {
            const values = req.body.values;
            const index = req.body.index;

            // check differences between submissions and previous 
            const response = await this.ws.editEntry(values, index);

            return res.json(response);
        } catch(err) {
            console.log('Error editing entry in table:', err);
        }
    }

    async addEntry(req, res) {
        try {
            const values = req.body.values;

            const response = await this.ws.addEntry(values);

            return res.json(response);
        } catch(err) {
            console.log('Error adding entry to table:', err);
        }
    }
}


module.exports = { WorksheetController }