
// Current table structure (all instances must be updated when the table is updated)
// [ appName, lname, email, description ]

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
            console.log(response);
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

    // Get specified entry based on search parameter (currently appName)
    async getEntry(appName, ownerName) {
        try {
            const list = await this.getEntryList();
            let returnList = [];
            if (list === 401) {
                console.log("Unauthorized")
                return {error: 401, values: 'You are unauthorized to make this request.'};
            } else if (list !== null && list.length !== 0) {
                for (let row of list) {

                    const name = row.values[0][0];
                    const owner = row.values[0][6];
                    const manager = row.values[0][10];
                    if (name === appName) {
                        returnList.push({index: row.index, values: row.values})
                        //return {index: row.index, values: row.values};
                    } else if (owner.includes(ownerName)) {
                        returnList.push({index: row.index, values: row.values})
                    } else if (manager.includes(ownerName)) {
                        returnList.push({index: row.index, values: row.values})
                    }
                }

                console.log(returnList);
            }
            return {error: 1, values: 'No entries found.'};
        } catch (err) {
            console.log('Error fetching specific entry: ', err);
        }
    }

    // Edit specified entry based
    async editEntry(values, index) {
        try {
            const body = {
                persistChanges: true,
                values: [
                    values
                ]
            }
            console.log(JSON.stringify(body));
            const response = await fetch(`https://graph.microsoft.com/v1.0/me/drive/items/${process.env.drive_id}/workbook/tables/${process.env.mai_id}/rows/itemAt(index=${index})`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${process.env.graph_pat}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body)
            })

            if (!response.ok) {
                if (response.status === 401) {
                    return {error: 401, values: 'You are unauthorized to make this request.'};
                } else {
                    return {error: 400, values: 'Error occured while editing entry'};
                }
            }

            const data = await response.json();
            return data;
        } catch (err) {
            console.log('Error editing entry in Master Application Inventory: ', err);
        }
    }

    async addEntry(values) {
        try {
            const body = {
                persistChanges: true,
                values: [
                    values
                ]
            }

            const response = await fetch(`https://graph.microsoft.com/v1.0/me/drive/items/${process.env.drive_id}/workbook/tables/${process.env.mai_id}/rows/add`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${process.env.graph_pat}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body),
            })
            if (!response.ok) {
                if (response.status === 401) {
                    console.error('Unauthorized to make this request.');
                    return 401;
                } else {
                    throw new Error('Failed to add entry');
                }
            }

            const data = await response.json();

            return data;
        } catch(err) {
            console.log('Error adding entry to table:', err);
        }
    }
}


module.exports = Worksheet;