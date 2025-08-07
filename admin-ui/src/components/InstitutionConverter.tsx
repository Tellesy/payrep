import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Paper,
  IconButton,
  Alert,
  Chip
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

interface InstitutionConverter {
  id?: number;
  sourceInstitutionId: string;
  targetBankOrTppCode: string;
  processorCode: string;
  description?: string;
}

interface BankOrTPP {
  code: string;
  name: string;
  type: string;
  useConverter: boolean;
}

const InstitutionConverter: React.FC = () => {
  const { t } = useTranslation();
  const [converters, setConverters] = useState<InstitutionConverter[]>([]);
  const [banksAndTPPs, setBanksAndTPPs] = useState<BankOrTPP[]>([]);
  const [filteredConverters, setFilteredConverters] = useState<InstitutionConverter[]>([]);
  const [selectedProcessor, setSelectedProcessor] = useState<string>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingConverter, setEditingConverter] = useState<InstitutionConverter | null>(null);
  const [formData, setFormData] = useState<InstitutionConverter>({
    sourceInstitutionId: '',
    targetBankOrTppCode: '',
    processorCode: '',
    description: ''
  });
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [converterSettings, setConverterSettings] = useState<{[key: string]: boolean}>({});

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchConverters();
    fetchBanksAndTPPs();
  }, []);

  const fetchConverters = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/institution-converter', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setConverters(data);
      } else {
        setError('Failed to fetch converters');
      }
    } catch (err) {
      setError('Error fetching converters');
    } finally {
      setLoading(false);
    }
  };

  const fetchBanksAndTPPs = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/institution-converter/banks-and-tpps', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setBanksAndTPPs(data);
        // Initialize converter settings state
        const settings: {[key: string]: boolean} = {};
        data.forEach((item: BankOrTPP) => {
          settings[item.code] = item.useConverter;
        });
        setConverterSettings(settings);
      }
    } catch (err) {
      console.error('Error fetching banks and TPPs:', err);
    }
  };

  const updateConverterSetting = async (code: string, useConverter: boolean) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/institution-converter/converter-setting/${code}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ useConverter })
      });
      
      if (response.ok) {
        setConverterSettings(prev => ({ ...prev, [code]: useConverter }));
        setAlert({ type: 'success', message: `Converter setting updated for ${code}` });
        setTimeout(() => setAlert(null), 3000);
      } else {
        setAlert({ type: 'error', message: 'Failed to update converter setting' });
        setTimeout(() => setAlert(null), 3000);
      }
    } catch (err) {
      setAlert({ type: 'error', message: 'Error updating converter setting' });
      setTimeout(() => setAlert(null), 3000);
    }
  };

  const handleOpenDialog = (converter?: InstitutionConverter) => {
    if (converter) {
      setEditingConverter(converter);
      setFormData(converter);
    } else {
      setEditingConverter(null);
      setFormData({
        sourceInstitutionId: '',
        targetBankOrTppCode: '',
        processorCode: '',
        description: ''
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingConverter(null);
    setError(null);
    setSuccess(null);
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('token');
      const url = editingConverter 
        ? `/api/admin/institution-converter/${editingConverter.id}`
        : '/api/admin/institution-converter';
      
      const method = editingConverter ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setSuccess(editingConverter ? 'Converter updated successfully' : 'Converter created successfully');
        fetchConverters();
        handleCloseDialog();
      } else {
        setError('Failed to save converter');
      }
    } catch (err) {
      setError('Error saving converter');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this converter?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/institution-converter/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setSuccess('Converter deleted successfully');
        fetchConverters();
      } else {
        setError('Failed to delete converter');
      }
    } catch (err) {
      setError('Error deleting converter');
    }
  };

  // Filter converters based on selected processor
  useEffect(() => {
    if (selectedProcessor === 'all') {
      setFilteredConverters(converters);
    } else {
      setFilteredConverters(converters.filter(c => c.processorCode === selectedProcessor));
    }
  }, [converters, selectedProcessor]);

  const processors = Array.from(new Set(converters.map(c => c.processorCode)));

  const getBankOrTPPName = (code: string) => {
    const entity = banksAndTPPs.find(b => b.code === code);
    return entity ? `${entity.name} (${entity.code})` : code;
  };

  const getBankOrTPPType = (code: string) => {
    const entity = banksAndTPPs.find(b => b.code === code);
    return entity?.type || 'Unknown';
  };

  if (loading) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <SettingsIcon />
          Institution ID Converter Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add Converter
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
      {alert && <Alert severity={alert.type} sx={{ mb: 2 }}>{alert.message}</Alert>}

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>
            About Institution ID Converter
          </Typography>
          <Alert severity="info" sx={{ mb: 3 }}>
            <Typography variant="body2">
              <strong>Purpose:</strong> This converter maps external institution IDs (as they appear in TPP/Bank files) to our internal bank/TPP codes.
              <br />
              <strong>Example:</strong> TPP 901 might refer to bank "002" as "7" in their files. Create a mapping: Source ID "7" → Target Code "002" for Processor "901".
              <br />
              <strong>Note:</strong> Only TPPs/Banks with "Use Converter" enabled will use these mappings. Others will use institution IDs as-is.
            </Typography>
          </Alert>
          <Typography variant="body2" color="text.secondary">
            The Institution ID Converter maps external institution IDs from TPP/Bank files to internal BankOrTPP codes. 
            This allows different institutions to use their own ID formats while maintaining consistency in the system.
          </Typography>
        </CardContent>
      </Card>

      {/* Converter Settings Section */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Converter Settings per TPP/Bank
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Enable or disable the Institution ID Converter for each TPP/Bank. When disabled, institution IDs in files will be used as-is.
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 2 }}>
            {banksAndTPPs.map((item) => (
              <Card key={item.code} variant="outlined" sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="subtitle1" fontWeight="bold">
                      {item.code} - {item.name}
                    </Typography>
                    <Chip 
                      label={item.type} 
                      size="small" 
                      color={item.type === 'BANK' ? 'primary' : 'secondary'}
                      sx={{ mt: 0.5 }}
                    />
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Converter:
                    </Typography>
                    <Chip 
                      label={converterSettings[item.code] ? 'Enabled' : 'Disabled'}
                      size="small"
                      color={converterSettings[item.code] ? 'success' : 'default'}
                      onClick={() => updateConverterSetting(item.code, !converterSettings[item.code])}
                      sx={{ cursor: 'pointer' }}
                    />
                  </Box>
                </Box>
              </Card>
            ))}
          </Box>
        </CardContent>
      </Card>

      {/* Filter Controls */}
      <Box sx={{ mb: 3 }}>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Filter by Processor</InputLabel>
          <Select
            value={selectedProcessor}
            label="Filter by Processor"
            onChange={(e) => setSelectedProcessor(e.target.value)}
          >
            <MenuItem value="all">All Processors</MenuItem>
            {processors.map(processor => (
              <MenuItem key={processor} value={processor}>
                {getBankOrTPPName(processor)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Converters Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Source Institution ID</TableCell>
              <TableCell>Target Bank/TPP</TableCell>
              <TableCell>Processor</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredConverters.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  <Typography color="text.secondary">
                    No converters found. Add a converter to get started.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredConverters.map((converter) => (
                <TableRow key={converter.id}>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                      {converter.sourceInstitutionId}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2">
                        {getBankOrTPPName(converter.targetBankOrTppCode)}
                      </Typography>
                      <Chip 
                        label={getBankOrTPPType(converter.targetBankOrTppCode)} 
                        size="small" 
                        color={getBankOrTPPType(converter.targetBankOrTppCode) === 'BANK' ? 'primary' : 'secondary'}
                      />
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {getBankOrTPPName(converter.processorCode)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {converter.description || '-'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={() => handleOpenDialog(converter)}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => converter.id && handleDelete(converter.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingConverter ? 'Edit Converter' : 'Add New Converter'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Source Institution ID"
              value={formData.sourceInstitutionId}
              onChange={(e) => setFormData({ ...formData, sourceInstitutionId: e.target.value })}
              fullWidth
              helperText="The external institution ID from the TPP/Bank file"
            />
            
            <FormControl fullWidth>
              <InputLabel>Target Bank/TPP Code</InputLabel>
              <Select
                value={formData.targetBankOrTppCode}
                label="Target Bank/TPP Code"
                onChange={(e) => setFormData({ ...formData, targetBankOrTppCode: e.target.value })}
              >
                {banksAndTPPs.map(entity => (
                  <MenuItem key={entity.code} value={entity.code}>
                    {entity.name} ({entity.code}) - {entity.type}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Processor Code</InputLabel>
              <Select
                value={formData.processorCode}
                label="Processor Code"
                onChange={(e) => setFormData({ ...formData, processorCode: e.target.value })}
              >
                {banksAndTPPs.filter(entity => entity.type === 'TPP').map(entity => (
                  <MenuItem key={entity.code} value={entity.code}>
                    {entity.name} ({entity.code})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Description (Optional)"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              fullWidth
              multiline
              rows={2}
              helperText="Optional description for this mapping"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button 
            onClick={handleSave} 
            variant="contained"
            disabled={!formData.sourceInstitutionId || !formData.targetBankOrTppCode || !formData.processorCode}
          >
            {editingConverter ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default InstitutionConverter;
