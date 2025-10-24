import React, { useState, useEffect } from 'react';
import styles from './login_signup.module.css'; // Changed import to module.css

/**
 * Custom hook to handle alert state and display
 * @param {object} initialAlert - Initial alert state { message, type, show }
 */
const useAlert = (initialAlert = { message: '', type: '', show: false }) => {
    const [alert, setAlert] = useState(initialAlert);

    const showAlert = (message, type) => {
        setAlert({ message, type, show: true });
        // Optionally set a timeout to hide the alert after some time
        // setTimeout(() => setAlert({ message: '', type: '', show: false }), 5000);
    };

    const clearAlerts = () => {
        setAlert({ message: '', type: '', show: false });
    };

    return [alert, showAlert, clearAlerts];
};

/**
 * Represents the combined Login and Sign Up page.
 */
function AuthPage() {
    const [isSignIn, setIsSignIn] = useState(true);
    const [alert, showAlert, clearAlerts] = useAlert();
    const [loginInput, setLoginInput] = useState({ user_email: '', user_password: '' });
    const [signupInput, setSignupInput] = useState({ user_name: '', user_email: '', user_password: '' });
    const [errorFields, setErrorFields] = useState({});

    // Clear alerts and errors when switching between Sign In and Sign Up
    useEffect(() => {
        clearAlerts();
        setErrorFields({});
    }, [isSignIn]); // eslint-disable-line react-hooks/exhaustive-deps

    // Handlers for form input changes
    const handleLoginChange = (e) => {
        const { name, value } = e.target;
        setLoginInput(prev => ({ ...prev, [name]: value }));
        // Clear specific field error on change
        if (errorFields[name]) {
            setErrorFields(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const handleSignupChange = (e) => {
        const { name, value } = e.target;
        setSignupInput(prev => ({ ...prev, [name]: value }));
        // Clear specific field error on change
        if (errorFields[name]) {
            setErrorFields(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const validateEmail = (email) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    const validateLogin = () => {
        let isValid = true;
        let errors = {};

        if (!loginInput.user_email.trim()) {
            errors.user_email = 'Email is required';
            isValid = false;
        } else if (!validateEmail(loginInput.user_email.trim())) {
            errors.user_email = 'Please enter a valid email address';
            isValid = false;
        }

        if (!loginInput.user_password) {
            errors.user_password = 'Password is required';
            isValid = false;
        } else if (loginInput.user_password.length < 6) {
            errors.user_password = 'Password must be at least 6 characters';
            isValid = false;
        }

        setErrorFields(errors);
        return isValid;
    };

    const validateSignup = () => {
        let isValid = true;
        let errors = {};

        if (!signupInput.user_name.trim()) {
            errors.user_name = 'Name is required';
            isValid = false;
        } else if (signupInput.user_name.trim().length < 2) {
            errors.user_name = 'Name must be at least 2 characters';
            isValid = false;
        } else if (!/^[a-zA-Z ]+$/.test(signupInput.user_name.trim())) {
            errors.user_name = 'Name can only contain letters and spaces';
            isValid = false;
        }

        if (!signupInput.user_email.trim()) {
            errors.user_email = 'Email is required';
            isValid = false;
        } else if (!validateEmail(signupInput.user_email.trim())) {
            errors.user_email = 'Please enter a valid email address';
            isValid = false;
        }

        if (!signupInput.user_password) {
            errors.user_password = 'Password is required';
            isValid = false;
        } else if (signupInput.user_password.length < 6) {
            errors.user_password = 'Password must be at least 6 characters';
            isValid = false;
        }

        setErrorFields(errors);
        return isValid;
    };

    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        clearAlerts();

        if (!validateLogin()) {
            showAlert('Please fix the errors above.', 'error');
            return;
        }

        try {
            const response = await fetch('/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(loginInput)
            });

            const data = await response.json();

            if (data.success) {
                showAlert(data.message || 'Login successful! Redirecting...', 'success');
                setTimeout(() => {
                    window.location.href = data.redirect || '/home';
                }, 2000);
            } else {
                showAlert(data.message || 'An error occurred during login', 'error');
            }
        } catch (error) {
            showAlert('Network error. Please try again later.', 'error');
            console.error('Login error:', error);
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
            const response = await fetch('/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(signupInput)
            });

            const data = await response.json();

            if (data.success) {
                showAlert(data.message || 'Registration successful!', 'success');
                // Optionally switch to login form after successful signup
                // setIsSignIn(true);
            } else {
                showAlert(data.message || 'An error occurred during signup', 'error');
            }
        } catch (error) {
            showAlert('Network error. Please try again later.', 'error');
            console.error('Signup error:', error);
        }
    };

    const handleForgotPassword = (e) => {
        e.preventDefault();
        clearAlerts();

        const email = loginInput.user_email.trim();

        if (!email || !validateEmail(email)) {
            setErrorFields(prev => ({ ...prev, user_email: 'Please enter a valid email first' }));
            showAlert('Please enter a valid email first', 'error');
            return;
        }

        // Simulate password reset (replace with actual backend call if implemented)
        showAlert('Password reset link has been sent to your email.', 'warning');
    };

    // Helper to apply classes for input errors
    const getInputClasses = (name) => {
        // Use an array to build the class string for clarity
        const classes = [styles.input]; // Apply the base input class first
        if (errorFields[name]) {
            classes.push(styles['input-error'], styles.shake);
        }
        return classes.join(' ');
    };

    // Helper to render field-specific error messages
    const renderFieldError = (name) => {
        if (errorFields[name]) {
            return (
                // Use alert classes from styles
                <div key={name} className={`${styles.alert} ${styles['alert-error']} ${styles.show}`}>
                    {errorFields[name]}
                </div>
            );
        }
        return null;
    };


    return (
        <>
            <div className={styles.navbar}>
                <header className={styles.header}>
                    <a href="/home" className={styles.badge}>Happy Tails</a>
                </header>
            </div>
            <div className={styles.container} id="container">

                {/* Toggle Container */}
                <div className={styles['toggle-container']}>
                    <button
                        id="signInToggle"
                        className={`${styles['toggle-button']} ${isSignIn ? styles.active : ''}`}
                        onClick={() => setIsSignIn(true)}
                    >
                        Sign In
                    </button>
                    <button
                        id="signUpToggle"
                        className={`${styles['toggle-button']} ${!isSignIn ? styles.active : ''}`}
                        onClick={() => setIsSignIn(false)}
                    >
                        Sign Up
                    </button>
                </div>

                {/* Form Container */}
                <div className={styles['form-container']} id="formContainer">

                    {/* Sign In Form */}
                    <form
                        id="signInForm"
                        className={`${styles.form} ${isSignIn ? styles['active-form'] : styles['hidden-form']}`}
                        onSubmit={handleLoginSubmit}
                        style={{ display: isSignIn ? 'flex' : 'none' }} // Ensure form is truly hidden for accessibility/performance
                    >
                        <h1>Welcome Back!</h1>
                        {alert.show && !Object.keys(errorFields).length && (
                            <div className={`${styles.alert} ${styles['alert-' + alert.type]} ${styles.show}`}>{alert.message}</div>
                        )}
                        <input
                            type="email"
                            name="user_email"
                            placeholder="Email"
                            required
                            value={loginInput.user_email}
                            onChange={handleLoginChange}
                            className={getInputClasses('user_email')}
                        />
                        {renderFieldError('user_email')}
                        <input
                            type="password"
                            name="user_password"
                            placeholder="Password"
                            required
                            value={loginInput.user_password}
                            onChange={handleLoginChange}
                            className={getInputClasses('user_password')}
                        />
                        {renderFieldError('user_password')}
                        <a href="#forgot" className={styles['forgot-password']} onClick={handleForgotPassword}>Forgot your password?</a>
                        <button type="submit" className={`${styles.button} ${styles.signin_button}`} style={{ marginTop: '30px' }}>Sign In</button>
                    </form>

                    {/* Sign Up Form */}
                    <form
                        id="signUpForm"
                        className={`${styles.form} ${!isSignIn ? styles['active-form'] : styles['hidden-form']}`}
                        onSubmit={handleSignupSubmit}
                        style={{ display: !isSignIn ? 'flex' : 'none' }} // Ensure form is truly hidden for accessibility/performance
                    >
                        <h1>Create Account</h1>
                        {alert.show && !Object.keys(errorFields).length && (
                            <div className={`${styles.alert} ${styles['alert-' + alert.type]} ${styles.show}`}>{alert.message}</div>
                        )}
                        <input
                            type="text"
                            name="user_name"
                            placeholder="Name"
                            required
                            value={signupInput.user_name}
                            onChange={handleSignupChange}
                            className={getInputClasses('user_name')}
                        />
                        {renderFieldError('user_name')}
                        <input
                            type="email"
                            name="user_email"
                            placeholder="Email"
                            required
                            value={signupInput.user_email}
                            onChange={handleSignupChange}
                            className={getInputClasses('user_email')}
                        />
                        {renderFieldError('user_email')}
                        <input
                            type="password"
                            name="user_password"
                            placeholder="Password"
                            required
                            value={signupInput.user_password}
                            onChange={handleSignupChange}
                            className={getInputClasses('user_password')}
                        />
                        {renderFieldError('user_password')}
                        <button type="submit" className={styles.button} style={{ marginTop: '20px' }}>Sign Up</button>
                    </form>
                </div>
            </div>
        </>
    );
}

export default AuthPage;