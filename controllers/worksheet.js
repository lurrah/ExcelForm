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
                // page-1 info
                index: response.index,
                appName: response.values[0][0],
                description: response.values[0][2],
                criticality: response.values[0][3],
                lifecycleStat: response.values[0][4],
                community: response.values[0][5],
                owner: response.values[0][6],
                ownerDep: response.values[0][7],
                ownerBudg: response.values[0][8], // not sure if this is correct
                ownerIt:response.values[0][9],
                ownerItDep:response.values[0][10],
                //page-2 info
                //page-3 info
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