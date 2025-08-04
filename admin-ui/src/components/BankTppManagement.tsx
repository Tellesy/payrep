import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
    Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, 
    Table, TableBody, TableCell, TableHead, TableRow, Paper, IconButton,
    Select, MenuItem, FormControl, InputLabel
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

// Define the types for our data
interface BankOrTpp {
    id: number;
    code: string;
    name: string;
    type: 'BANK' | 'TPP';
}

const BankTppManagement: React.FC = () => {
    const [items, setItems] = useState<BankOrTpp[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentItem, setCurrentItem] = useState<Partial<BankOrTpp> | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<number | null>(null);
    const { token } = useAuth();

    const apiEndpoint = '/api/admin/banks';

    const fetchItems = async () => {
        if (!token) {
            setError('Authentication token not found.');
            setIsLoading(false);
            return;
        }
        setIsLoading(true);
        try {
            const response = await fetch(apiEndpoint, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error(`Error: ${response.status} ${response.statusText}`);
            const data: BankOrTpp[] = await response.json();
            setItems(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchItems();
    }, [token]);

    const handleOpenModal = (item: Partial<BankOrTpp> | null = null) => {
        setCurrentItem(item ? { ...item } : { code: '', name: '', type: 'BANK' });
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setCurrentItem(null);
    };

    const handleSave = async () => {
        if (!currentItem) return;

        const isNew = !currentItem.id;
        const method = isNew ? 'POST' : 'PUT';
        const url = isNew ? apiEndpoint : `${apiEndpoint}/${currentItem.id}`;

        try {
            const response = await fetch(url, {
                method,
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ code: currentItem.code, name: currentItem.name, type: currentItem.type })
            });

            if (!response.ok) {
                const errorData = await response.text();
                throw new Error(`Failed to save: ${errorData}`);
            }
            handleCloseModal();
            fetchItems(); // Refresh list
        } catch (err: any) {
            setError(err.message);
        }
    };

    const handleOpenDeleteDialog = (id: number) => {
        setItemToDelete(id);
        setDeleteDialogOpen(true);
    };

    const handleCloseDeleteDialog = () => {
        setDeleteDialogOpen(false);
        setItemToDelete(null);
    };

    const handleDelete = async () => {
        if (itemToDelete === null) return;
        
        try {
            const response = await fetch(`${apiEndpoint}/${itemToDelete}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Failed to delete');
            fetchItems(); // Refresh list
            handleCloseDeleteDialog();
        } catch (err: any) {
            setError(err.message);
            handleCloseDeleteDialog();
        }
    };

    if (isLoading) return <div>Loading...</div>;
    if (error) return <div>Error: {error} <Button onClick={fetchItems}>Retry</Button></div>;

    return (
        <Paper>
            <h2>Manage Banks and TPPs</h2>
            <Button variant="contained" color="primary" onClick={() => handleOpenModal()}>
                Add New
            </Button>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Code</TableCell>
                        <TableCell>Name</TableCell>
                        <TableCell>Type</TableCell>
                        <TableCell>Actions</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {items.map(item => (
                        <TableRow key={item.id}>
                            <TableCell>{item.code}</TableCell>
                            <TableCell>{item.name}</TableCell>
                            <TableCell>{item.type}</TableCell>
                            <TableCell>
                                <IconButton onClick={() => handleOpenModal(item)}><EditIcon /></IconButton>
                                <IconButton onClick={() => handleOpenDeleteDialog(item.id)}><DeleteIcon /></IconButton>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            <Dialog open={isModalOpen} onClose={handleCloseModal}>
                <DialogTitle>{currentItem?.id ? 'Edit Item' : 'Add New Item'}</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Code"
                        fullWidth
                        value={currentItem?.code || ''}
                        onChange={(e) => setCurrentItem({ ...currentItem, code: e.target.value })}
                    />
                    <TextField
                        margin="dense"
                        label="Name"
                        fullWidth
                        value={currentItem?.name || ''}
                        onChange={(e) => setCurrentItem({ ...currentItem, name: e.target.value })}
                    />
                    <FormControl fullWidth margin="dense">
                        <InputLabel>Type</InputLabel>
                        <Select
                            value={currentItem?.type || 'BANK'}
                            onChange={(e) => setCurrentItem({ ...currentItem, type: e.target.value as 'BANK' | 'TPP' })}
                        >
                            <MenuItem value="BANK">Bank</MenuItem>
                            <MenuItem value="TPP">TPP</MenuItem>
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseModal}>Cancel</Button>
                    <Button onClick={handleSave}>Save</Button>
                </DialogActions>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog
                open={deleteDialogOpen}
                onClose={handleCloseDeleteDialog}
                aria-labelledby="delete-dialog-title"
            >
                <DialogTitle id="delete-dialog-title">Confirm Deletion</DialogTitle>
                <DialogContent>
                    Are you sure you want to delete this item? This action cannot be undone.
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDeleteDialog}>Cancel</Button>
                    <Button onClick={handleDelete} color="error" autoFocus>
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </Paper>
    );
};

export default BankTppManagement;
