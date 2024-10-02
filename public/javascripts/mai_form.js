// 1 for add 0 for edit
let addOrEdit;

document.addEventListener('DOMContentLoaded', async function () {
    let originFormData = await getEntry();

    document.querySelector('.directions-btn').addEventListener('click', function() {
        const content = this.nextElementSibling; // Select the next sibling (the content div)
        const arrow = this.querySelector('.arrow'); // Select the arrow
        if (content.style.display === 'block') {
            content.style.display = 'none'; // Hide content if it's visible
            arrow.style.transform = 'rotate(0deg)'; // Reset arrow
        } else {
            content.style.display = 'block'; // Show content if it's hidden
            arrow.style.transform = 'rotate(180deg)'; // Rotate arrow
        }
    })

    initPagination(1);


    const reviewButton = document.getElementById('review-changes');

    reviewButton.addEventListener('click', async function(event) {
        event.preventDefault();

        if (addOrEdit === 0) {
            populateReview(originFormData.slice(1));
        } else {
            populateReview(originFormData);
        }
        populateReview(originFormData ? originFormData.slice(1) : originFormData);

        const confirmChangeBtn= document.getElementById('confirm-changes');
        confirmChangeBtn.addEventListener('click', async function(event) {
            event.preventDefault();
            if (addOrEdit === 0) {
                await editEntry(originFormData);
            } 
            else {
                await addEntry();
            }
        })

        const returnForm = document.getElementById('return-entry');
        returnForm.addEventListener('click', async function() {
            // show mai_form again
        })
    })

});

async function getEntry() {
    try {
        const response = await fetch('/mai-form/get-entry', {
            method: 'GET',
        })
        const entryData = await response.json();
        if (!entryData) {
            document.getElementById('confirm-changes').textContent = 'Add Application';
            addOrEdit = 1;
            return null;
        } else {
            addOrEdit = 0;
            await displayForm(entryData);
        }
        
        return Object.values(entryData);
    }
    catch(err) {
        console.error('Error getting entry from server side', err);

    }
}

async function populateReview(originFormData) {
    try {
        let newEntry = await getValues();
        newEntry = await detectChanges(originFormData, newEntry);

        if (newEntry.every(element => element === null)) {
            document.getElementById('error-div').innerText = 'No changes have been made';
            return;
        }
        else {
            document.getElementById('error-div').innerText = '';

            let i = 0;
            // get table by id
            const table1 = document.getElementById('review-table-1');
            const table2 = document.getElementById('review-table-2');

            let tbody= '';
            tbody += '<tr>'

            // for each element in origin form data
            table1.querySelector('thead tr#key1').querySelectorAll('th').forEach(() => {
                if (newEntry[i] === null) {
                    // if newEntry[i] is null, enter originformdata[i]
                    tbody += `<td class='original-cell'>${originFormData[i]}</td>`
                } else {
                    // else enter newEntry[i] and change color
                    tbody += `<td class='changed-cell'>${newEntry[i]}</td>`
                }

                i++;
            }); 
            tbody += '</tr>'
            table1.querySelector('tbody').innerHTML = tbody;

            tbody = '<tr>'

            // for each element in origin form data
            table2.querySelector('thead tr#key2').querySelectorAll('th').forEach(() => {
                if (newEntry[i] === null) {
                    // if newEntry[i] is null, enter originformdata[i]
                    tbody += `<td class='original-cell'>${originFormData[i]}</td>`
                } else {
                    // else enter newEntry[i] and change color
                    tbody += `<td class='changed-cell'>${newEntry[i]}</td>`
                }

                i++;
            }); 
            tbody += '</tr>'
            table2.querySelector('tbody').innerHTML = tbody;
            initPagination(2)

           
                
                
        }
    } catch (err) {
        console.error('Error occurred while reviewing changes.', err);
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

let currentPagination = null;

async function initPagination(type) {
    let button, button2;

    if (currentPagination === type) {
        return;
    } else if (currentPagination !== null){
            $('#pagination').pagination('destroy');
            currentPagination = null;
            if (type === 1) {
                document.querySelectorAll('.review-group').forEach(el => el.hidden = true);
                document.querySelectorAll('.form-group').forEach(el => el.hidden = false);
            } else {
                document.querySelectorAll('.form-group').forEach(el => el.hidden = true);
                document.querySelectorAll('.review-group').forEach(el => el.hidden = false);
            }
    }
    // type : 1 for form, 2 for review-changes
    const totalPages = 2;

    document.querySelectorAll('.typ1-buttons').forEach(el => el.hidden = true);
    document.querySelectorAll('.typ2-buttons').forEach(el => el.hidden = true);
    //const pagination = document.getElementById('pagination-container')

    try {
        $('#pagination').pagination({
            dataSource: new Array(totalPages),
            pageSize: 1,
            callback: function (data, pagination) {
                if (type === 1) {
                    $('.form-group').hide();
                    $('#page-' + pagination.pageNumber).show();
                } else if (type === 2) {
                    $('.review-group').hide();
                    $('#review-' + pagination.pageNumber).show();
                }

                if (pagination.pageNumber === totalPages) {
                    if (type === 1) {
                        document.querySelectorAll('.typ1-buttons').forEach(el => el.hidden = false);
                        document.querySelectorAll('.typ2-buttons').forEach(el => el.hidden = true);

                    } else {
                        document.querySelectorAll('.typ1-buttons').forEach(el => el.hidden = true);
                        document.querySelectorAll('.typ2-buttons').forEach(el => el.hidden = false);
                    }
                } else {
                    document.querySelectorAll('.typ1-buttons').forEach(el => el.hidden = true);
                    document.querySelectorAll('.typ2-buttons').forEach(el => el.hidden = true);
                }
            }
        });
        currentPagination = type;

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