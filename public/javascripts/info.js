document.addEventListener('DOMContentLoaded', async function () {
    let originFormData = null;
    document.getElementById('get-entry').addEventListener('click', async function(event) {
        event.preventDefault();
        originFormData = await populateForm();
    });

    const button = document.getElementById('make-changes');
    button.addEventListener('click', async function(event) {
        event.preventDefault
        if (button.textContent === 'Make Changes') {
            await editEntry(originFormData);
        } else {
            await addEntry();
        }
    })
});

async function populateForm() {
    try{ 
        const fName = document.getElementById('fname').value;
        const lName = document.getElementById('lname').value;

        const url = new URL('/info/get-entry', window.location.origin);
        const params = { fName, lName };
        Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));

        const response = await fetch(url, {
            method: 'GET',
        })

        data = await response.json();
        if (data.error) {
            if (data.error === 1) {

                // error means entry is not found, therefore, add entry
                data.index = null;
                data.fName = null;
                data.lName = null;
                data.email = null;
                data.description = null;

                displayEditTable(data);
                document.getElementById("make-changes").textContent = "Add Entry"
            }
            else {
            const error = document.getElementById('error-div');
            error.innerText = data.values;
            }
        } else {
            // Fill in entry form with current information
            displayEditTable(data);
            document.getElementById("make-changes").textContent = "Make Changes"

            return [data.index, data.fName, data.lName, data.email, data.description];
        }
    }
    catch (err) {
        console.error('Error populating worksheet div', err);
        return [];
    }
}

async function displayEditTable(data) {
    // Hide search form and show entry form
    const entryForm = document.getElementById('entry-form');
    entryForm.setAttribute('hidden', true);
    const tableForm = document.getElementById('table-form');
    tableForm.removeAttribute('hidden');

    document.getElementById('fname-edit').value = data.fName;
    document.getElementById('lname-edit').value = data.lName;
    document.getElementById('email-edit').value = data.email;
    document.getElementById('description-edit').value = data.description;
}

async function editEntry(originFormData) {
    try {
        const fName = document.getElementById('fname-edit').value;
        const lName = document.getElementById('lname-edit').value;
        const email = document.getElementById('email-edit').value;
        const description = document.getElementById('description-edit').value;

        let newEntry = [fName, lName, email, description];
        
        newEntry = await detectChanges(originFormData.slice(1), newEntry);
        console.log(newEntry);
        if (newEntry.every(element => element === null)) {
            const div = document.getElementById('error-div');
            div.innerText = 'No changes have been made';
        }
        else {
            const response = fetch('/info/edit-entry', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    values: newEntry,
                    index: originFormData[0]
                })
            })
            
            const div = document.getElementById('error-div');
            div.innerText = 'Changes have been made';
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
        const fName = document.getElementById('fname-edit').value;
        const lName = document.getElementById('lname-edit').value;
        const email = document.getElementById('email-edit').value;
        const description = document.getElementById('description-edit').value;

        let newEntry = [fName, lName, email, description];
        
        if (newEntry.every(element => element === null)) {
            const div = document.getElementById('error-div');
            div.innerText = 'Entry not added';
        }
        else {
            const response = fetch('/info/add-entry', {
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