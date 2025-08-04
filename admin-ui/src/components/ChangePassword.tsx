import React, { useState } from 'react';

const ChangePassword: React.FC = () => {
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            setMessage('New passwords do not match.');
            return;
        }
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/users/change-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ oldPassword, newPassword }),
            });

            if (response.ok) {
                setMessage('Password changed successfully.');
                setOldPassword('');
                setNewPassword('');
                setConfirmPassword('');
            } else {
                const errorText = await response.text();
                setMessage(`Error: ${errorText}`);
            }
        } catch (error) {
            setMessage('An unexpected error occurred. Please try again.');
            console.error('Password change error:', error);
        }
    };

    return (
        <div>
            <h4>Change Your Password</h4>
            <form onSubmit={handleSubmit}>
                <div>
                    <input
                        type="password"
                        placeholder="Old Password"
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
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
                <div>
                    <input
                        type="password"
                        placeholder="Confirm New Password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                    />
                </div>
                <button type="submit">Change Password</button>
            </form>
            {message && <p>{message}</p>}
        </div>
    );
};

export default ChangePassword;
