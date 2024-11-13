class LogEntrySchema {
    constructor(values) {
        this.entry = {
            id: values[0],
            app_id: values[1],
            app_name: values[2],
            change_list: values[3],
            edit_type: values[4],
            date: values[5],
            changed_by: values[6],
            status: values[7],
        }    
    }

    async getEntry() {
        try {
            return this.entry;
        }
        catch (err) {
            console.log('Error getting entry info: ', err);
        }
    }
}

module.exports = LogEntrySchema;