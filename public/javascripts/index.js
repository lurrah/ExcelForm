document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('login').addEventListener('click', function(){
        login();
        window.location.href = '../search'
    });
    document.getElementById('admin').addEventListener('click', function(){
        window.location.href = '../admin'
    });
})

async function login() {
    const response = await fetch('/login');
    const data = await response.text();
    console.log(data);
}