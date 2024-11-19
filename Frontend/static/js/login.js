document.getElementById('login-form').addEventListener('submit', async function(event) {
    event.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    const loginData = {
        username: username,
        password: password
    };

    try {
        const response = await fetch('http://127.0.0.1:8000/login/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(loginData)
        });

        if (!response.ok) {
            const errorData = await response.json();
            alert('Login failed: ' + errorData.error);
            return;
        }

        const data = await response.json();
        // Store the tokens and username
        localStorage.setItem('access_token', data.access);
        localStorage.setItem('refresh_token', data.refresh);
        localStorage.setItem('username', data.username);

        // Changed this line to redirect to username only
        window.location.href = `/${data.username}`;
        
    } catch (error) {
        console.error('Login error:', error);
        alert('An error occurred: ' + error.message);
    }
});