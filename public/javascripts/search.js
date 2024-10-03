document.addEventListener('DOMContentLoaded', async function () {
    const radioButtons = document.querySelectorAll('input[name="form-section"]');

    // instructions drop-down
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

    radioButtons.forEach(radio => {
        radio.addEventListener('change', toggleSections);
    });
    
    document.getElementById('search-entry').addEventListener('click', async function(event) {
        event.preventDefault();
        searchEntries();
    })

    document.getElementById('new-search').addEventListener('click', async function() {
        window.location.reload();
    })

    document.getElementById('add-entry').addEventListener('click', async function() {
        selectEntry(null);
    })

});

function toggleSections() {
    const appName = document.getElementById('appName');
    const ownerName = document.getElementById('ownerName');
    const selectedValue = document.querySelector('input[name="form-section"]:checked').value;

    if (selectedValue === 'appName') {
            appName.hidden = false;
            ownerName.hidden = true;
            document.getElementById('ownername').value = '';
    }
    else {
        appName.hidden = true;
        ownerName.hidden = false;
        document.getElementById('appname').value = '';
    }

}

async function searchEntries() {
    try {
        const error = document.getElementById('error-div');
        error.innerText = '';

        const appName = document.getElementById('appname').value;
        const ownerName = document.getElementById('ownername').value;

        // only search if user has entered app
        if (appName.trim() !== '' || ownerName.trim() !== '') {
            const url = new URL('/search/search-entries', window.location.origin);
            const params = { appName, ownerName };
            Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));

            // get-entry based on search parameters (currently: appName)
            const response = await fetch(url, {
                method: 'GET',
            })
            data = await response.json();

            document.getElementById('entry-form').hidden = true;
            document.getElementById('radio').hidden = true;

            if (data.error) {
                document.getElementById('search-result-div').innerText = data.values;
                document.getElementById('new-search').hidden = false;
                if  (data.error === 1) {
                    document.getElementById('add-entry').hidden = false;
                }
            } else {
                // tell user they searched by application name or owner name

                let search = appName && appName != '' ? appName : (ownerName && ownerName != '' ? ownerName : null);
                let searchType;
                if (appName && appName != '') {
                    searchType = 'Application Name';
                } else if (ownerName && ownerName != ''){
                    searchType = 'Owner/Manager/Collaborator Name';
                } else {
                    throw new Error();
                }

                document.getElementById('search-result-div').innerText = `Showing search results with '${search}' in the ${searchType} field.`
                displayEntries(data);
                // Fill in entry form with current information
                //document.getElementById("make-changes").textContent = "Make Changes"

                //return [ data.index, data.appName, data.appNorm ,data.description, data.criticality, data.lifecycle, data.community, data.owner, data.ownerDep, data.ownerBudg, data.ownerIt, data.ownerItDep,
                //        data.appType, data.appDel, data.platform, data.numInteg, data.numActivUsr, data.numStaff, data.cobbId, data.vendor,data.numLic, data.yrCost, data.cntDates, data.details, data.datUpdat ];
            }
        }
        else {
            error.innerText = 'Please fill out a field'
        }
    }
    catch (err) {
        console.error('Error searching for entries: ', err);
    }
}

async function displayEntries(entryList) {
    try {
        table = document.getElementById('entry-list');
        rowBody = "";

        //<tr id="key"> <th>Application Name</th> <th>Normalized Name</th> <th>Business Owner</th> <th>Managed By</th> <th>Select</th> </tr>
        for (let i = 0; i < entryList.length; i++) {
            rowBody += `<tr id='row-${i}'>
                            <td>${entryList[i].values[0][0]}</td>
                            <td>${entryList[i].values[0][1]}</td>
                            <td>${entryList[i].values[0][6]}</td>
                            <td>${entryList[i].values[0][10]}</td>
                            <td><button id='select-${i}'>Select</button></td>
                        </tr>`;
        }
        table.querySelector('tbody').innerHTML = rowBody;
        // set button event listeners
        for (let i = 0; i < entryList.length; i++) {
            console.log(entryList[i]);
            document.getElementById(`select-${i}`).addEventListener('click', function() {    
                selectEntry(entryList[i]);
            });
        }
        table.hidden = false;
        document.getElementById('new-search').hidden = false;
        document.getElementById('add-entry').hidden = false;
    }
    catch (err) {
        document.getElementById('entry-list-div').hidden = true;
        console.error('Error displaying entries: ', err);
    }
}

async function selectEntry(entryArr) {
    try {
        if (!entryArr) {
            window.location.href ='/mai-form';
        }
        else {
            let index = entryArr.index;
            let entry = entryArr.values[0]
            const entryData = {
                // page-1 info
                index: index,
                appName: entry[0],
                appNorm: entry[1],
                description: entry[2],
                criticality: entry[3],
                lifecycle: entry[4],
                community: entry[5],
                owner: entry[6],
                ownerDep: entry[7],
                ownerBudg: entry[8],
                ownerIt: entry[9],
                ownerItDep: entry[10],
                //page-2 info
                appType: entry[11],
                appDel: entry[12],
                platform: entry[13],
                numInteg: entry[14],
                numActivUsr: entry[15],
                numStaff: entry[16],
                cobbId: entry[17],
                vendor: entry[18],
                numLic: entry[19],
                yrCost: entry[20],
                cntDates: entry[21],
                details: entry[22],
                datUpdat: entry[23]
                //page-3 info
            }

            await fetch('/mai-form/store-data', {
                method:'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(entryData)
            })
            window.location.href = '/mai-form';
        }

    }
    catch (err) {
        console.error('Error occurred user selecting entry: ', err);
    }
}

