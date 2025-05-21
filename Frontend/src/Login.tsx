import React, { useState } from "react";
import styles from './Login.module.css';
import logo from './Images/logo (2).png';
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
            const response = await axios.post(`http://localhost:3001/auth/google-login`, {
                token: credentialResponse.credential,
            });
            console.log("Google login full response data:", response.data);
    
            if (response.status === 200) {
                const { accessToken, _id } = response.data;  // תיקנתי כאן
                localStorage.setItem('authToken', accessToken);
                localStorage.setItem('userId', _id);        // השתמש כאן ב-_id
                console.log("Saved token and userId to localStorage:", accessToken, _id);
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
            const response = await axios.post('http://localhost:3001/auth/login', { email, password });
    
            if (response.status === 200) {
                const { accessToken, user } = response.data;
    
                localStorage.setItem('authToken', accessToken);
                localStorage.setItem('userId', user._id); // כאן השינוי הקריטי
    
                console.log("Saved token and userId to localStorage:", accessToken, user._id);
                navigate('/home');
            } else {
                setError('Invalid email or password');
            }
        } catch (err) {
            console.error("Login error:", err);
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
             place where your hobbies come to life, and your passion connects with other people. 
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
            <button className={styles.signupButton}>
    <Link to="/signup" style={{ color: 'white', textDecoration: 'none' }}>Sign Up</Link>
</button>
        </div>
    );
};

export default Login;