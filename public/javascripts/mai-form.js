const entryCount = 33; 

// 1 for add 0 for edit
let addOrEdit;

document.addEventListener('DOMContentLoaded', async function () {
    const isAdmin = document.getElementById('admin-info').getAttribute('data-is-admin') === 'true'; // Change when auth
    let { originFormData, log_id } = await getEntry();
    console.log(originFormData);
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

    initPagination(1, isAdmin);

    // reviewButton different text for adding vs deletion
    const reviewButton = document.getElementById('review-changes');
    let reviewEntry;

    reviewButton.addEventListener('click', async function(event) {
        reviewButton.disabled = true;
        event.preventDefault();
        try { 
            reviewEntry = addOrEdit ? Array(entryCount).fill(null) : originFormData;
            if (addOrEdit) {
                // if add, index does not exist
                reviewEntry[0] = -1;
            }

            reviewEntry = await populateReview(reviewEntry, isAdmin);
        } catch (err) {
            console.error('Error occurred when reviewing changes', err);
        }
        finally {
            reviewButton.disabled = false;
        }
    }) 
    
    const confirmChangeBtn= document.getElementById('confirm-changes');
    confirmChangeBtn.addEventListener('click', async function(event) {
        confirmChangeBtn.disabled = true;
        event.preventDefault();
        try {
            if (log_id === -1) {
                await addLog(reviewEntry, addOrEdit ? reviewEntry[1] : originFormData[1]);
            } else {
                // (in case of admin) if log exists, update log and approve
                editLog(isAdmin, reviewEntry, log_id);
            }

        } catch (err) {
            console.error('Error occurred when confirming changes', err);
        }
        finally {
            confirmChangeBtn.disabled = false;
        }
    })

    const returnForm = document.getElementById('return-entry');
    
    returnForm.addEventListener('click', async function() {
        returnForm.disabled = true;
        try {
            displayForm(originFormData.slice(1), reviewEntry.slice(1));
            initPagination(1, isAdmin);
        } catch(err) {
            console.error('Error occurred when returning to form', err);
        } finally {
            returnForm.disabled = false;
        }
        
    });

    document.getElementById('home-btn').addEventListener("click", async function(event) {
        window.location.href ='/';
    })
});



async function getEntry() {
    try {
        let log_id;
        const response = await fetch('/mai-form/get-entry', {
            method: 'GET',
        })
        const entryData = await response.json();
        if (!entryData) {
            document.getElementById('review-changes').textContent = 'Review Application';
            document.getElementById('confirm-changes').textContent = 'Add Application';
            addOrEdit = 1;
            return { originFormData: Array(entryCount).fill(null), log_id: -1 };
        } else {
            addOrEdit = 0;
            log_id = entryData.log_id;
            await displayForm(Object.values(entryData).slice(2), null);
        }

        // remove log_id from originFormData
        return { originFormData: Object.values(entryData).slice(1), log_id };
    }
    catch(err) {
        console.error('Error getting entry from server side', err);

    }
}

