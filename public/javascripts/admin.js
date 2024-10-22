document.addEventListener('DOMContentLoaded', function () {
    document.querySelector('.directions-btn').addEventListener('click', function() {
        const content = document.getElementById('directions-menu'); 
        const arrow = this.querySelector('.arrow'); // Select the arrow
        if (content.style.maxHeight && content.style.maxHeight !== '0px') {
            // Hide content if it's visible
            content.style.maxHeight = '0';
            content.style.opacity = '0';
            arrow.style.transform = 'rotate(0deg)'; // Reset arrow
            setTimeout(() => {
                content.style.display = 'none';
            }, 500); // Wait for the animation to complete before hiding
        } else {
            // Show content if it's hidden
            content.style.display = 'block';
            setTimeout(() => {
                content.style.maxHeight = content.scrollHeight + "px"; // Set max-height for animation
                content.style.opacity = '1'; // Make content visible
                arrow.style.transform = 'rotate(180deg)'; // Rotate arrow
            }, 10); // Delay slightly to ensure display change applies before transition
        }
    });
    
    document.getElementById('get-log').addEventListener('click', function(){
        getLogs();
        
        //toggleColumn(columnClass)
    });
})

async function getLogs() {
    try {
        const filter = document.getElementById('log-status').value;
        const response = await fetch('/admin/get-logs', {
            method: 'GET',
            headers: {
                filter: filter
            }
        })
        const logs = await response.json();
        if (logs.error) {
            console.log('No logs found');
            document.getElementById('error-div').innerHTML = 'Unauthorized';    
            return null;
        } else {
            await displayLogs(logs);
        }
    }
    catch(err) {
        console.error('Error getting logs', err);
    }
}

async function displayLogs(logList) {
    try{
        console.log()
        const table = document.getElementById('log-table');
        const div = document.getElementById('error-div');
        let rowBody = "";

        //<tr id="key"> <th>Application Name</th> <coll.><th>Normalized Name</th> <th>Business Owner</th> <th>Managed By</th></coll.> <th>Date</th><th>Author</th><Status</th><Buttons></tr>
        for (let i = 0; i < logList.length; i++) 
            {   
                let status = logList[i].values[0][7];
                rowBody += `<tr id='row-${i}'>
                                <td>${logList[i].values[0][2]}</td>
                                <td>${logList[i].values[0][4]}</td>
                                <td>${logList[i].values[0][5]}</td>
                                <td>${logList[i].values[0][6]}</td>
                                <td>${logList[i].values[0][7]}</td>
                                <td>
                            `
                // if status is not pending (accepted/rejected), then approve or reject buttons will not show.
                if (status === 'Pending') {
                    rowBody +=  `   <button id='approve-${i}'>Approve</button><br>
                                    <button id='reject-${i}'>Reject</button><br><br>
                                `
                }
                            
                    rowBody +=  `    <button id='view-${i}'>View</button><br>
                                    <button id='edit-${i}'>Edit</button></td>
                                    </tr>`;
            }
        table.querySelector('tbody').innerHTML = rowBody;
        // set button event listeners
        for (let i = 0; i < logList.length; i++) {
            let app_id = logList[i].values[0][1];
            let log_id = logList[i].values[0][0];
            let changes = JSON.parse(logList[i].values[0][3]);
            let entry;


            document.getElementById(`approve-${i}`).addEventListener('click', function() {
                approveChanges(app_id, entry, entry_changes);
            });
            document.getElementById(`reject-${i}`).addEventListener('click', function() {    
                // redirect to (would you like to write a message to the author about the rejection?)
            });
            document.getElementById(`view-${i}`).addEventListener('click', async function() {
                entry = await viewChangedEntry(app_id, changes);
                // view changes as highlighted columns
            });
            document.getElementById(`edit-${i}`).addEventListener('click', function() {
                adminEdit(log_id, app_id);
                // view column as a form (add pink rows)
            });
        }
        table.hidden = false;
    } catch (err) {
        console.error("Error displaying log list: ", err)
    }
}

async function approveChanges(app_id, entry, entry_changes) {
    try {
        // if app_id does not exist, then add entry
        if (app_id < 0) {
            if (!entry) {
                div.innerText = 'Please review the changes before approving them.';
                return;
            } else {
                addEntryToMai(entry);
            }
        } else {
            editMai(app_id, entry_changes);
        }
    } catch (err) {
        console.error("Error occurred when approving changes: ", err)
    }
}

