const EntryInfo = require('../models/EntryInfo.js');


class EntryInfo {
    constructor() {
        this.entry = new EntryInfo(req.headers.values);
    }

    async getEntry() {
        const response = await this.entry.getEntry();
        return res.json(response);
    }
}

module.exports = EntryInfo;