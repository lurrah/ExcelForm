const entryCount = 24; 

// 1 for add 0 for edit
let addOrEdit;


document.addEventListener('DOMContentLoaded', async function () {
    let originFormData = await getEntry();

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

    initPagination(1);

    // reviewButton different text for adding vs deletion
    const reviewButton = document.getElementById('review-changes');
    let reviewEntry;

    reviewButton.addEventListener('click', async function(event) {
        event.preventDefault();
        // if (addOrEdit === 0) {
        //     populateReview(originFormData.slice(1));
        // } else {
        //     populateReview(originFormData);
        // }
        reviewEntry = await populateReview(addOrEdit ? Array(entryCount).fill('') : originFormData.slice(1));

        const confirmChangeBtn= document.getElementById('confirm-changes');
        confirmChangeBtn.addEventListener('click', async function(event) {
            event.preventDefault();
            if (addOrEdit === 0) {
                await editEntry(reviewEntry, originFormData[0]);
            } 
            else {
                await addLog(reviewEntry);
            }
        })

        const returnForm = document.getElementById('return-entry');
        returnForm.addEventListener('click', async function() {
            displayForm(reviewEntry);
            initPagination(1);
        });
    })

});

async function getEntry() {
    try {
        const response = await fetch('/mai-form/get-entry', {
            method: 'GET',
        })
        const entryData = await response.json();
        if (!entryData) {
            document.getElementById('review-changes').textContent = 'Review Application';
            document.getElementById('confirm-changes').textContent = 'Add Application';
            addOrEdit = 1;
            return null;
        } else {
            addOrEdit = 0;
            await displayForm(Object.values(entryData).slice(1));
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
        // Entry to be accessed in case user wants to revise their changes
        let retEntry = [];
        
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
                    retEntry.push(originFormData[i]);
                } else {
                    // else enter newEntry[i] and change color
                    tbody += `<td class='changed-cell'>${newEntry[i]}</td>`
                    retEntry.push(newEntry[i]);
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
                    retEntry.push(originFormData[i]);
                } else {
                    // else enter newEntry[i] and change color
                    tbody += `<td class='changed-cell'>${newEntry[i]}</td>`
                    retEntry.push(newEntry[i]);
                }

                i++;
            }); 
            tbody += '</tr>'
            table2.querySelector('tbody').innerHTML = tbody;
            initPagination(2)

            return retEntry;       
        }
    } catch (err) {
        console.error('Error occurred while reviewing changes.', err);
    }
}


async function editEntry(input, index) {
    try {

        const div = document.getElementById('error-div');

        if (input.every(element => element === null)) {
            div.innerText = 'No changes have been made';
        }
        else {
            const response = await fetch('/mai-form/edit-entry', {
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

async function addEntry(input) {
    try {

        if (input.every(element => element === null)) {
            const div = document.getElementById('error-div');
            div.innerText = 'Entry not added';
        }
        else {
            const response = await fetch('/mai-form/add-entry', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    values: input,
                })
            })
            
            const div = document.getElementById('error-div');
            div.innerText = 'Entry has been added';

            let data = await response.json();
                div.innerText = data.value
            if (data.status === 200) {
                window.location.href ='/review';
            }
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
    document.getElementById('appname-edit').value = data[0];//data.appName;
    document.getElementById('appnorm-edit').value = data[1];//data.appNorm;
    document.getElementById('description-edit').value = data[2];//data.description;
    document.getElementById('owner-edit').value = data[6]//data.owner;
    document.getElementById('owner-dep-edit').value = data[7]//data.ownerDep;
    document.getElementById('owner-it-edit').value = data[9]//data.ownerIt;
    document.getElementById('owner-itdep-edit').value = data[10]//data.ownerItDep;
    //pg2
    document.getElementById('numInteg-edit').value = data[14]//data.numInteg;
    document.getElementById('numActivUsr-edit').value = data[15]//data.numActivUsr;
    document.getElementById('numStaff-edit').value = data[16]//data.numStaff;
    document.getElementById('cobbId-edit').value = data[17]//data.cobbId;
    document.getElementById('vendor-edit').value = data[18]//data.vendor;
    document.getElementById('numLic-edit').value = data[19]//data.numLic;
    document.getElementById('yrCost-edit').value = data[20]//data.yrCost;
    document.getElementById('cntDates-edit').value = data[21]//data.cntDates;
    document.getElementById('details-edit').value = data[22]//data.details;
    document.getElementById('datUpdat-edit').value = data[23]//data.datUpdat;

    // Predetermined select lists ( index: 3, 4, 5, 8, 11, 12, 13 )
    const criticality = document.getElementById('criticality-edit');
    const lifecycle = document.getElementById('lifecycle-edit');
    const community = document.getElementById('community-edit');
    const ownerBudg = document.getElementById('owner-budg-edit');
    const appType = document.getElementById('apptype-edit');
    const appDel = document.getElementById('appdel-edit');
    const platform = document.getElementById('platform-edit');

    // Map lists to elements
    const selectLists = [ 
        { list: criticality, value: data[3] },//data.criticality },
        { list: lifecycle, value: data[4] },//data.lifecycle },
        { list: community, value: data[5] },//data.community },
        { list: ownerBudg, value: data[8] },//data.ownerBudg },
        { list: appType, value: data[11] },//data.appType },
        { list: appDel, value: data[12] },//data.appDel },
        { list: platform, value: data[13] }//data.platform}
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

async function addLog(input) {
    try {

        if (input.every(element => element === null)) {
            const div = document.getElementById('error-div');
            div.innerText = 'No fields have been changed. Request not made.';
        }
        else {
            // add date of change, author, and set status to 'Pending'
            const now = new Date();
            input.push(now.toLocaleString());
            input.push("user1");
            input.push("Pending");

            const response = await fetch('/mai-form/add-log', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    values: input,
                })
            })
            
            const div = document.getElementById('error-div');
            div.innerText = 'Entry has been added';

            let data = await response.json();
                div.innerText = data.value
            if (data.status === 200) {
                window.location.href ='/review';
            }
        }
    } catch (err) {
        console.error("Error calling addLog router: ", err);
    }
}
