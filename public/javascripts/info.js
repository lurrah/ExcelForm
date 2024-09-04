document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('entry-form').addEventListener('submit', function(event) {
        event.preventDefault();
        populateWS();
    });

    document.getElementById('table-form').addEventListener('submit', function(event) {
        event.preventDefault();
        editEntry();
    })
});

function populateWS() {
    const fName = document.getElementById('fname').value;
    const lName = document.getElementById('lname').value;

    const url = new URL('/info/get-entry', window.location.origin);
    const params = { fName, lName };
    Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));

    fetch(url, {
        method: 'GET',
    })
    .then(response => response.json())
    .then(data=> {
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

        //data = JSON.stringify(data, null, 2);

    })
    .catch(err => {
        console.error('Error populating worksheet div', err);
    })

    function editEntry() {
        const fName = document.getElementById('fname').value;
        const lName = document.getElementById('lname').value;
        const email = document.getElementById('email').value;
        const description = document.getElementById('description').value;

        // const url = new URL('/info/edit-entry', window.location.origin);
        // const params = { fName, lName, email, description };
        // Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));


        fetch('/info/edit-entry', {
            method: 'PATCH',
            body: JSON.stringify({ fName: fName, lName: lName, email: email, description: description })
        })
        .then(response => response.json())
        .then(data => console.log("Success"))
        .catch(err => {
            console.error('Error editing table entry', err)
        })
    }
}