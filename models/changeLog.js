class ChangeLog {
    constructor() {};

    async getLogs(filter) {
        try {
            const response = await fetch(`https://graph.microsoft.com/v1.0/me/drive/items/${process.env.wb_id}/workbook/worksheets/Sheet1/tables/${process.env.review_id}/rows`, {
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
                    throw new Error('Failed to fetch logs');
                }
            }

            const data = await response.json();
            return data.value;
        } catch (err) {
            console.log('Error retrieving logs:', err);

        }
    }

    async addLog(values) {
        try {
            const body = {
                persistChanges: true,
                values: [
                    values
                ]
            }

            const response = await fetch(`https://graph.microsoft.com/v1.0/me/drive/items/${process.env.drive_id}/workbook/tables/${process.env.review_id}/rows/add`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${process.env.graph_pat}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body),
            })

            if (!response.ok) {
                if (response.status === 401) {
                    return {status: 401, msg: 'You are unauthorized to make this request.'};
                } else {
                    return {status: 400, msg: 'Unexpected error occurred when submitting "add entry" request.'};
                }
            }

            return {status: 200, msg: 'Your submission has been sent successfully.'};
        } catch(err) {
            console.log('Error adding entry to table:', err);
        }
    }
}

module.exports = ChangeLog;