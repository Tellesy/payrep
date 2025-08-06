import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useTranslation } from 'react-i18next';
import { Button, IconButton, Box, Typography } from '@mui/material';
import LanguageIcon from '@mui/icons-material/Language';
import { ReactComponent as Logo } from '../assets/logo.svg';
import './Login.css';

const Login: React.FC = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { login } = useAuth();
    const { language, isRTL, toggleLanguage } = useLanguage();
    const { t } = useTranslation();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            if (response.ok) {
                const data = await response.json();
                login(data.token);
                navigate('/dashboard');
            } else {
                const data = await response.json();
                setError(data.message || 'Invalid username or password');
            }
        } catch (err) {
            setError('Login failed. Please try again later.');
        }
    };

    return (
        <div className={`login-container ${isRTL ? 'rtl' : ''}`}>
            {/* Language Toggle */}
            <Box className="language-toggle-top">
                <IconButton onClick={toggleLanguage} sx={{ color: '#2c3e50' }}>
                    <LanguageIcon />
                    <Typography variant="caption" sx={{ ml: 0.5, color: '#2c3e50' }}>
                        {language === 'en' ? 'العربية' : 'English'}
                    </Typography>
                </IconButton>
            </Box>

            <div className="login-card">
                {/* Logo */}
                <Box className="login-logo">
                    <Logo style={{ height: '60px', width: 'auto' }} />
                </Box>
                
                <Typography variant="h4" className="login-title">
                    {t('login')}
                </Typography>
                
                <form onSubmit={handleLogin} className="login-form">
                    <div className="form-group">
                        <label>{t('username')}:</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            className="form-input"
                        />
                    </div>
                    <div className="form-group">
                        <label>{t('password')}:</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="form-input"
                        />
                    </div>
                    <button type="submit" className="login-button">
                        {t('login')}
                    </button>
                </form>
                {error && <p className="error-message">{error}</p>}
            </div>
        </div>
    );
};

export default Login;
