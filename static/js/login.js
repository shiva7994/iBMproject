document.addEventListener('DOMContentLoaded', () => {
    const loginTab = document.getElementById('login-tab');
    const registerTab = document.getElementById('register-tab');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const flashMessagesDiv = document.getElementById('flash-messages');

    // Function to display messages (mimicking Flask's flash)
    function displayMessage(message, category) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `p-3 mb-2 rounded-md text-sm `;
        if (category === 'error') {
            messageDiv.classList.add('bg-red-100', 'text-red-700');
        } else if (category === 'success') {
            messageDiv.classList.add('bg-green-100', 'text-green-700');
        } else {
            messageDiv.classList.add('bg-blue-100', 'text-blue-700');
        }
        messageDiv.setAttribute('role', 'alert');
        messageDiv.textContent = message;
        flashMessagesDiv.innerHTML = ''; // Clear previous messages
        flashMessagesDiv.appendChild(messageDiv);
    }

    // Tab switching logic
    loginTab.addEventListener('click', () => {
        loginTab.classList.add('active');
        registerTab.classList.remove('active');
        loginForm.classList.remove('hidden');
        registerForm.classList.add('hidden');
        flashMessagesDiv.innerHTML = ''; // Clear messages on tab switch
    });

    registerTab.addEventListener('click', () => {
        registerTab.classList.add('active');
        loginTab.classList.remove('active');
        registerForm.classList.remove('hidden');
        loginForm.classList.add('hidden');
        flashMessagesDiv.innerHTML = ''; // Clear messages on tab switch
    });

    // Handle Login Form Submission
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault(); // Prevent default form submission

        const username = loginForm['login-username'].value;
        const password = loginForm['login-password'].value;

        try {
            const response = await fetch('/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded', // Use this for Flask form data
                },
                body: new URLSearchParams({ username, password }).toString(),
            });

            const result = await response.json();

            if (result.success) {
                // Flask flashes messages, but we'll mimic client-side flash too if needed
                // displayMessage(result.message || 'Logged in successfully!', 'success');
                window.location.href = result.redirect_url; // Redirect to main page
            } else {
                displayMessage(result.message || 'Login failed.', 'error');
            }
        } catch (error) {
            console.error('Login error:', error);
            displayMessage('An error occurred during login. Please try again.', 'error');
        }
    });

    // Handle Register Form Submission
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault(); // Prevent default form submission

        const username = registerForm['register-username'].value;
        const password = registerForm['register-password'].value;
        const confirmPassword = registerForm['confirm-password'].value;

        if (password !== confirmPassword) {
            displayMessage('Passwords do not match.', 'error');
            return;
        }

        try {
            const response = await fetch('/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({ username, password }).toString(),
            });

            const result = await response.json();

            if (result.success) {
                displayMessage(result.message || 'Registration successful! You can now log in.', 'success');
                // Optionally switch to login tab after successful registration
                loginTab.click();
            } else {
                displayMessage(result.message || 'Registration failed.', 'error');
            }
        } catch (error) {
            console.error('Registration error:', error);
            displayMessage('An error occurred during registration. Please try again.', 'error');
        }
    });
});
