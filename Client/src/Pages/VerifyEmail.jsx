import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../config';
import '../Stylesheets/Register.css'; // Reusing register styles for consistency

const VerifyEmail = () => {
    const [searchParams] = useSearchParams();
    const [status, setStatus] = useState('verifying'); // verifying, success, error
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const verify = async () => {
            const token = searchParams.get('token');
            if (!token) {
                setStatus('error');
                setMessage('Invalid verification link.');
                return;
            }

            try {
                const response = await axios.post(`${API_URL}/auth/verify-email`, { token });
                setStatus('success');
                setMessage(response.data.message);
                setTimeout(() => {
                    navigate('/login');
                }, 3000);
            } catch (err) {
                setStatus('error');
                setMessage(err.response?.data?.message || 'Verification failed.');
            }
        };

        verify();
    }, [searchParams, navigate]);

    return (
        <div className="register-container">
            <div className="register-box">
                <h2>Email Verification</h2>
                {status === 'verifying' && <p>Verifying your email...</p>}
                {status === 'success' && (
                    <div style={{ textAlign: 'center' }}>
                        <p className="success-message" style={{ color: 'green' }}>{message}</p>
                        <p>Redirecting to login...</p>
                    </div>
                )}
                {status === 'error' && (
                    <div style={{ textAlign: 'center' }}>
                        <p className="error-message">{message}</p>
                        <button onClick={() => navigate('/login')} className="register-btn">Go to Login</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VerifyEmail;
