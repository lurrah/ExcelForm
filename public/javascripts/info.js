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
        console.log(ownerName.trim())
        // only search if user has entered app
        if (appName.trim() !== '' || ownerName.trim() !== '') {
            const url = new URL('/mai-form/get-entry', window.location.origin);
            const params = { appName, ownerName };
            Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));

            // get-entry based on search parameters (currently: appName)
            const response = await fetch(url, {
                method: 'GET',
            })

            data = await response.json();

            console.log(data);
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
            
            table.querySelector('tbody').innerHTML += rowBody;

            document.getElementById(`select-${i}`).addEventListener('click', function() {
                selectEntry(i);
            });
        }

        table.removeAttribute('hidden');
    }
    catch (err) {
        console.error('Error displaying entries: ', err);
    }
}

async function selectEntry(i) {
    try {
        if (!i) {
            window.location.href ='/mai-form';
        }
        else {
            window.location.href ='/mai-form/get-entry';
        }

    }
    catch (err) {
        console.error('Error selecting entry: ', err);
    }
}

