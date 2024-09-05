document.addEventListener('DOMContentLoaded', function () {
    let originFormData = null;
    document.getElementById('get-entry').addEventListener('click', async function(event) {
        event.preventDefault();
        originFormData = await populateForm();
    });

    document.getElementById('make-changes').addEventListener('click', async function(event) {
        event.preventDefault();
        editEntry(originFormData);
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
                data.index = null;
                data.fName = null;
                data.lName = null;
                data.email = null;
                data.description = null;
            }
            else {
            const error = document.getElementById('error-div');
            error.innerText = data.values;
            }
        } else {
            // Hide search form and show entry form
            const entryForm = document.getElementById('entry-form');
            entryForm.setAttribute('hidden', true);
            const tableForm = document.getElementById('table-form');
            tableForm.removeAttribute('hidden');

            // Fill in entry form with current information
            document.getElementById('fname-edit').value = data.fName;
            document.getElementById('lname-edit').value = data.lName;
            document.getElementById('email-edit').value = data.email;
            document.getElementById('description-edit').value = data.description;
            return [data.index, data.fName, data.lName, data.email, data.description];
        }
    }
    catch (err) {
        console.error('Error populating worksheet div', err);
        return [];
    }
}

async function editEntry(originFormData) {
    try {
        const fName = document.getElementById('fname-edit').value;
        const lName = document.getElementById('lname-edit').value;
        const email = document.getElementById('email-edit').value;
        const description = document.getElementById('description-edit').value;
        const div = document.getElementById

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