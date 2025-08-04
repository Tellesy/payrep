import React, { useState } from 'react';

const ResetPassword: React.FC = () => {
    const [username, setUsername] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage('');
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/users/reset-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ username, newPassword }),
            });

            if (response.ok) {
                setMessage('Password reset successfully.');
                setUsername('');
                setNewPassword('');
            } else if (response.status === 404) {
                setMessage('User not found.');
            } else {
                setMessage('An error occurred while resetting the password.');
            }
        } catch (error) {
            setMessage('An error occurred while resetting the password.');
        }
    };

    return (
        <div>
            <h4>Reset User Password</h4>
            <form onSubmit={handleSubmit}>
                <div>
                    <input
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <input
                        type="password"
                        placeholder="New Password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                    />
                </div>
                <button type="submit">Reset Password</button>
            </form>
            {message && <p>{message}</p>}
        </div>
    );
};

export default ResetPassword;
