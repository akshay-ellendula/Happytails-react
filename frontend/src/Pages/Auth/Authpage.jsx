import React, { useState, useEffect } from 'react';
import styles from './login_signup.module.css'; // Your CSS module
import { axiosInstance } from '../../utils/axios'; // Assuming you have axiosInstance configured
import { useNavigate } from 'react-router';

const useAlert = (initialAlert = { message: '', type: '', show: false }) => {
    const [alert, setAlert] = useState(initialAlert);

    const showAlert = (message, type) => {
        setAlert({ message, type, show: true });
        // Optional: Auto-hide after 5 seconds
        // setTimeout(() => setAlert({ message: '', type: '', show: false }), 5000);
    };

    const clearAlerts = () => {
        setAlert({ message: '', type: '', show: false });
    };

    return [alert, showAlert, clearAlerts];
};

function AuthPage() {
    const [isSignIn, setIsSignIn] = useState(true);
    const [alert, showAlert, clearAlerts] = useAlert();
    // Match state names with backend controller expectations
    const [loginInput, setLoginInput] = useState({ email: '', password: '' });
    const [signupInput, setSignupInput] = useState({ userName: '', email: '', password: '' });
    const [errorFields, setErrorFields] = useState({});
    const navigate = useNavigate();

    useEffect(() => {
        clearAlerts();
        setErrorFields({});
    }, [isSignIn]);

    const handleLoginChange = (e) => {
        const { name, value } = e.target;
        setLoginInput(prev => ({ ...prev, [name]: value }));
        if (errorFields[name]) {
            setErrorFields(prev => ({ ...prev, [name]: undefined })); // Clear specific error
        }
    };

    const handleSignupChange = (e) => {
        const { name, value } = e.target;
        setSignupInput(prev => ({ ...prev, [name]: value }));
        if (errorFields[name]) {
            setErrorFields(prev => ({ ...prev, [name]: undefined })); // Clear specific error
        }
    };

    const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    const validateLogin = () => {
        let errors = {};
        if (!loginInput.email.trim()) errors.email = 'Email is required';
        else if (!validateEmail(loginInput.email.trim())) errors.email = 'Please enter a valid email';
        if (!loginInput.password) errors.password = 'Password is required';
        else if (loginInput.password.length < 6) errors.password = 'Password must be at least 6 characters';
        setErrorFields(errors);
        return Object.keys(errors).length === 0;
    };

    const validateSignup = () => {
        let errors = {};
        if (!signupInput.userName.trim()) errors.userName = 'Name is required';
        else if (signupInput.userName.trim().length < 2) errors.userName = 'Name must be at least 2 characters';
        else if (!/^[a-zA-Z ]+$/.test(signupInput.userName.trim())) errors.userName = 'Name can only contain letters/spaces';
        if (!signupInput.email.trim()) errors.email = 'Email is required';
        else if (!validateEmail(signupInput.email.trim())) errors.email = 'Please enter a valid email';
        if (!signupInput.password) errors.password = 'Password is required';
        else if (signupInput.password.length < 6) errors.password = 'Password must be at least 6 characters';
        setErrorFields(errors);
        return Object.keys(errors).length === 0;
    };

    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        clearAlerts();
        if (!validateLogin()) {
            showAlert('Please fix the errors above.', 'error');
            return;
        }
        try {
            const response = await axiosInstance.post('/auth/signin', loginInput); // Use API endpoint
            if (response.data.success) {
                showAlert('Login successful! Redirecting...', 'success');
                setTimeout(() => navigate('/'), 1500); // Redirect to home
            }
        } catch (error) {
            const message = error.response?.data?.message || 'Login failed. Please try again.';
            showAlert(message, 'error');
            console.error('Login error:', error.response?.data || error);
        }
    };

    const handleSignupSubmit = async (e) => {
        e.preventDefault();
        clearAlerts();
        if (!validateSignup()) {
            showAlert('Please fix the errors above.', 'error');
            return;
        }
        try {
            const response = await axiosInstance.post('/auth/signup', signupInput); // Use API endpoint
            if (response.data.success) {
                showAlert('Registration successful! Please sign in.', 'success');
                setTimeout(() => {
                    setIsSignIn(true); // Switch to sign-in form
                    clearAlerts();
                }, 1500);
            }
        } catch (error) {
            const message = error.response?.data?.message || 'Signup failed. Please try again.';
            showAlert(message, 'error');
            console.error('Signup error:', error.response?.data || error);
        }
    };

    const handleForgotPassword = (e) => {
        e.preventDefault();
        clearAlerts();
        const email = loginInput.email.trim();
        if (!email || !validateEmail(email)) {
            setErrorFields(prev => ({ ...prev, email: 'Please enter a valid email first' }));
            showAlert('Please enter your email address first.', 'warning');
            return;
        }
        // TODO: Implement actual forgot password API call
        showAlert('Password reset link sent (simulation).', 'info');
    };

    const getInputClasses = (name) => {
        const classes = [styles.input];
        if (errorFields[name]) {
            classes.push(styles['input-error'], styles.shake);
        }
        return classes.join(' ');
    };

    const renderFieldError = (name) => {
        if (errorFields[name]) {
            return (
                <div key={`${name}-error`} className={`${styles.alert} ${styles['alert-error']} ${styles.show}`}>
                    {errorFields[name]}
                </div>
            );
        }
        return null;
    };

    return (
        // Apply body class to the root fragment or a wrapping div if preferred
        <div className={styles.body}>
            <div className={styles.navbar}>
                <header className={styles.header}>
                    {/* Use .a for the link and .badge for styling */}
                    <a href="/" className={`${styles.a} ${styles.badge}`}>Happy Tails</a>
                </header>
            </div>

            <div className={styles.container} id="container">
                <div className={styles['toggle-container']}>
                    <button
                        type="button" // Add type="button"
                        id="signInToggle"
                        className={`${styles['toggle-button']} ${isSignIn ? styles.active : ''}`}
                        onClick={() => setIsSignIn(true)}
                    >
                        Sign In
                    </button>
                    <button
                         type="button" // Add type="button"
                        id="signUpToggle"
                        className={`${styles['toggle-button']} ${!isSignIn ? styles.active : ''}`}
                        onClick={() => setIsSignIn(false)}
                    >
                        Sign Up
                    </button>
                </div>

                <div className={styles['form-container']} id="formContainer">
                    {/* Sign In Form */}
                    <form
                        id="signInForm"
                        // Apply .form and conditionally .active-form
                        className={`${styles.form} ${isSignIn ? styles['active-form'] : ''}`}
                        onSubmit={handleLoginSubmit}
                        // Use CSS for visibility instead of inline style if possible,
                        // otherwise keep inline style for smooth transitions
                        // style={{ display: isSignIn ? 'flex' : 'none' }}
                    >
                        {/* Use .h1 */}
                        <h1 className={styles.h1}>Welcome Back!</h1>

                        {/* Global Alert (shown only when no field errors) */}
                        {alert.show && Object.values(errorFields).every(v => !v) && (
                            <div className={`${styles.alert} ${styles['alert-' + alert.type]} ${styles.show}`}>{alert.message}</div>
                        )}

                        {/* Email Input - Use .input */}
                        <input
                            type="email"
                            name="email" // Match state key
                            placeholder="Email"
                            required
                            value={loginInput.email}
                            onChange={handleLoginChange}
                            className={getInputClasses('email')} // Combines .input with error classes
                        />
                        {renderFieldError('email')}

                        {/* Password Input - Use .input */}
                        <input
                            type="password"
                            name="password" // Match state key
                            placeholder="Password"
                            required
                            value={loginInput.password}
                            onChange={handleLoginChange}
                            className={getInputClasses('password')}
                        />
                        {renderFieldError('password')}

                         {/* Forgot Password Link - Use .a and specific class */}
                        <a href="#forgot" className={`${styles.a} ${styles['forgot-password']}`} onClick={handleForgotPassword}>
                            Forgot your password?
                        </a>

                        {/* Submit Button - Use .button and specific class */}
                        <button type="submit" className={`${styles.button} ${styles.signin_button}`} style={{ marginTop: '10px' }}> {/* Adjusted margin */}
                            Sign In
                        </button>
                    </form>

                    {/* Sign Up Form */}
                    <form
                        id="signUpForm"
                         // Apply .form and conditionally .active-form
                        className={`${styles.form} ${!isSignIn ? styles['active-form'] : ''}`}
                        onSubmit={handleSignupSubmit}
                        // style={{ display: !isSignIn ? 'flex' : 'none' }}
                    >
                         {/* Use .h1 */}
                        <h1 className={styles.h1}>Create Account</h1>

                         {/* Global Alert */}
                        {alert.show && Object.values(errorFields).every(v => !v) && (
                            <div className={`${styles.alert} ${styles['alert-' + alert.type]} ${styles.show}`}>{alert.message}</div>
                        )}

                         {/* Name Input - Use .input */}
                        <input
                            type="text"
                            name="userName" // Match state key
                            placeholder="Name"
                            required
                            value={signupInput.userName}
                            onChange={handleSignupChange}
                            className={getInputClasses('userName')}
                        />
                        {renderFieldError('userName')}

                         {/* Email Input - Use .input */}
                        <input
                            type="email"
                            name="email" // Match state key
                            placeholder="Email"
                            required
                            value={signupInput.email}
                            onChange={handleSignupChange}
                            className={getInputClasses('email')}
                        />
                        {renderFieldError('email')}

                        {/* Password Input - Use .input */}
                        <input
                            type="password"
                            name="password" // Match state key
                            placeholder="Password"
                            required
                            value={signupInput.password}
                            onChange={handleSignupChange}
                            className={getInputClasses('password')}
                        />
                        {renderFieldError('password')}

                         {/* Submit Button - Use .button */}
                        <button type="submit" className={styles.button} style={{ marginTop: '20px' }}>
                            Sign Up
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default AuthPage;