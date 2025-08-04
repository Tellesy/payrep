import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

interface User {
    id: number;
    username: string;
    email: string;
    // Add other user properties as needed
}

const UserList: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [error, setError] = useState<string | null>(null);
    const { token } = useAuth();

    useEffect(() => {
        const fetchUsers = async () => {
            if (!token) {
                setError('Authentication token not found.');
                return;
            }

            try {
                const response = await fetch('/api/users', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!response.ok) {
                    throw new Error(`Error: ${response.status} ${response.statusText}`);
                }

                const data: User[] = await response.json();
                setUsers(data);
            } catch (err: any) {
                setError(err.message);
            }
        };

        fetchUsers();
    }, [token]);

    const handleDelete = async (username: string) => {
        if (!window.confirm(`Are you sure you want to delete user ${username}?`)) {
            return;
        }

        try {
            const response = await fetch(`/api/users/${username}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                method: 'DELETE',
            });

            if (response.ok) {
                alert('User deleted successfully');
                const fetchUsers = async () => {
                    try {
                        const response = await fetch('/api/users', {
                            headers: {
                                'Authorization': `Bearer ${token}`
                            }
                        });

                        if (!response.ok) {
                            throw new Error(`Error: ${response.status} ${response.statusText}`);
                        }

                        const data: User[] = await response.json();
                        setUsers(data);
                    } catch (err: any) {
                        setError(err.message);
                    }
                };
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
            <h2>User List</h2>
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Username</th>
                        <th>Email</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map(user => (
                        <tr key={user.id}>
                            <td>{user.id}</td>
                            <td>{user.username}</td>
                            <td>{user.email}</td>
                            <td>
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
