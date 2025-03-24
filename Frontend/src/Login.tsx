import React, { useState } from "react";
import styles from './Login.module.css';
import logo from './Images/hobiz_logo-removebg-preview.png';
import { Link, useNavigate } from 'react-router-dom';
import GoogleLoginButton from "./components/GoogleLoginButton";
import axios from 'axios';


interface GoogleLoginButtonProps {
    onSuccess: (credentialResponse: any) => void;
}

const Login: React.FC = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();


    const handleGoogleLoginSuccess = async (credentialResponse: any) => {
        try {
            const response = await axios.post(`http://${import.meta.env.VITE_REACT_APP_API_URL}/auth/login`, {
                token: credentialResponse.credential,
            });
    
            if (response.status === 200) {
                localStorage.setItem('authToken', response.data.accessToken);
                localStorage.setItem('userId', response.data._id);
                console.log("Saved token to localStorage:", response.data.accessToken);
                navigate('/home');
            } else {
                setError('Google login failed.');
            }
        } catch (err) {
            console.error("Google login error:", err);
            setError('Google login failed. Please try again.');
        }
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://${import.meta.env.REACT_APP_API_URL}/auth/login', { email, password });

            if (response.status === 200) { // בדיקה שהבקשה הצליחה
                localStorage.setItem('authToken', response.data.accessToken);
                localStorage.setItem('userId', response.data._id);
                localStorage.setItem("authToken", response.data.accessToken);
                console.log("Saved token to localStorage:", response.data.accessToken);
                navigate('/home');
            } else {
                setError('Invalid email or password');
            }
        } catch (err) {
            console.error("Login error:", err); // הוספה כאן
            if (axios.isAxiosError(err) && err.response && err.response.status === 401) {
                setError('Invalid email or password');
            } else {
                setError('Login failed. Please try again.');
            }

        }
        
    };


    return (
        <div className={styles.loginContainer}>
            <img src={logo} alt="Hobiz Logo" className={styles.logo} />
            <p className={styles.loginSubtitle}>
                Welcome to EcoShare – share what you don’t need, help those who need, and connect with your community!
            </p>
            <div className={styles.loginCard}>
                <form onSubmit={handleLogin}>
                    {error && <p className={styles.errorMessage}>{error}</p>}
                    <div className={styles.inputGroup}>
                        <span className={styles.inputIcon}>
                            <i className="fas fa-user"></i>
                        </span>
                        <input
                            type="email"
                            className={styles.loginInput}
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div className={styles.inputGroup}>
                        <span className={styles.inputIcon}>
                            <i className="fas fa-lock"></i>
                        </span>
                        <input
                            type="password"
                            className={styles.loginInput}
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <button type="submit" className={styles.loginButton}>
                        Continue with email
                    </button>
                </form>
                <div className={styles.googleLoginButton}>
                    <GoogleLoginButton onSuccess={(credentialResponse) => handleGoogleLoginSuccess(credentialResponse)} />
                </div>
            </div>
            <button className={styles.Forgotpassword}>Forgot password?</button>
            <button className={styles.signupButton}>
                <Link to="/signup" style={{ color: 'white', textDecoration: 'none' }}>Sign Up</Link>
            </button>
        </div>
    );
};

export default Login;