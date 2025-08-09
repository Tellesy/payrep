import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Button,
  Stepper,
  Step,
  StepLabel,
  Typography,
  Paper,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Alert
} from '@mui/material';

interface DetectedColumn {
  name: string;
  index: number;
  sampleValues: string[];
}

interface DetectionResult {
  fileName: string;
  delimiter: string;
  columnCount: number;
  columns: DetectedColumn[];
  rowCountPreviewed: number;
}

interface MappingEntry {
  columnIndex: number;
  columnName: string;
  targetField: string; // simple text for now; future: dropdown of domain fields
}

interface FieldDescriptor {
  name: string;
  type: string;
  required: boolean;
}

interface EntityDescriptor {
  name: string;
  fields: FieldDescriptor[];
}

interface BankOrTpp {
  id: number;
  code: string;
  name: string;
  type: 'BANK' | 'TPP';
}

const steps = ['Upload & Detect', 'Assign to Source', 'Map Columns', 'Configure File', 'Set Schedule', 'Confirm'];

const NewFileWizard: React.FC = () => {
  const { t } = useTranslation();
  const { token } = useAuth();

  const [activeStep, setActiveStep] = useState<number>(0);
  const [file, setFile] = useState<File | null>(null);
  const [detectResult, setDetectResult] = useState<DetectionResult | null>(null);
  const [banks, setBanks] = useState<BankOrTpp[]>([]);
  const [selectedSourceId, setSelectedSourceId] = useState<number | ''>('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [mappings, setMappings] = useState<MappingEntry[]>([]);
  const [entities, setEntities] = useState<EntityDescriptor[]>([]);
  const [selectedEntity, setSelectedEntity] = useState<string>('');

  // Small helper to format Authorization header robustly
  const getAuthHeader = (tok?: string | null) => {
    if (!tok) return undefined;
    return tok.startsWith('Bearer ') ? tok : `Bearer ${tok}`;
  };

  // Fetch banks/TPPs for Step 2
  useEffect(() => {
    const fetchBanks = async () => {
      if (!token) return;
      try {
        const res = await fetch('/api/admin/banks', {
          headers: { Authorization: getAuthHeader(token)! }
        });
        if (!res.ok) {
          if (res.status === 401) {
            setError(t('unauthorized'));
            return;
          }
          if (res.status === 403) {
            setError(t('forbidden'));
            return;
          }
          throw new Error(`Failed to load sources: ${res.status}`);
        }
        const data = await res.json();
        setBanks(data);
      } catch (e: any) {
        console.error(e);
        setError(t('networkError'));
      }
    };
    fetchBanks();
  }, [token]);

  const onUpload = async () => {
    if (!token) {
      setError(t('pleaseLoginAgain') || 'Please login again');
      return;
    }
    if (!file) {
      setError(t('pleaseSelectAFile'));
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const form = new FormData();
      form.append('file', file);
      const res = await fetch('/api/admin/wizard/detect?maxRows=20', {
        method: 'POST',
        headers: { Authorization: getAuthHeader(token)! },
        body: form
      });
      if (!res.ok) {
        if (res.status === 401) {
          setError(t('pleaseLoginAgain'));
          return;
        }
        if (res.status === 403) {
          setError(t('forbidden'));
          return;
        }
        const text = await res.text();
        setError(text || t('uploadFailed'));
        return;
      }
      const data: DetectionResult = await res.json();
      setDetectResult(data);
      setError(null);
      setActiveStep(1); // proceed to Assign step
    } catch (e: any) {
      console.error(e);
      setError(t('uploadFailed'));
    } finally {
      setLoading(false);
    }
  };

  const canNextFromStep2 = selectedSourceId !== '';

  const initMappingsFromDetection = (det: DetectionResult) => {
    const initial: MappingEntry[] = det.columns.map((c) => ({
      columnIndex: c.index,
      columnName: c.name,
      targetField: ''
    }));
    setMappings(initial);
  };

  // Load entities for Step 3
  useEffect(() => {
    const fetchEntities = async () => {
      if (!token) return;
      try {
        const res = await fetch('/api/admin/wizard/entities', {
          headers: { Authorization: getAuthHeader(token)! }
        });
        if (!res.ok) {
          if (res.status === 401) { setError(t('pleaseLoginAgain')); return; }
          if (res.status === 403) { setError(t('forbidden')); return; }
          throw new Error('Failed to load entities');
        }
        const data = await res.json();
        setEntities(data);
      } catch (e) {
        console.error(e);
        setError(t('networkError'));
      }
    };
    if (activeStep === 2) {
      fetchEntities();
    }
  }, [activeStep, token]);

  const handleNext = async () => {
    if (activeStep === 0) return; // use onUpload instead
    if (activeStep === 1) {
      // Proceed to Step 3 (Map Columns) now that user selected source
      if (!canNextFromStep2) return;
      if (detectResult) {
        initMappingsFromDetection(detectResult);
      }
      setActiveStep(2);
      return;
    }
    if (activeStep === 2) {
      // Save mappings (temporary backend stub) then proceed to Step 4
      try {
        setLoading(true);
        setError(null);
        if (!token) {
          setError(t('pleaseLoginAgain'));
          return;
        }
        if (!selectedEntity) {
          setError('Please select an entity to map to');
          return;
        }
        const filtered = mappings.filter((m) => m.targetField && m.targetField.trim() !== '');
        const res = await fetch('/api/admin/wizard/mappings', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: getAuthHeader(token)!
          },
          body: JSON.stringify({
            sourceId: selectedSourceId,
            fileName: detectResult?.fileName || '',
            delimiter: detectResult?.delimiter || ',',
            entityName: selectedEntity,
            mappings: filtered
          })
        });
        if (!res.ok) {
          if (res.status === 401) {
            setError(t('pleaseLoginAgain'));
            return;
          }
          if (res.status === 403) {
            setError(t('forbidden'));
            return;
          }
          const text = await res.text();
          setError(text || t('networkError'));
          return;
        }
        setActiveStep(3);
      } catch (e: any) {
        console.error(e);
        setError(t('networkError'));
      } finally {
        setLoading(false);
      }
      return;
    }
    setActiveStep((s) => Math.min(s + 1, steps.length - 1));
  };

  const handleBack = () => setActiveStep((s) => Math.max(s - 1, 0));

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        {t('newFileWizard')}
      </Typography>

      <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 3 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {activeStep === 0 && (
        <Box>
          <Typography variant="h6" gutterBottom>
            {t('uploadAndDetect')}
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, alignItems: 'center' }}>
            <Box sx={{ flex: 1 }}>
              <TextField
                type="file"
                inputProps={{ accept: '.csv' }}
                fullWidth
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const f = e.target.files?.[0] || null;
                  setFile(f);
                  setDetectResult(null);
                }}
              />
            </Box>
            <Box>
              <Button variant="contained" onClick={onUpload} disabled={loading || !file}>
                {t('upload')}
              </Button>
            </Box>
          </Box>

          {detectResult && (
            <Box mt={3}>
              <Typography variant="subtitle1">
                {t('detectedHeaders')} ({detectResult.columnCount}) — {t('previewRows')}: {detectResult.rowCountPreviewed}
              </Typography>
              <Table size="small" sx={{ mt: 1 }}>
                <TableHead>
                  <TableRow>
                    <TableCell>#</TableCell>
                    <TableCell>{t('column')}</TableCell>
                    <TableCell>{t('samples')}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {detectResult.columns.map((c) => (
                    <TableRow key={c.index}>
                      <TableCell>{c.index}</TableCell>
                      <TableCell>{c.name}</TableCell>
                      <TableCell>{c.sampleValues.join(', ')}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          )}
        </Box>
      )}

      {activeStep === 1 && (
        <Box>
          <Typography variant="h6" gutterBottom>
            {t('assignToSource')}
          </Typography>
          <Box sx={{ maxWidth: 600 }}>
            <FormControl fullWidth>
              <InputLabel id="source-label">{t('bankOrTPP')}</InputLabel>
              <Select
                labelId="source-label"
                label={t('bankOrTPP')}
                value={selectedSourceId}
                onChange={(e) => setSelectedSourceId(e.target.value as number)}
              >
                {banks.map((b) => (
                  <MenuItem key={b.id} value={b.id}>
                    {b.name} ({b.code}) — {b.type}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          {/* Future: option to create new Bank/TPP inline */}
          <Alert severity="info" sx={{ mt: 2 }}>
            {t('assignToSource')}: {selectedSourceId || '-'}
          </Alert>
        </Box>
      )}

      {activeStep === 2 && (
        <Box>
          <Typography variant="h6" gutterBottom>
            Map Columns
          </Typography>
          <Box sx={{ maxWidth: 480, mb: 2 }}>
            <FormControl fullWidth>
              <InputLabel id="entity-label">Target Entity</InputLabel>
              <Select
                labelId="entity-label"
                label="Target Entity"
                value={selectedEntity}
                onChange={(e) => {
                  setSelectedEntity(e.target.value as string);
                  // reset mappings targetField when switching entity
                  setMappings((prev) => prev.map((m) => ({ ...m, targetField: '' })));
                }}
              >
                {entities.map((ent) => (
                  <MenuItem key={ent.name} value={ent.name}>{ent.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          {!detectResult ? (
            <Alert severity="warning">No detection result found. Please go back.</Alert>
          ) : (
            <Table size="small" sx={{ mt: 1 }}>
              <TableHead>
                <TableRow>
                  <TableCell>#</TableCell>
                  <TableCell>Source Column</TableCell>
                  <TableCell>Sample Values</TableCell>
                  <TableCell>Target Field</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {detectResult.columns.map((c) => {
                  const mapIdx = mappings.findIndex((m) => m.columnIndex === c.index);
                  const entry = mapIdx >= 0 ? mappings[mapIdx] : { columnIndex: c.index, columnName: c.name, targetField: '' };
                  return (
                    <TableRow key={c.index}>
                      <TableCell>{c.index}</TableCell>
                      <TableCell>{c.name}</TableCell>
                      <TableCell>{c.sampleValues.join(', ')}</TableCell>
                      <TableCell style={{ minWidth: 260 }}>
                        <FormControl fullWidth>
                          <InputLabel id={`field-label-${c.index}`}>Field</InputLabel>
                          <Select
                            labelId={`field-label-${c.index}`}
                            label="Field"
                            value={entry.targetField}
                            onChange={(e) => {
                              const next = [...mappings];
                              const val = e.target.value as string;
                              if (mapIdx >= 0) {
                                next[mapIdx] = { ...entry, targetField: val };
                              } else {
                                next.push({ columnIndex: c.index, columnName: c.name, targetField: val });
                              }
                              setMappings(next);
                            }}
                            disabled={!selectedEntity}
                          >
                            <MenuItem value=""><em>— Unmapped —</em></MenuItem>
                            {(entities.find((e) => e.name === selectedEntity)?.fields || []).map((f) => (
                              <MenuItem key={f.name} value={f.name}>
                                {f.name} ({f.type}){f.required ? ' *' : ''}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
          <Alert severity="info" sx={{ mt: 2 }}>
            Choose an entity first. Only mapped fields will be imported; unmapped columns are ignored.
          </Alert>
        </Box>
      )}

      <Box mt={3} display="flex" justifyContent="space-between">
        <Button disabled={activeStep === 0} onClick={handleBack}>
          {t('previous')}
        </Button>
        {activeStep === 0 ? (
          <Button variant="contained" onClick={onUpload} disabled={loading || !file}>
            {t('next')}
          </Button>
        ) : (
          <Button
            variant="contained"
            onClick={handleNext}
            disabled={
              (activeStep === 1 && !canNextFromStep2) ||
              (activeStep === 2 && (!selectedEntity))
            }
          >
            {t('next')}
          </Button>
        )}
      </Box>
    </Paper>
  );
};

export default NewFileWizard;
