// assets/js/auth.js
const API_BASE_URL = 'http://localhost:5000/api'; // Badilisha kwa production

function showMessage(msg, type) {
    const msgDiv = document.getElementById('message-area');
    if (!msgDiv) return;
    msgDiv.textContent = msg;
    msgDiv.className = `mt-4 text-center text-sm p-2 rounded ${type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`;
    msgDiv.classList.remove('hidden');
    setTimeout(() => msgDiv.classList.add('hidden'), 5000);
}

function updateAuthUI() {
    const token = localStorage.getItem('gsmToken');
    const user = JSON.parse(localStorage.getItem('gsmUser'));
    const authLink = document.getElementById('auth-link');
    if (!authLink) return;
    if (token && user) {
        authLink.innerHTML = `<a href="profile.html" class="text-gray-700 hover:text-orange-500"><i class="fas fa-user"></i> ${user.name.split(' ')[0]}</a>`;
        if (!document.getElementById('logout-btn')) {
            const logoutLi = document.createElement('li');
            logoutLi.id = 'logout-btn';
            logoutLi.classList.add('auth-link');
            logoutLi.innerHTML = '<a href="#" class="text-gray-700 hover:text-orange-500 logout-link"><i class="fas fa-sign-out-alt"></i> Toka</a>';
            authLink.parentNode.appendChild(logoutLi);
            const logoutLink = logoutLi.querySelector('.logout-link');
            logoutLink.addEventListener('click', (e) => {
                e.preventDefault();
                if (confirm('Je, unataka kuondoka?')) {
                    localStorage.removeItem('gsmToken');
                    localStorage.removeItem('gsmUser');
                    window.location.href = '/index.html';
                }
            });
        }
    } else {
        authLink.innerHTML = '<a href="login.html" class="text-gray-700 hover:text-orange-500"><i class="fas fa-sign-in-alt"></i> Ingia</a>';
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) logoutBtn.remove();
    }
}

async function login(email, password) {
    try {
        const res = await fetch(`${API_BASE_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if (res.ok) {
            localStorage.setItem('gsmToken', data.token);
            localStorage.setItem('gsmUser', JSON.stringify(data.user));
            showMessage('Umeingia kwa mafanikio!', 'success');
            // Use absolute path to ensure proper redirect
            setTimeout(() => {
                window.location.href = '/index.html';
            }, 500);
        } else {
            showMessage(data.error || 'Hitilafu wakati wa kuingia', 'error');
        }
    } catch (error) {
        console.error('Login error:', error);
        showMessage('Tatizo la mtandao. Jaribu tena.', 'error');
    }
}

async function register(name, email, phone, location, password) {
    try {
        const res = await fetch(`${API_BASE_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fullName: name, email, password, phone, location })
        });
        const data = await res.json();
        if (res.ok) {
            showMessage('Usajili umefanikiwa! Tunakuingiza...', 'success');
            // Auto-login
            const loginRes = await fetch(`${API_BASE_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const loginData = await loginRes.json();
            if (loginRes.ok) {
                localStorage.setItem('gsmToken', loginData.token);
                localStorage.setItem('gsmUser', JSON.stringify(loginData.user));
                // Use absolute path to ensure proper redirect
                setTimeout(() => {
                    window.location.href = '/index.html';
                }, 500);
            } else {
                showMessage('Usajili umefanikiwa, lakini kuingia kulishindwa. Tafadhali ingia manually.', 'error');
            }
        } else {
            showMessage(data.error || 'Hitilafu wakati wa kujisajili', 'error');
        }
    } catch (error) {
        console.error('Registration error:', error);
        showMessage('Tatizo la mtandao. Jaribu tena.', 'error');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const loginTab = document.getElementById('login-tab');
    const registerTab = document.getElementById('register-tab');
    const loginFormDiv = document.getElementById('login-form');
    const registerFormDiv = document.getElementById('register-form');

    if (loginTab && registerTab) {
        loginTab.addEventListener('click', () => {
            loginTab.classList.add('border-orange-500', 'text-orange-500');
            loginTab.classList.remove('text-gray-500');
            registerTab.classList.remove('border-orange-500', 'text-orange-500');
            registerTab.classList.add('text-gray-500');
            loginFormDiv.classList.remove('hidden');
            registerFormDiv.classList.add('hidden');
        });
        registerTab.addEventListener('click', () => {
            registerTab.classList.add('border-orange-500', 'text-orange-500');
            registerTab.classList.remove('text-gray-500');
            loginTab.classList.remove('border-orange-500', 'text-orange-500');
            loginTab.classList.add('text-gray-500');
            registerFormDiv.classList.remove('hidden');
            loginFormDiv.classList.add('hidden');
        });
    }

    const loginBtn = document.getElementById('login-btn');
    if (loginBtn) {
        loginBtn.addEventListener('click', () => {
            const email = document.getElementById('login-email').value.trim();
            const password = document.getElementById('login-password').value;
            if (!email || !password) {
                showMessage('Tafadhali jaza barua pepe na nywila', 'error');
                return;
            }
            login(email, password);
        });
    }

    const registerBtn = document.getElementById('register-btn');
    if (registerBtn) {
        registerBtn.addEventListener('click', () => {
            const name = document.getElementById('register-name').value.trim();
            const email = document.getElementById('register-email').value.trim();
            const phone = document.getElementById('register-phone').value.trim();
            const location = document.getElementById('register-location').value.trim();
            const password = document.getElementById('register-password').value;
            const confirm = document.getElementById('register-confirm-password').value;
            const terms = document.getElementById('terms').checked;

            if (!name || !email || !password || !confirm) {
                showMessage('Jaza sehemu zote muhimu', 'error');
                return;
            }
            if (password !== confirm) {
                showMessage('Nywila hazifanani', 'error');
                return;
            }
            if (password.length < 6) {
                showMessage('Nywila iwe angalau herufi 6', 'error');
                return;
            }
            if (!terms) {
                showMessage('Kubali sheria na masharti', 'error');
                return;
            }
            register(name, email, phone, location, password);
        });
    }

    updateAuthUI();
});