async function populateReview(origin, isAdmin) {
    try {
        let newEntry = await getValues();        

        // Entry to be accessed in case user wants to revise their changes
        let retEntry = [];
        // newEntry does not have index, so therefore, origin index field must be removed.

        const changes = await detectChanges(origin.slice(1), newEntry);
        
        let div = document.getElementById('error-div');
        if (changes.every(element => element === null) && isAdmin !== true) {
            div.innerText = 'No changes to review';
            return;
        }
        else if ((newEntry[0] === "" || newEntry[0] === null) && isAdmin !== true) {
            // newEntry[0] is user appName

            div.innerText = 'Application name cannot be empty. Request not made.';
        }
        else {
            if (isAdmin === true && changes.every(element => element === null)) {
                if (confirm("You have not made any changes, are you sure you would like to proceed?")) {
                    
                } else {
                    div.innerText = 'No changes to review';
                    return;
                }
            }

            // check if application name already exists in the inventory (with changes [0] if not null)
            div.innerText = "";

            // get table by id
            const table1 = document.getElementById('review-table-1');
            const table2 = document.getElementById('review-table-2');
            const table3 = document.getElementById('review-table-3');

            let i = 0;
            let tbody= "";

            retEntry.push(origin[0]);    // entry index (for internal purposes)
                                        // newEntry does not include an index (which input does)
                                         
            // for each element in origin form data
            tbody += '<tr>'
            table1.querySelector('thead tr#key1').querySelectorAll('th').forEach(() => {
                if (changes[i] === null) {
                    // if newEntry[i] is null, enter originformdata[i]
                    if (origin[i + 1]) {
                        tbody += `<td class='original-cell'>${origin[i + 1]}</td>`;
                    } else {
                        tbody += `<td class='original-cell'>-</td>`;
                    }
                    retEntry.push(null);
                } else {
                    // else enter newEntry[i] and change color
                    tbody += `<td class='changed-cell'>${changes[i]}</td>`
                    retEntry.push(changes[i]);
                }

                i++;
            }); 
            tbody += '</tr>'
            table1.querySelector('tbody').innerHTML = tbody;

            tbody = '<tr>'

            // for each element in origin form data
            table2.querySelector('thead tr#key2').querySelectorAll('th').forEach(() => {
                if (changes[i] === null) {
                    // if newEntry[i] is null, enter originformdata[i]
                    if (origin[i + 1]) {
                        tbody += `<td class='original-cell'>${origin[i + 1]}</td>`;
                    } else {
                        tbody += `<td class='original-cell'>-</td>`;
                    }
                    retEntry.push(null);
                } else {
                    // else enter newEntry[i] and change color
                    tbody += `<td class='changed-cell'>${changes[i]}</td>`;
                    retEntry.push(changes[i]);
                }

                i++;
            }); 
            tbody += '</tr>'
            table2.querySelector('tbody').innerHTML = tbody;
            if (isAdmin === true) {
                tbody = '<tr>'
                console.log(origin)
                console.log(changes);
                table3.querySelector('thead tr#key3').querySelectorAll('th').forEach(() => {
                    if (changes[i] === null) {
                        // if newEntry[i] is null, enter originformdata[i]
                        if (origin[i + 1]) {
                            tbody += `<td class='original-cell'>${origin[i + 1]}</td>`;
                        } else {
                            tbody += `<td class='original-cell'>-</td>`;
                        }
                        retEntry.push(null);
                    } else {
                        // else enter newEntry[i] and change color
                        tbody += `<td class='changed-cell'>${changes[i]}</td>`
                        retEntry.push(changes[i]);
                    }

                    i++;
                })
                tbody += '</tr>'
                table3.querySelector('tbody').innerHTML = tbody;
            }

            initPagination(2, isAdmin)

            return retEntry;       
        }
    } catch (err) {
        console.error('Error occurred while reviewing changes.', err);
    }
}

