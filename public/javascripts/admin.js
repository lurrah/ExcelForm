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
                // if status is not pending (approved/rejected), then approve or reject buttons will not show.
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
            let approve_btn = document.getElementById(`approve-${i}`);
            let reject_btn = document.getElementById(`reject-${i}`);
            if (approve_btn && reject_btn) {
                document.getElementById(`approve-${i}`).addEventListener('click', function() {
                    
                    try {
                        if (!entry) {
                            div.innerText = 'Please "view" the changes before approving them.';
                            return;
                        } else {
                            div.innerText = '';
                            approve_btn.disabled = true;
                            reject_btn.disabled = true;
                            approveChanges(log_id, app_id, entry, changes);
                        }
                    } catch (err) { 
                        console.error("Error approving changes: ", err);
                    }
                });
                document.getElementById(`reject-${i}`).addEventListener('click', function() {   
                    try {
                        if (!entry) {
                            div.innerText = 'Please "view" the changes before rejecting them.';
                            return;
                        }
                        else {
                            div.innerText = '';
                            reject_btn.disabled = true;
                            approve_btn.disabled = true;
                            changeStatus(log_id, 'Rejected');
                        }

                    } catch (err) { 
                        console.error("Error approving changes: ", err);
                    }
                    // redirect to (would you like to write a message to the author about the rejection?)
                });
            }
            
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

async function approveChanges(log_id, app_id, entry, entry_changes) {
    try {
        const div = document.getElementById('error-div');
        // if app_id does not exist, then add entry

        if (!entry) {
            div.innerText = 'Please review the changes before approving them.';
            return;
        }
        else {
            if (app_id < 0) {
                addApp(log_id, entry);

            } else {
                editMai(log_id, app_id, entry_changes);
            }
            changeStatus(log_id, 'Approved');
        }
    } catch (err) {
        console.error("Error occurred when approving changes: ", err)
    }
}

// This should only be for admins
async function editMai(log_id, app_id, input) {
    try {
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
                    index: app_id,
                    log_id: log_id
                })
            })
            let data = await response.json();
            if (data === 'Error occured while editing entry') {
                div.innerText = 'No changes have been made';
            } 
            else {
                div.innerText = 'Changes have been made';
                //window.location.href ='/review';
            }
        }
    }
    catch(err) {
        console.error('Error editing table entry', err)
    }
}

async function addApp(log_id, values) {
    try {
            const response = await fetch('/admin/mai/add', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    values: values,
                    log_id: log_id
                })
            })
            
            const div = document.getElementById('error-div');

            let data = await response.json();
                div.innerText = data.value
            if (data.status === 200) {
                //window.location.href ='/review';
                div.innerText = 'The Master Application Inventory has been successfully updated.';
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
                            row += `<td class='original-cell'>${data[0][i + 1]}</td>`;
                            entry.push(data[0][i + 1]);
                        } else {
                            // original row is just empty string
                            row += `<td class='original-cell'></td>`;
                            entry.push(null);
                        }
                    } else {
                        // else enter newEntry[i] and change color
                        row += `<td class='changed-cell'>${changes[i]}</td>`;
                        entry.push(changes[i]);
                    }
                    i++;
                }

                // blue cols need 2, pink needs 5 
                if (row_num === 1) {
                    row +=  `   <td class="placeholder"></td>
                                <td class="placeholder"></td>`
                } else if (row_num === 3) {
                    console.log("there");

                    row += `    <td class="placeholder"></td>
                                <td class="placeholder"></td>
                                <td class="placeholder"></td>
                                <td class="placeholder"></td>
                                <td class="placeholder"></td>`
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
                        entry.push(null);
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

async function changeStatus(log_id, status) {
    try {
        let div = document.getElementById('error-div');

        // log columns : [log_id, app_id, app_name, changes, type_change, date, changed by, change status]

        status = [null, null, null, null, null, null,  null, status];

        const response = await fetch('/admin/change-status', {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                log_id: log_id,
                status: status
            })
        })
        
        const data = await response.json();
        if (data.error) {
            div.innerTest = 'Error changing status';
            return null;
        } else {
            div.innerTest = 'Status changed.';
            console.log('Status changed');
        }
    } catch (err) {
        console.error(`Error occured while trying to ${status[7]} changes: `, err);
    }
    finally {
        location.reload;
        await getLogs();
    }
}