document.addEventListener('DOMContentLoaded', async function () {
    let originFormData = await getEntry();
    initPagination();

    const button = document.getElementById('make-changes');
    button.addEventListener('click', async function(event) {
        event.preventDefault();
        if (button.textContent === 'Make Changes') {
            await editEntry(originFormData);
        } else {
            await addEntry();
        }
    })
});

async function getEntry() {
    try {
        const response = await fetch('/mai-form/get-entry', {
            method: 'GET',
        })
        const entryData = await response.json();
        if (!entryData) {
            document.getElementById('make-changes').textContent = 'Add Application';
            return null;
        } else {
            await displayForm(entryData);
        }
        
        return Object.values(entryData);
    }
    catch(err) {
        console.error('Error getting entry from server side', err);

    }
}

async function editEntry(originFormData) {
    try {
        let newEntry = await getValues();

        newEntry = await detectChanges(originFormData.slice(1), newEntry);

        const div = document.getElementById('error-div');

        if (newEntry.every(element => element === null)) {
            div.innerText = 'No changes have been made';
        }
        else {
            const response = await fetch('/mai-form/edit-entry', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    values: newEntry,
                    index: originFormData[0]
                })
            })
            let data = await response.json();
            if (data === 'Error occured while editing entry') {
                div.innerText = 'No changes have been made';
            } 
            else {
                div.innerText = 'Changes have been made';
            }
        }
    }
    catch(err) {
        console.error('Error editing table entry', err)
    }
}

// return null if no change, else return new
async function detectChanges(oldFields, newFields) {
    try {
        for (let i = 0; i < oldFields.length; i++) {
            if (oldFields[i] === newFields[i]) {

                newFields[i] = null;
            }
        }
        return newFields;
    } catch (err) {
        console.error("Discrepancy between the old and updated form values: ", err);
    }
}

async function addEntry() {
    try {

        let newEntry = await getValues();

        if (newEntry.every(element => element === null)) {
            const div = document.getElementById('error-div');
            div.innerText = 'Entry not added';
        }
        else {
            const response = fetch('/mai-form/add-entry', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    values: newEntry,
                })
            })
            
            const div = document.getElementById('error-div');
            div.innerText = 'Entry has been added';
        }
    } catch (err) {
        console.error("Error calling addEntry router: ", err);
    }
}

async function initPagination() {
    const totalPages = 2;
    const button = document.getElementById('make-changes');

    //const pagination = document.getElementById('pagination-container')

    try {
        $('#pagination').pagination({
            dataSource: new Array(totalPages),
            pageSize: 1,
            callback: function (data, pagination) {
                $('.form-group').hide();



                $('#page-' + pagination.pageNumber).show();

                if (pagination.pageNumber === totalPages) {
                    button.removeAttribute('hidden');
                } else {
                    button.setAttribute('hidden', true);
                }
            }
        });
    } catch(err) {
        console.error('Error initializing pagination', err);
    }
}

async function getValues() {
    const appName = document.getElementById('appname-edit').value;
    const appNorm = document.getElementById('appnorm-edit').value;
    const description = document.getElementById('description-edit').value;
    const criticality = document.getElementById('criticality-edit').value;
    const lifecycle = document.getElementById('lifecycle-edit').value;
    const community = document.getElementById('community-edit').value;
    const owner = document.getElementById('owner-edit').value;
    const ownerDep = document.getElementById('owner-dep-edit').value;
    const ownerBudg = document.getElementById('owner-budg-edit').value;
    const ownerIt = document.getElementById('owner-it-edit').value;
    const ownerItDep = document.getElementById('owner-itdep-edit').value;

    const appType = document.getElementById('apptype-edit').value; 
    const appDel = document.getElementById('appdel-edit').value;
    const platform = document.getElementById('platform-edit').value;
    const numInteg = document.getElementById('numInteg-edit').value;
    const numActivUsr = document.getElementById('numActivUsr-edit').value;
    const numStaff = document.getElementById('numStaff-edit').value;
    const cobbId = document.getElementById('cobbId-edit').value;
    const vendor = document.getElementById('vendor-edit').value;
    const numLic = document.getElementById('numLic-edit').value;
    const yrCost = document.getElementById('yrCost-edit').value;
    const cntDates = document.getElementById('cntDates-edit').value;
    const details = document.getElementById("details-edit").value;
    const datUpdat = document.getElementById("datUpdat-edit").value;

    return [ appName, appNorm, description, criticality, lifecycle, community, owner, ownerDep, ownerBudg, ownerIt, ownerItDep,
        appType, appDel, platform, numInteg, numActivUsr, numStaff, cobbId, vendor, numLic, yrCost, cntDates, details, datUpdat ];
}

async function displayForm(data) {
    // Hide search form and show entry form
    const tableForm = document.getElementById('table-form');
    tableForm.removeAttribute('hidden');

    // pg1 
    document.getElementById('appname-edit').value = data.appName;
    document.getElementById('appnorm-edit').value = data.appNorm;
    document.getElementById('description-edit').value = data.description;
    
    document.getElementById('owner-edit').value = data.owner;
    document.getElementById('owner-dep-edit').value = data.ownerDep;
    document.getElementById('owner-it-edit').value = data.ownerIt;
    document.getElementById('owner-itdep-edit').value = data.ownerItDep;
    //pg2
    document.getElementById('numInteg-edit').value = data.numInteg;
    document.getElementById('numActivUsr-edit').value = data.numActivUsr;
    document.getElementById('numStaff-edit').value = data.numStaff;
    document.getElementById('cobbId-edit').value = data.cobbId;
    document.getElementById('vendor-edit').value = data.vendor;
    document.getElementById('numLic-edit').value = data.numLic;
    document.getElementById('yrCost-edit').value = data.yrCost;
    document.getElementById('cntDates-edit').value = data.cntDates;
    document.getElementById('details-edit').value = data.details;
    document.getElementById('datUpdat-edit').value = data.datUpdat;

    // Predetermined select lists
    const criticality = document.getElementById('criticality-edit');
    const lifecycle = document.getElementById('lifecycle-edit');
    const community = document.getElementById('community-edit');
    const ownerBudg = document.getElementById('owner-budg-edit');
    const appType = document.getElementById('apptype-edit');
    const appDel = document.getElementById('appdel-edit');
    const platform = document.getElementById('platform-edit');

    // Map lists to elements
    const selectLists = [ 
        { list: criticality, value: data.criticality },
        { list: lifecycle, value: data.lifecycle },
        { list: community, value: data.community },
        { list: ownerBudg, value: data.ownerBudg },
        { list: appType, value: data.appType },
        { list: appDel, value: data.appDel },
        { list: platform, value: data.platform}
    ];

    // iterate through all selectLists and populate them as necessary
    for (let { list, value } of selectLists) {
        for (let option of list.options) {
            if (option.value === value) {
                option.selected = true;
                break;
            }
        }
    }
}