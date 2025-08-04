import React, { useState } from 'react';

const CreateUser: React.FC = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ username, password }),
            });

            if (response.status === 201) {
                setMessage('User created successfully.');
                setUsername('');
                setPassword('');
            } else {
                const errorText = await response.text();
                setMessage(`Error: ${errorText}`);
            }
        } catch (error) {
            setMessage('An unexpected error occurred. Please try again.');
            console.error('User creation error:', error);
        }
    };

    return (
        <div>
            <h4>Create New Admin User</h4>
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
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <button type="submit">Create User</button>
            </form>
            {message && <p>{message}</p>}
        </div>
    );
};

export default CreateUser;
