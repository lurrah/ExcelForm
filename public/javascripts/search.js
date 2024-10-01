document.addEventListener('DOMContentLoaded', async function () {
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

            document.getElementById('entry-form').setAttribute('hidden', true);

            if (data.error) {
                error.innerText = data.values;
                if  (data.error === 1) {
                    document.getElementById('add-entry').removeAttribute('hidden');
                    document.getElementById('new-search').removeAttribute('hidden');
                }
            } else {
                displayEntries(data);
                // Fill in entry form with current information
                //document.getElementById("make-changes").textContent = "Make Changes"

                //return [ data.index, data.appName, data.appNorm ,data.description, data.criticality, data.lifecycle, data.community, data.owner, data.ownerDep, data.ownerBudg, data.ownerIt, data.ownerItDep,
                //        data.appType, data.appDel, data.platform, data.numInteg, data.numActivUsr, data.numStaff, data.cobbId, data.vendor,data.numLic, data.yrCost, data.cntDates, data.details, data.datUpdat ];
            }
        }
        else {
            error.innerText = 'Please fill out at least one field.'
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

        table.removeAttribute('hidden');
    }
    catch (err) {
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

