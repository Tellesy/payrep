import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
    Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField,
    Table, TableBody, TableCell, TableHead, TableRow, Paper, IconButton,
    Select, MenuItem, FormControl, InputLabel, Typography, Box, Grid
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

// Define types
interface ColumnMapping {
    id: number;
    fileProcessingConfigId: number;
    columnName: string;
    entityType: string;
    fieldName: string;
    transformation: string | null;
}

interface FileProcessingConfig {
    id: number;
    bankOrTPPId: number;
    bankOrTPPName?: string;
    directoryPath: string;
    fileNamePattern: string;
    scheduleTime: string;
    fileType: string;
}

// Define available entity types for mapping
const ENTITY_TYPES = ['Payment', 'Transaction', 'Account', 'Customer'];

const ColumnMappingManagement: React.FC<{ configId?: number }> = ({ configId }) => {
    const [mappings, setMappings] = useState<ColumnMapping[]>([]);
    const [configs, setConfigs] = useState<FileProcessingConfig[]>([]);
    const [selectedConfigId, setSelectedConfigId] = useState<number | null>(configId || null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentMapping, setCurrentMapping] = useState<Partial<ColumnMapping> | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [mappingToDelete, setMappingToDelete] = useState<number | null>(null);
    const { token } = useAuth();

    // API endpoints
    const configsEndpoint = '/api/admin/file-configs';
    const getMappingsEndpoint = (cId: number) => `/api/admin/file-configs/${cId}/column-mappings`;

    // Fetch all file configs for dropdown selector
    const fetchConfigs = async () => {
        if (!token) {
            setError('Authentication token not found.');
            return;
        }
        
        try {
            const response = await fetch(configsEndpoint, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error(`Error: ${response.status}`);
            const data = await response.json();
            setConfigs(data);
            
            // If configId prop was not provided but we have configs, select the first one
            if (!selectedConfigId && data.length > 0) {
                setSelectedConfigId(data[0].id);
            }
        } catch (err: any) {
            console.error("Failed to fetch configs:", err);
            setError(err.message);
        }
    };

    // Fetch column mappings for the selected config
    const fetchMappings = async () => {
        if (!token || !selectedConfigId) {
            setMappings([]);
            setIsLoading(false);
            return;
        }
        
        setIsLoading(true);
        try {
            const response = await fetch(getMappingsEndpoint(selectedConfigId), {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error(`Error: ${response.status}`);
            const data = await response.json();
            setMappings(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    // Initial data loading
    useEffect(() => {
        if (token) {
            fetchConfigs();
        }
    }, [token]);

    // Fetch mappings when selected config changes
    useEffect(() => {
        if (selectedConfigId) {
            fetchMappings();
        }
    }, [selectedConfigId, token]);

    // Handle config selection change
    const handleConfigChange = (configId: number) => {
        setSelectedConfigId(configId);
    };

    // Open add/edit modal
    const handleOpenModal = (mapping: Partial<ColumnMapping> | null = null) => {
        if (!selectedConfigId) {
            setError('Please select a file configuration first.');
            return;
        }

        setCurrentMapping(mapping ? { ...mapping } : {
            fileProcessingConfigId: selectedConfigId,
            columnName: '',
            entityType: ENTITY_TYPES[0],
            fieldName: '',
            transformation: null
        });
        setIsModalOpen(true);
    };

    // Close modal
    const handleCloseModal = () => {
        setIsModalOpen(false);
        setCurrentMapping(null);
    };

    // Save column mapping
    const handleSave = async () => {
        if (!currentMapping || !selectedConfigId || !token) return;

        const isNew = !currentMapping.id;
        const method = isNew ? 'POST' : 'PUT';
        const endpoint = isNew 
            ? getMappingsEndpoint(selectedConfigId)
            : `${getMappingsEndpoint(selectedConfigId)}/${currentMapping.id}`;

        try {
            const response = await fetch(endpoint, {
                method,
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(currentMapping)
            });

            if (!response.ok) {
                const errorData = await response.text();
                throw new Error(`Failed to save: ${errorData}`);
            }
            handleCloseModal();
            fetchMappings(); // Refresh list
        } catch (err: any) {
            setError(err.message);
        }
    };

    // Open delete confirmation dialog
    const handleOpenDeleteDialog = (id: number) => {
        setMappingToDelete(id);
        setDeleteDialogOpen(true);
    };

    // Close delete confirmation dialog
    const handleCloseDeleteDialog = () => {
        setDeleteDialogOpen(false);
        setMappingToDelete(null);
    };

    // Delete mapping
    const handleDelete = async () => {
        if (mappingToDelete === null || !selectedConfigId || !token) return;
        
        try {
            const response = await fetch(`${getMappingsEndpoint(selectedConfigId)}/${mappingToDelete}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Failed to delete');
            fetchMappings(); // Refresh list
            handleCloseDeleteDialog();
        } catch (err: any) {
            setError(err.message);
            handleCloseDeleteDialog();
        }
    };

    // Render loading state
    if (isLoading && !mappings.length) return <div>Loading...</div>;

    return (
        <Paper sx={{ p: 2 }}>
            <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                    Column Mappings
                </Typography>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                    Configure how columns from import files map to database fields
                </Typography>
                
                <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel>Select File Configuration</InputLabel>
                    <Select
                        value={selectedConfigId || ''}
                        onChange={(e) => handleConfigChange(e.target.value as number)}
                        disabled={configs.length === 0}
                    >
                        {configs.map(config => (
                            <MenuItem key={config.id} value={config.id}>
                                {config.fileNamePattern} - {config.directoryPath}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Box>

            {error && (
                <Box sx={{ mb: 2, p: 1, bgcolor: '#fff3f3', color: '#d32f2f', borderRadius: 1 }}>
                    Error: {error}
                    <Button size="small" onClick={fetchMappings} sx={{ ml: 1 }}>
                        Retry
                    </Button>
                </Box>
            )}

            {selectedConfigId && (
                <Box sx={{ mb: 2 }}>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={() => handleOpenModal()}
                        disabled={!selectedConfigId}
                    >
                        Add New Column Mapping
                    </Button>
                </Box>
            )}

            {mappings.length > 0 ? (
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Column Name</TableCell>
                            <TableCell>Entity Type</TableCell>
                            <TableCell>Field Name</TableCell>
                            <TableCell>Transformation</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {mappings.map((mapping) => (
                            <TableRow key={mapping.id}>
                                <TableCell>{mapping.columnName}</TableCell>
                                <TableCell>{mapping.entityType}</TableCell>
                                <TableCell>{mapping.fieldName}</TableCell>
                                <TableCell>{mapping.transformation || '-'}</TableCell>
                                <TableCell>
                                    <IconButton onClick={() => handleOpenModal(mapping)}>
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton onClick={() => handleOpenDeleteDialog(mapping.id)}>
                                        <DeleteIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            ) : (
                selectedConfigId && (
                    <Typography variant="body1" sx={{ textAlign: 'center', py: 3 }}>
                        No column mappings defined for this configuration. 
                        Click "Add New Column Mapping" to create one.
                    </Typography>
                )
            )}

            {/* Add/Edit Column Mapping Dialog */}
            <Dialog open={isModalOpen} onClose={handleCloseModal}>
                <DialogTitle>
                    {currentMapping?.id ? 'Edit Column Mapping' : 'Add New Column Mapping'}
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                        <Box>
                            <TextField
                                fullWidth
                                label="Column Name"
                                value={currentMapping?.columnName || ''}
                                onChange={(e) => setCurrentMapping({
                                    ...currentMapping,
                                    columnName: e.target.value
                                })}
                                placeholder="e.g., amount, customerName"
                                helperText="The exact column name in the import file"
                            />
                        </Box>
                        <Box>
                            <FormControl fullWidth>
                                <InputLabel>Entity Type</InputLabel>
                                <Select
                                    value={currentMapping?.entityType || ENTITY_TYPES[0]}
                                    onChange={(e) => setCurrentMapping({
                                        ...currentMapping,
                                        entityType: e.target.value as string
                                    })}
                                >
                                    {ENTITY_TYPES.map(type => (
                                        <MenuItem key={type} value={type}>
                                            {type}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Box>
                        <Box>
                            <TextField
                                fullWidth
                                label="Field Name"
                                value={currentMapping?.fieldName || ''}
                                onChange={(e) => setCurrentMapping({
                                    ...currentMapping,
                                    fieldName: e.target.value
                                })}
                                placeholder="e.g., amount, firstName"
                                helperText="The entity field name in the database"
                            />
                        </Box>
                        <Box>
                            <TextField
                                fullWidth
                                label="Transformation (Optional)"
                                value={currentMapping?.transformation || ''}
                                onChange={(e) => setCurrentMapping({
                                    ...currentMapping,
                                    transformation: e.target.value || null
                                })}
                                placeholder="e.g., UPPERCASE, TO_DATE"
                                helperText="Optional transformation to apply to the data"
                            />
                        </Box>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseModal}>Cancel</Button>
                    <Button onClick={handleSave} color="primary">
                        Save
                    </Button>
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
                    Are you sure you want to delete this column mapping? This action cannot be undone.
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

export default ColumnMappingManagement;
