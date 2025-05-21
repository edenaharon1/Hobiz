import React, { useState } from "react";
import styles from './Login.module.css'; // משתמש באותם סטיילים
import logo from './Images/logo (2).png';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { GoogleLogin } from '@react-oauth/google';

const SignUp: React.FC = () => {
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:3001/auth/register', {
                username: fullName,
                email: email,
                password: password
            });
    
            if (response.status === 201 || response.status === 200) { // בדיקה שההרשמה הצליחה
                console.log("Sign Up response data:", response.data);
                // שים לב שה-userId נמצא בתוך response.data.user._id
                if (response.data.accessToken && response.data.user && response.data.user._id) {
                    localStorage.setItem('authToken', response.data.accessToken);
                    localStorage.setItem('userId', response.data.user._id);
                    console.log("Saved token and userId to localStorage:", response.data.accessToken, response.data.user._id);
                } else {
                    console.warn("No token or user ID returned on sign up");
                }
    
                navigate('/home'); // ניווט לדף הבית או לדף אחר
            } else {
                console.error("Unexpected response status on sign up:", response.status);
            }
    
        } catch (error) {
            console.error("Sign Up Failed:", error);
        }
    };
    
    

    const handleGoogleSignUpSuccess = async (credentialResponse: any) => {
        const credential = credentialResponse?.credential;
        if (credential) {
            try {
                const response = await axios.post('http://localhost:3001/auth/google-signup', { // נתיב חדש ל-Google Sign Up
                    token: credential,
                });
                console.log("Google Sign Up Successful:", response.data);
                localStorage.setItem('authToken', response.data.accessToken);
                localStorage.setItem('refreshToken', response.data.refreshToken);
                navigate('/home');
            } catch (error: any) {
                console.error("Google Sign Up Error:", error.response?.data || error.message);
            }
        }
    };

    const handleGoogleSignUpFailure = () => {
        console.error("Google Sign Up Failed");
    };

    return (
        <div className={styles.loginContainer}>
            <img src={logo} alt="EcoShare Logo" className={styles.logo} />
            <p className={styles.loginSubtitle}>
                Welcome to EcoShare – share what you don’t need, help those who need, and connect with your community!
            </p>

            <div className={styles.loginCard}>
                <form onSubmit={handleSignUp}>
                    <div className={styles.inputGroup}>
                        <span className={styles.inputIcon}>
                            <i className="fas fa-user"></i>
                        </span>
                        <input
                            type="text"
                            className={styles.loginInput}
                            placeholder="Full Name"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <span className={styles.inputIcon}>
                            <i className="fas fa-envelope"></i>
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

                    <button type="submit" className={styles.signupButton}>
                        Sign Up
                    </button>
                </form>

                <div className={styles.googleButtonContainer}>
                    <GoogleLogin
                        onSuccess={handleGoogleSignUpSuccess}
                        onError={handleGoogleSignUpFailure}
                    />
                </div>
            </div>

            <button className={styles.signupButton}>
                <Link to="/" style={{ color: 'white', textDecoration: 'none' }}>Already have an account?</Link>
            </button>
        </div>
    );
};

export default SignUp;