// return null if no change, else return new
async function detectChanges(oldFields, newEntry) {
    try {
        // ensure that new array is created, do not edit newEntry
        let newFields = [...newEntry];
        for (let i = 0; i < oldFields.length; i++) {
            if (String(oldFields[i]).replace(/[()]/g, '').replace(/\//g, ' ').trim().toLowerCase() === String(newFields[i]).replace(/[()]/g, '').replace(/\//g, ' ').trim().toLowerCase() || (String(newFields[i]) === "" && oldFields[i] === null)) {
                newFields[i] = null;
            }
        }
        return newFields;
    } catch (err) {
        console.error("Discrepancy between the old and updated form values: ", err);
    }
}

async function editLog(isAdmin, values, log_id) {
    try {
        const div = document.getElementById('error-div');
        console.log(values);
        if (values.slice(1).every(element => element === null)) {
            if (isAdmin === true) {
                if (confirm("You have not made any changes. If you approve these changes, the existing changes (and the log itself will automatically be approved). Would you like to proceed?")) {
                    div.innerText
                } else {
                    div.innerText = 'No changes have been made.';
                    return;
                }
            }
        } else {

        }

    } catch (err) {
        console.error("Error calling router to edit log: ", err);
    }
}

// adds change log (both add and edit)
async function addLog(values, app_name) {
    try {
        const div = document.getElementById('error-div');

        // index (values[0]) will never be null
        if (values.slice(1).every(element => element === null)) {
            div.innerText = 'No fields have been changed. Request not made.';
        }
        else {
            const changes = JSON.stringify(values.slice(1));

            // add date of change, author, and set status to 'Pending'
            const now = new Date();

            let log_info = []

            log_info.push(values[0]);
            log_info.push(app_name);
            log_info.push(changes);

            log_info.push(addOrEdit ? "add" : "edit");

            // current data, author, status 
            log_info.push(now.toLocaleString());
            log_info.push("user1");
            log_info.push("Pending");

            // pass changes as string (JSON)
            const response = await fetch('/mai-form/add-log', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    log_info: log_info
                })
            })
            let data = await response.json();
            const status_msg = document.getElementById('status');

            if (data.status === 200) {
                status_msg.innerText = 'Changes have been submitted';
                document.getElementById('home-btn').hidden = false;

                document.querySelectorAll('.typ1-buttons').forEach(el => el.hidden = true);
                document.querySelectorAll('.typ2-buttons').forEach(el => el.hidden = true);
            } else {
                status_msg.innerText = 'Error occurred when submitting changes. Please try submitting again or reach out to an administrator.'
                throw new Error(data.status);
            }
        }
    } catch (err) {
        console.error("Error calling router to add log: ", err);
    }
}


let currentPagination = null;
let currentIsAdmin = null;


