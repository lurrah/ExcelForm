document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('login').addEventListener('click', function(){
        window.location.href = '../search'
    });
    document.getElementById('admin').addEventListener('click', function(){
        window.location.href = '../admin'
    });
})