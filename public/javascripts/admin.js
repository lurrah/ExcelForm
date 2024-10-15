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
        if (!logs) {
            console.log('No logs found');    
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
        table = document.getElementById('log-table');
        tbody = document.getElementById('log-table-body');
        rowBody = "";

        //<tr id="key"> <th>Application Name</th> <coll.><th>Normalized Name</th> <th>Business Owner</th> <th>Managed By</th></coll.> <th>Date</th><th>Author</th><Status</th><Buttons></tr>
        for (let i = 0; i < logList.length; i++) {
            rowBody += `<tr id='row-${i}'>
                            <td>${logList[i].values[0][0]}</td>
                            <td>${logList[i].values[0][1]}</td>
                            <td>${logList[i].values[0][3]}</td>
                            <td>${logList[i].values[0][4]}</td>
                            <td>${logList[i].values[0][5]}</td>

                            <td><button id='approve-${i}'>Approve</button><br>
                            <button id='reject-${i}'>Reject</button><br><br>
                            <button id='view-${i}'>View</button><br>
                            <button id='edit-${i}'>Edit</button></td>
                        </tr>`;
        }
        table.querySelector('tbody').innerHTML = rowBody;
        // set button event listeners
        for (let i = 0; i < logList.length; i++) {
            let entry_index = logList[i].values[0][0];
            let entry_changes = logList[i].values[0][2];

            document.getElementById(`approve-${i}`).addEventListener('click', function() { 
                // add or edit entry
                if (entry_index < 0) {
                    addEntry(entry_changes);
                } else {
                    editEntry(entry_index, entry_changes);

                }
            });
            document.getElementById(`reject-${i}`).addEventListener('click', function() {    
                // redirect to (would you like to write a message to the author about the rejection?)
            });
            document.getElementById(`view-${i}`).addEventListener('click', function() {
                // view changes as highlighted columns
            });
            document.getElementById(`edit-${i}`).addEventListener('click', function() {
                // view column as a form (add pink rows)
            });
        }
        table.hidden = false;
}

function toggleColumn(columnClass) {
    const cells = document.querySelectorAll(`.${columnClass}`);
    cells.forEach(cell => {
        cell.classList.toggle('hidden');
    });
}

// This should only be for admins
async function editEntry(index, input) {
    try {
        input = JSON.parse(input);

        const div = document.getElementById('error-div');

        if (input.every(element => element === null)) {
            div.innerText = 'No changes have been made';
        }
        else {
            const response = await fetch('/admin/edit-entry', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    values: input,
                    index: index
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

async function addEntry(input) {
    try {

        if (input.every(element => element === null)) {
            const div = document.getElementById('error-div');
            div.innerText = 'Entry not added';
        }
        else {
            const response = await fetch('/admin/add-entry', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    values: input,
                })
            })
            
            const div = document.getElementById('error-div');

            let data = await response.json();
                div.innerText = data.value
            if (data.status === 200) {
                window.location.href ='/review';
                div.innerText = 'Entry has been added succesfully';
            }
        }
    } catch (err) {
        console.error("Error calling addEntry router: ", err);
    }
}