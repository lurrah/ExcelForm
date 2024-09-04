class Worksheet {
    constructor() {
    
    };

    async getWS() {
        try {
            const response = await fetch(`https://graph.microsoft.com/v1.0/me/drive/items/${process.env.drive_id}/workbook/worksheets`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${process.env.graph_pat}`,
                    'Content-Type': 'application/json'
                }
            })
            
            if (!response.ok) {
                throw new Error(`HTTP Error: ${response.status}`);
            }
    
            const data = await response.json();
            return data;
        } catch (err){
            console.log('Error fetching the Master Application Inventory:', err);
        }
    }

    async getEntryList() {
        try {
            const response = await fetch(`https://graph.microsoft.com/v1.0/me/drive/items/${process.env.wb_id}/workbook/worksheets/Sheet1/tables/${process.env.mai_id}/rows`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${process.env.graph_pat}`,
                    'Content-Type': 'application/json'
                }
            })

            if (!response.ok) {
                if (response.status === 401) {
                    return 401;
                } else {
                    throw new Error('Failed to fetch entries');
                }
            }
    
            const data = await response.json();

            return data.value;

        } catch (err){
            console.log('Error fetching entries from the Master Application Inventory: ', err);
        }
    }

    async getEntry(fName) {
        try {
            const list = await this.getEntryList();
            if (list === 401) {
                return {error: 401, values: 'You are unauthorized to make this request.'};
            } else if (list !== null && list.length !== 0) {
                for (let row of list) {

                    const name = row.values[0][0];
                    if (name === fName) {
                        return row.values;
                    }
                }
            }
            return {error: 1, values: 'No entries found.'};
        } catch (err) {
            console.log('Error fetching specific entry: ', err);
        }
    }

    async editEntry(fName, lName, email, description) {
        try {
            const response = await fetch(``, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${process.env.graph_pat}`,
                    'Content-Type': 'application/json'
                }
            })
        } catch (err) {
            console.log('Error editing entry in Master Application Inventory: ', err)
        }
    }
}


module.exports = Worksheet;