async function initPagination(type, isAdmin) {
    if (currentPagination === type && currentIsAdmin === isAdmin) {
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
    // type :       1 for form
    //              2 for review-changes
    let totalPages;
    if (isAdmin) {
        totalPages = 3;
    } else {
        totalPages = 2;
    }

    document.querySelectorAll('.typ1-buttons').forEach(el => el.hidden = true);
    document.querySelectorAll('.typ2-buttons').forEach(el => el.hidden = true);
    //const pagination = document.getElementById('pagination-container')

    try {
        $('#pagination').pagination({
            dataSource: new Array(totalPages),
            pageSize: 1,
            callback: function (data, pagination) {
                if (type === 1) {
                    document.getElementById('error-div').innerText = "";
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
        currentIsAdmin = isAdmin;

    } catch(err) {
        console.error('Error initializing pagination', err);
    }
}

// Helper functions
async function displayForm(original, changes) {

    console.log(original);
    // Hide search form and show entry form
    const tableForm = document.getElementById('table-form');
    let populateEntry = [];

    tableForm.removeAttribute('hidden');
    for (let i = 0; i < original.length; i++) {
        if (!changes || changes[i] === null) {
            populateEntry.push(original[i]);
        } else {
            populateEntry.push(changes[i]);
        }
    }
    
    // pg1 
    document.getElementById('appname-edit').value = populateEntry[0];//data.appName;
    document.getElementById('appnorm-edit').value = populateEntry[1];//data.appNorm;
    document.getElementById('description-edit').value = populateEntry[2];//data.description;
    document.getElementById('owner-edit').value = populateEntry[6]//data.owner;
    document.getElementById('owner-dep-edit').value = populateEntry[7]//data.ownerDep;
    document.getElementById('owner-it-edit').value = populateEntry[9]//data.ownerIt;
    document.getElementById('owner-itdep-edit').value = populateEntry[10]//data.ownerItDep;
    //pg2
    document.getElementById('numInteg-edit').value = populateEntry[14]//data.numInteg;
    document.getElementById('numActivUsr-edit').value = populateEntry[15]//data.numActivUsr;
    document.getElementById('numStaff-edit').value = populateEntry[16]//data.numStaff;
    document.getElementById('cobbId-edit').value = populateEntry[17]//data.cobbId;
    document.getElementById('vendor-edit').value = populateEntry[18]//data.vendor;
    document.getElementById('numLic-edit').value = populateEntry[19]//data.numLic;
    document.getElementById('yrCost-edit').value = populateEntry[20]//data.yrCost;
    document.getElementById('cntDates-edit').value = populateEntry[21]//data.cntDates;
    document.getElementById('details-edit').value = populateEntry[22]//data.details;
    document.getElementById('datUpdat-edit').value = populateEntry[23]//data.datUpdat;
    //pg3
    document.getElementById('EDUCat-edit').value = populateEntry[24];
    document.getElementById('EDUServ-edit').value = populateEntry[25];
    document.getElementById('CAUDParent-edit').value = populateEntry[26];
    document.getElementById('CAUDCap-edit').value = populateEntry[27];
    document.getElementById('usrProd-edit').value = populateEntry[29];
    document.getElementById('appTag-edit').value = populateEntry[31];

    // Predetermined select lists ( index: 3, 4, 5, 8, 11, 12, 13 )
    const criticality = document.getElementById('criticality-edit');
    const lifecycle = document.getElementById('lifecycle-edit');
    const community = document.getElementById('community-edit');
    const ownerBudg = document.getElementById('owner-budg-edit');
    const appType = document.getElementById('apptype-edit');
    const appDel = document.getElementById('appdel-edit');
    const platform = document.getElementById('platform-edit');
    const coreEnable = document.getElementById('coreEnable-edit');//.value = populateEntry[27];
    const comGood = document.getElementById('comGood-edit');//.value = populateEntry[30];

    // Map lists to elements
    const selectLists = [ 
        { list: criticality, value: populateEntry[3] },//data.criticality },
        { list: lifecycle, value: populateEntry[4] },//data.lifecycle },
        { list: community, value: populateEntry[5] },//data.community },
        { list: ownerBudg, value: populateEntry[8] },//data.ownerBudg },
        { list: appType, value: populateEntry[11] },//data.appType },
        { list: appDel, value: populateEntry[12] },//data.appDel },
        { list: platform, value: populateEntry[13] },//data.platform}
        { list: coreEnable, value: populateEntry[28] },//data.platform}
        { list: comGood, value: populateEntry[30] }//data.platform}

    ];

    // iterate through all selectLists and populate them as necessary
    for (let { list, value } of selectLists) {
        for (let option of list.options) {
            if (value && option.value.replace(/[()]/g, '').replace(/\//g, ' ').trim().toLowerCase() === value.replace(/[()]/g, '').replace(/\//g, ' ').trim().toLowerCase()) {
                option.selected = true;
                break;
            }
        }
    }
}

async function displayConfirm() {
    
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

    const eduCat = document.getElementById('EDUCat-edit').value;
    const eduServ = document.getElementById('EDUServ-edit').value;
    const caudParent = document.getElementById('CAUDParent-edit').value;
    const caudCap = document.getElementById('CAUDCap-edit').value;
    const coreEnable = document.getElementById('coreEnable-edit').value;
    const usrProd = document.getElementById('usrProd-edit').value;
    const comGood = document.getElementById('comGood-edit').value;
    const appTag = document.getElementById('appTag-edit').value;




    return [ appName, appNorm, description, criticality, lifecycle, community, owner, ownerDep, ownerBudg, ownerIt, ownerItDep,
        appType, appDel, platform, numInteg, numActivUsr, numStaff, cobbId, vendor, numLic, yrCost, cntDates, details, datUpdat,
        eduCat, eduServ, caudParent, caudCap, coreEnable, usrProd, comGood, appTag ];
}
