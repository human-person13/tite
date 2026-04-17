import { getSessionData, signInUser, signUpUser } from './firebase-service.js';

(function () {
    const loginButton = document.getElementById('login-submit');
    const signupButton = document.getElementById('signup-submit');
    const loginStatus = document.getElementById('login-status');
    const signupStatus = document.getElementById('signup-status');

    function setStatus(element, message, isError) {
        element.textContent = message || '';
        element.style.color = isError ? '#8b1e1e' : '#2e6b3c';
    }

    async function checkSession() {
        try {
            await getSessionData();
            window.location.href = 'Index.html';
        } catch (error) {
            if (error.message !== 'Login required.') {
                setStatus(loginStatus, error.message, true);
            }
        }
    }

    async function handleLogin() {
        setStatus(loginStatus, '', false);
        try {
            const email = document.getElementById('login-email').value.trim();
            const password = document.getElementById('login-password').value;
            if (!email || !password) {
                throw new Error('Email and password needed.');
            }
            loginButton.disabled = true;
            setStatus(loginStatus, 'Logging in...', false);
            await signInUser({ email, password });
            window.location.href = 'Index.html';
        } catch (error) {
            setStatus(loginStatus, error.message, true);
        } finally {
            loginButton.disabled = false;
        }
    }

    async function handleSignup() {
        setStatus(signupStatus, '', false);
        try {
            const name = document.getElementById('signup-username').value.trim();
            const email = document.getElementById('signup-email').value.trim();
            const password = document.getElementById('signup-password').value;
            const confirmPassword = document.getElementById('signup-confirm').value;
            if (!name || !email || !password) {
                throw new Error('All fields needed.');
            }
            if (password.length < 6) {
                throw new Error('Password needs 6 chars.');
            }
            if (password !== confirmPassword) {
                throw new Error('Passwords must match.');
            }
            signupButton.disabled = true;
            setStatus(signupStatus, 'Creating account...', false);
            await signUpUser({ name, email, password });
            window.location.href = 'Index.html';
        } catch (error) {
            setStatus(signupStatus, error.message, true);
        } finally {
            signupButton.disabled = false;
        }
    }

    loginButton?.addEventListener('click', handleLogin);
    signupButton?.addEventListener('click', handleSignup);
    checkSession();
}());
