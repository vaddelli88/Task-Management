const base = "http://127.0.0.1:8000/";

document.getElementById('register-form').addEventListener('submit', function(event) {
    event.preventDefault();

    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const first_name = document.getElementById('first').value;
    const last_name = document.getElementById('last').value;

    const data = { username, email, password, first_name, last_name };

    fetch(base + '/register/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            alert(data.error);
        } else {
            alert(data.message);
            window.location.href = '/login'; // Redirect to the login page on frontend (without the '.html' extension)

        }
    })
    .catch(error => console.error('Error:', error));
});
