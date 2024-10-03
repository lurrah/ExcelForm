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
                            <td>${logList[i].values[0][24]}</td>
                            <td>${logList[i].values[0][25]}</td>
                            <td>${logList[i].values[0][26]}</td>

                            <td><button id='approve-${i}'>Approve</button><br>
                            <button id='reject-${i}'>Reject</button></td>
                        </tr>`;
        }
        table.querySelector('tbody').innerHTML = rowBody;
        // set button event listeners
        for (let i = 0; i < logList.length; i++) {
            document.getElementById(`approve-${i}`).addEventListener('click', function() {    
                // add or edit entry
            });
            document.getElementById(`reject-${i}`).addEventListener('click', function() {    
                // redirect to (would you like to write a message to the author about the rejection?)
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