// This should only be for admins
async function editMai(id, input) {
    try {
        input = JSON.parse(input);

        const div = document.getElementById('error-div');

        if (input.every(element => element === null)) {
            div.innerText = 'No changes have been made';
        }
        else {
            const response = await fetch('/admin/mai/edit', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    values: input,
                    index: id
                })
            })
            let data = await response.json();
            if (data === 'Error occured while editing entry') {
                div.innerText = 'No changes have been made';
            } 
            else {
                div.innerText = 'Changes have been made';
                window.location.href ='/review';
            }
        }
    }
    catch(err) {
        console.error('Error editing table entry', err)
    }
}

async function addEntryToMai(values) {
    try {
        console.log(values);
            const response = await fetch('/admin/mai/add', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    values: values,
                })
            })
            
            const div = document.getElementById('error-div');

            let data = await response.json();
                div.innerText = data.value
            if (data.status === 200) {
                window.location.href ='/review';
                div.innerText = 'Entry has been added succesfully';
        }
    } catch (err) {
        console.error("Error calling /mai/add router: ", err);
    }
}

// View 
async function viewChangedEntry(id, changes) {
    try {
        const modal = document.getElementById("displayModal");
        const span = document.getElementsByClassName("close")[0];
        
        let data;
        let entry = [];

        if (!(id < 0)) {
            const response = await fetch('/admin/get-entry', {
                method: 'GET',
                headers: {
                    id: id 
                }
            })
            data = await response.json();

        }

        if (data && data.error) {
            div.innerText = 'Error occured when trying to display specific entry';
        } 
        else {
            // display current entry but then input user's changes

            // 3 is the number of header rows in table
            let i = 0;

            const set_cnts = [11, 13, 8]
            for (let row_num = 1; row_num <= set_cnts.length; row_num++)
            {
                let row = '<tr>';
                let tbody = document.getElementById(`set-${row_num}`);

                // array index is different from step count
                // i is array index, steps is num to iterate through array
                for (let step = 0; step < set_cnts[row_num - 1]; step++) {
                    if (!changes[i]) {
                        // if newEntry[i] is null, enter originformdata[i]
                        if (data) {
                            console.log(data[0][i + 1])
                            row += `<td class='original-cell'><input type="text" value="${data[0][i + 1]}" disabled></td>`
                            entry.push(data[0][i + 1]);
                        } else {
                            // original row is just empty string
                            row += `<td class='original-cell'><input type="text" disabled></td>`
                            entry.push("");
                        }
                    } else {
                        // else enter newEntry[i] and change color
                        row += `<td class='changed-cell'><input type="text" value="${changes[i]}" disabled></td>`
                        entry.push(changes[i]);
                    }
                    i++
                }
                row += '</tr>';
                tbody.innerHTML = row;
            }
            

            modal.style.display = "block";

            span.onclick = function() {
                modal.style.display = "none";
            }
            window.onclick = function(event) {
                if (event.target == modal) {
                  modal.style.display = "none";
                }
            }    
        }
        return entry;

    } catch (err) {
        console.error("Error retrieving log's entry: ", err);
    }
}

async function getChangedEntry(id, changes) {
    try {
        let entry = [];

        let data;
        if (!(id < 0)) {
            const response = await fetch('/admin/get-entry', {
                method: 'GET',
                headers: {
                    id: id 
                }
            })
            data = await response.json();

        }

        if (data && data.error) {
            div.innerText = 'Error occured when trying to display specific entry';
        } 
        else {
            // 32 is the number of columns (not including index)
            for (let i = 0; i < 32; i++) {
                if (!changes[i]) {
                    // if newEntry[i] is null, enter originformdata[i]
                    if (data) {
                        entry.push(data[0][i + 1]);
                    } else {
                        // original row is just empty string
                        entry.push("");
                    }
                } else {
                    // else enter newEntry[i] and change color
                    entry.push(changes[i]);
                }
                i++
            }
        }
        return entry;
    } catch (err) {
        console.error("Error getting changed entry: ", err);
    }
}

async function adminEdit(log_id, app_id) {
    try { 
        // view modal with ability to edit
    } catch (err) {
        console.error("Error occurred while trying to edit entry: ", err);
    }
}