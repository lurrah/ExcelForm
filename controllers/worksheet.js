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
                if (response.error === 1) {
                    response.values = {
                        // index: null,
                        // appName: null,
                        // description: null,
                        // criticality: null,
                        // lifecycleStat: null,
                        // community: null,
                        // owner: null,
                        // ownerDep: null,
                        // ownerBudg: null, // not sure if this is correct
                        // ownerIt: null,
                        // ownerItDep: null,
                    }
                }
                return res.json(response);
            }
            // index is for backend purposes
            const entry_info = {
                // page-1 info
                index: response.index,
                appName: response.values[0][0],
                appNorm: response.values[0][1],
                description: response.values[0][2],
                criticality: response.values[0][3],
                lifecycle: response.values[0][4],
                community: response.values[0][5],
                owner: response.values[0][6],
                ownerDep: response.values[0][7],
                ownerBudg: response.values[0][8], // not sure if this is correct
                ownerIt:response.values[0][9],
                ownerItDep:response.values[0][10],
                //page-2 info
                appType: response.values[0][11],
                appDel: response.values[0][12],
                platform: response.values[0][13],
                numInteg: response.values[0][14],
                numActivUsr: response.values[0][15],
                numStaff: response.values[0][16],
                cobbId: response.values[0][17],
                vendor: response.values[0][18], // not sure if this is correct
                numLic:response.values[0][19],
                yrCost:response.values[0][20],
                cntDates:response.values[0][21],
                details:response.values[0][22],
                datUpdat:response.values[0][23]
                //page-3 info
            }

            console.log(entry_info);
            return res.json(entry_info);
        } catch(err) {
            console.log('Error retrieving entry from table:', err);
        }
    }

    async editEntry(req, res) {
        try {
            const values = req.body.values;
            const index = req.body.index;

            const response = await this.ws.editEntry(values, index);
            if (response.error) {
                return res.json(response.values);
            }

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