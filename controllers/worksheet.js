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

            const entry_info = {
                fName: response[0][0],
                lName: response[0][1],
                email: response[0][2],
                description: response[0][3]
            } 
            return res.json(entry_info);
        } catch(err) {
            console.log('Error retrieving entry from table:', err);
        }
    }

    async editEntry(req, res) {
        try {
            const fName = req.body.fName;
            const lName = req.body.lName;
            const email = req.body.email;
            const description = req.body.description;

            const response = await this.ws.editEntry(fName, lName, email, description);
        } catch(err) {
            console.log('Error editing entry in table:', err);
        }
    }
}


module.exports = { WorksheetController }