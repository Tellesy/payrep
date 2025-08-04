import React, { useState, useEffect } from 'react';

interface User {
    id: number;
    username: string;
}

const UserList: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [error, setError] = useState<string | null>(null);

    const fetchUsers = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/users', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!response.ok) {
                throw new Error('Failed to fetch users');
            }
            const data = await response.json();
            setUsers(data);
        } catch (err) {
            setError((err as Error).message);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleDelete = async (username: string) => {
        if (!window.confirm(`Are you sure you want to delete user ${username}?`)) {
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/users/${username}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                method: 'DELETE',
            });

            if (response.ok) {
                alert('User deleted successfully');
                fetchUsers(); // Refresh the list
            } else {
                const data = await response.json();
                alert(`Failed to delete user: ${data.message || 'Server error'}`);
            }
        } catch (err) {
            alert(`An error occurred: ${(err as Error).message}`);
        }
    };

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div>
            <h4>All Users</h4>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr>
                        <th style={{ border: '1px solid #ddd', padding: '8px' }}>Username</th>
                        <th style={{ border: '1px solid #ddd', padding: '8px' }}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map((user) => (
                        <tr key={user.id}>
                            <td style={{ border: '1px solid #ddd', padding: '8px' }}>{user.username}</td>
                            <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                                <button onClick={() => handleDelete(user.username)}>Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default UserList;
