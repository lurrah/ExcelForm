const Worksheet = require('../models/worksheet.js');
//const EntryInfo = require('../models/EntryInfo.js');

class WorksheetController {
    constructor () {
        this.ws = new Worksheet();
    }

    async getEntry(req, res) {
        try {
            const id = req.headers.id;

            const response = await this.ws.getEntry(id);
            return res.json(response);
        } catch(err) { 
            console.log('Error retrieving entry with specified index: ', err);
        }
    }

    async searchEntries(req, res) {
        try {
            const appName = req.query.appName;
            const ownerName = req.query.ownerName;
            const response = await this.ws.searchEntries(appName.trim(), ownerName.trim());
            // if (response.error) {
            //     //if (response.error === 1) {
            //     //    return (response.values);
            //         // response.values = {
            //         //     index: "",
            //         //     appName: "",
            //         //     appNorm: "",
            //         //     description: "",
            //         //     criticality: "",
            //         //     lifecycle: "",
            //         //     community: "",
            //         //     owner: "",
            //         //     ownerDep: "",
            //         //     ownerBudg: "", // not sure if this is correct
            //         //     ownerIt: "",
            //         //     ownerItDep: "",
            //         //     //page-2 info
            //         //     appType: "",
            //         //     appDel: "",
            //         //     platform: "",
            //         //     numInteg: "",
            //         //     numActivUsr: "",
            //         //     numStaff: "",
            //         //     cobbId: "",
            //         //     vendor: "", // not sure if this is correct
            //         //     numLic: "",
            //         //     yrCost: "",
            //         //     cntDates: "",
            //         //     details: "",
            //         //     datUpdat: ""
            //         // }
            //     //}
            //     return res.json(response);
            // }
            return res.json(response);

            let entryList = []
            // for (let entry of response) {
            //     entryList.push({ index: entry.index, entry: entry.values })
            // }

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
            return res.json(entry_info);
        } catch(err) {
            console.log('Error retrieving entry from table:', err);
        }
    }

    async editEntry(req, res) {
        try {
            const values = req.body.values;
            const index = req.body.index;

            const response = await this.ws.editEntry(index, values);
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