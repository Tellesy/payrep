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
  Alert,
  Fade,
  Snackbar
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

// Step keys for i18n labels
const stepKeys = ['uploadAndDetect', 'assignToSource', 'mapColumns', 'configureFile', 'setSchedule', 'confirm'] as const;

const NewFileWizard: React.FC = () => {
  const { t, i18n } = useTranslation();
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
  // Step 4 settings state
  const [hasHeader, setHasHeader] = useState<boolean>(true);
  const [dateFormat, setDateFormat] = useState<string>('yyyy-MM-dd');
  const [encoding, setEncoding] = useState<string>('UTF-8');
  const [filePattern, setFilePattern] = useState<string>('*.csv');
  const [skipRows, setSkipRows] = useState<number>(0);
  const [quoteChar, setQuoteChar] = useState<string>('"');
  // Step 4 pattern builder state
  const [patternPrefix, setPatternPrefix] = useState<string>('');
  const [nameSeparator, setNameSeparator] = useState<string>('_');
  const [dateToken, setDateToken] = useState<string>('YYYY-MM-DD');
  const [includeBankCode, setIncludeBankCode] = useState<boolean>(true);
  const [includeCounter, setIncludeCounter] = useState<boolean>(false);
  const [counterPadLength, setCounterPadLength] = useState<number>(2);
  const [generatedPattern, setGeneratedPattern] = useState<string>('');
  const [patternOrder, setPatternOrder] = useState<'dateFirst' | 'codeFirst'>('dateFirst');
  
  // Step 5 cron builder state
  const [frequency, setFrequency] = useState<'everyNMinutes' | 'everyNHours' | 'hourly' | 'daily' | 'weekly' | 'monthly'>('daily');
  const [timeOfDay, setTimeOfDay] = useState<string>('02:00'); // HH:mm
  const [dayOfWeek, setDayOfWeek] = useState<number>(1); // 0=Sun..6=Sat
  const [dayOfMonth, setDayOfMonth] = useState<number>(1);
  const [cronExpr, setCronExpr] = useState<string>('0 0 2 * * *');
  const [minuteInterval, setMinuteInterval] = useState<number>(15);
  const [hourInterval, setHourInterval] = useState<number>(1);

  // Step transition feedback
  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);

  // Build filename preview and glob based on selections
  const buildFilenamePreview = () => {
    const parts: string[] = [];
    if (patternPrefix) parts.push(patternPrefix);
    const sep = nameSeparator ?? '';
    const dateSample = dateToken
      .replace('YYYY', '2025')
      .replace('MM', '08')
      .replace('DD', '09');
    const datePart = dateToken ? dateSample : '';
    const codePart = includeBankCode ? '{BANK_CODE}' : '';
    if (patternOrder === 'dateFirst') {
      if (datePart) parts.push(datePart);
      if (codePart) parts.push(codePart);
    } else {
      if (codePart) parts.push(codePart);
      if (datePart) parts.push(datePart);
    }
    if (includeCounter) parts.push('{' + `COUNTER${counterPadLength ? `:pad${counterPadLength}` : ''}` + '}');
    const base = parts.join(sep);
    const ext = '.csv';
    return base + ext;
  };

  const buildGlob = () => {
    const parts: string[] = [];
    if (patternPrefix) parts.push(patternPrefix);
    const sep = nameSeparator ?? '';
    const datePart = dateToken ? '*' : '';
    const codePart = includeBankCode ? '*' : '';
    if (patternOrder === 'dateFirst') {
      if (datePart) parts.push(datePart);
      if (codePart) parts.push(codePart);
    } else {
      if (codePart) parts.push(codePart);
      if (datePart) parts.push(datePart);
    }
    if (includeCounter) parts.push('*');
    const base = parts.join(sep);
    return `${base}.csv`;
  };

  useEffect(() => {
    setGeneratedPattern(buildGlob());
  }, [patternPrefix, nameSeparator, dateToken, includeBankCode, includeCounter, counterPadLength, patternOrder]);

  // Build cron expression from inputs
  useEffect(() => {
    const [hh, mm] = timeOfDay.split(':').map((s) => parseInt(s || '0', 10));
    let expr = '0 0 2 * * *';
    switch (frequency) {
      case 'everyNMinutes':
        expr = `0 */${Math.max(1, minuteInterval)} * * * *`;
        break;
      case 'everyNHours': {
        const [, mm] = timeOfDay.split(':').map((s) => parseInt(s || '0', 10));
        expr = `0 ${isNaN(mm) ? 0 : mm} */${Math.max(1, hourInterval)} * * *`;
        break;
      }
      case 'hourly':
        expr = `0 0 * * * *`;
        break;
      case 'daily':
        expr = `0 ${mm || 0} ${hh || 0} * * *`;
        break;
      case 'weekly':
        expr = `0 ${mm || 0} ${hh || 0} * * ${dayOfWeek}`;
        break;
      case 'monthly':
        expr = `0 ${mm || 0} ${hh || 0} ${dayOfMonth} * *`;
        break;
    }
    setCronExpr(expr);
  }, [frequency, timeOfDay, dayOfWeek, dayOfMonth, minuteInterval, hourInterval]);

  // Show snackbar on step change
  useEffect(() => {
    if (activeStep >= 0) {
      setSnackbarOpen(true);
    }
  }, [activeStep]);

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
    if (activeStep === 3) {
      // Save file settings (temporary backend stub) then proceed to Step 5
      try {
        setLoading(true);
        setError(null);
        if (!token) { setError(t('pleaseLoginAgain')); return; }
        const res = await fetch('/api/admin/wizard/settings', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: getAuthHeader(token)!
          },
          body: JSON.stringify({
            sourceId: selectedSourceId || null,
            fileName: detectResult?.fileName || null,
            delimiter: detectResult?.delimiter || ',',
            hasHeader,
            dateFormat,
            encoding,
            filePattern,
            skipRows,
            quoteChar,
            patternPrefix,
            nameSeparator,
            includeBankCode,
            includeCounter,
            counterPadLength,
            patternOrder,
            generatedPattern
          })
        });
        if (!res.ok) {
          if (res.status === 401) { setError(t('pleaseLoginAgain')); return; }
          if (res.status === 403) { setError(t('forbidden')); return; }
          const text = await res.text();
          setError(text || t('networkError'));
          return;
        }
        setActiveStep(4);
      } catch (e:any) {
        console.error(e);
        setError(t('networkError'));
      } finally {
        setLoading(false);
      }
      return;
    }
    if (activeStep === 5) {
      // Finalize: send summary to backend (if endpoint exists)
      (async () => {
        try {
          setLoading(true);
          setError(null);
          if (!token) { setError(t('pleaseLoginAgain')); return; }
          const payload = {
            sourceId: selectedSourceId || null,
            entity: selectedEntity,
            mappings: mappings.filter(m => !!m.targetField),
            settings: {
              hasHeader,
              dateFormat,
              encoding,
              filePattern,
              skipRows,
              quoteChar,
              patternPrefix,
              nameSeparator,
              dateToken,
              includeBankCode,
              includeCounter,
              counterPadLength,
              patternOrder,
              generatedPattern
            },
            schedule: {
              frequency,
              timeOfDay,
              dayOfWeek,
              dayOfMonth,
              minuteInterval,
              hourInterval,
              cron: cronExpr
            }
          };
          const res = await fetch('/api/admin/wizard/finish', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: getAuthHeader(token)! },
            body: JSON.stringify(payload)
          });
          if (!res.ok) {
            if (res.status === 401) { setError(t('pleaseLoginAgain')); return; }
            if (res.status === 403) { setError(t('forbidden')); return; }
            const text = await res.text();
            setError(text || t('networkError'));
            return;
          }
          setSnackbarOpen(true);
          setActiveStep(0);
        } catch (e:any) {
          console.error(e);
          setError(t('networkError'));
        } finally {
          setLoading(false);
        }
      })();
      return;
    }
    setActiveStep((s) => Math.min(s + 1, stepKeys.length - 1));
  };

  const handleBack = () => setActiveStep((s) => Math.max(s - 1, 0));

  return (
    <Paper sx={{ p: 3 }} dir={i18n.dir()}>
      <Typography variant="h5" gutterBottom>
        {t('newFileWizard')}
      </Typography>

      <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 3 }}>
        {stepKeys.map((k) => (
          <Step key={k}>
            <StepLabel>{t(k)}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Fade in timeout={250}>
        <div>
      {activeStep === 3 && (
        <Box>
          <Typography variant="h6" gutterBottom>
            {t('configureFile')}
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2, maxWidth: 1000 }}>
            <FormControl fullWidth>
              <InputLabel id="has-header-label">{t('hasHeader') || 'Has Header Row'}</InputLabel>
              <Select
                labelId="has-header-label"
                label={t('hasHeader') || 'Has Header Row'}
                value={hasHeader ? 'yes' : 'no'}
                onChange={(e) => setHasHeader((e.target.value as string) === 'yes')}
              >
                <MenuItem value="yes">{t('yes') || 'Yes'}</MenuItem>
                <MenuItem value="no">{t('no') || 'No'}</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label={t('dateFormat') || 'Date Format'}
              value={dateFormat}
              onChange={(e) => setDateFormat(e.target.value)}
              fullWidth
            />

            <TextField
              label={t('encoding') || 'Encoding'}
              value={encoding}
              onChange={(e) => setEncoding(e.target.value)}
              fullWidth
            />

            <TextField
              label={t('filePattern') || 'File Pattern'}
              value={filePattern}
              onChange={(e) => setFilePattern(e.target.value)}
              helperText={t('globPatternExample') || 'e.g., *.csv or TPP901_*.csv'}
              fullWidth
            />

            {/* Pattern Builder */}
            <TextField
              label={t('constantPrefix') || 'Constant name prefix'}
              value={patternPrefix}
              onChange={(e) => setPatternPrefix(e.target.value)}
              helperText={t('constantPrefixHelp') || 'Static part at file start, e.g. TPP901 or BANKPOS'}
              fullWidth
            />
            <TextField
              label={t('nameSeparator') || 'Name separator'}
              value={nameSeparator}
              onChange={(e) => setNameSeparator(e.target.value)}
              helperText={t('separatorPlaceholder') || 'e.g. _ or - (leave empty for no separator)'}
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel id="date-token-label">{t('dateToken') || 'Date token'}</InputLabel>
              <Select
                labelId="date-token-label"
                label={t('dateToken') || 'Date token'}
                value={dateToken}
                onChange={(e) => setDateToken(e.target.value as string)}
              >
                <MenuItem value="YYYY-MM-DD">YYYY-MM-DD</MenuItem>
                <MenuItem value="DD-MM-YYYY">DD-MM-YYYY</MenuItem>
                <MenuItem value="YYYYMMDD">YYYYMMDD</MenuItem>
                <MenuItem value="DDMMYYYY">DDMMYYYY</MenuItem>
              </Select>
            </FormControl>
            <Alert severity="info">{t('dateTokenHelp') || 'Choose the date portion as it appears in the file name.'}</Alert>
            <FormControl fullWidth>
              <InputLabel id="order-label">{t('patternOrder') || 'Order of parts'}</InputLabel>
              <Select
                labelId="order-label"
                label={t('patternOrder') || 'Order of parts'}
                value={patternOrder}
                onChange={(e) => setPatternOrder(e.target.value as any)}
              >
                <MenuItem value="dateFirst">{t('dateBeforeCode') || 'Date before code'}</MenuItem>
                <MenuItem value="codeFirst">{t('codeBeforeDate') || 'Code before date'}</MenuItem>
              </Select>
            </FormControl>
            <Alert severity="info">{t('patternOrderHelp') || 'Choose whether the bank/TPP code appears before or after the date.'}</Alert>
            <FormControl fullWidth>
              <InputLabel id="include-bank-label">{t('includeBankCode') || 'Include bank/TPP code'}</InputLabel>
              <Select
                labelId="include-bank-label"
                label={t('includeBankCode') || 'Include bank/TPP code'}
                value={includeBankCode ? 'yes' : 'no'}
                onChange={(e) => setIncludeBankCode((e.target.value as string) === 'yes')}
              >
                <MenuItem value="yes">{t('yes') || 'Yes'}</MenuItem>
                <MenuItem value="no">{t('no') || 'No'}</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel id="include-counter-label">{t('includeCounter') || 'Include counter'}</InputLabel>
              <Select
                labelId="include-counter-label"
                label={t('includeCounter') || 'Include counter'}
                value={includeCounter ? 'yes' : 'no'}
                onChange={(e) => setIncludeCounter((e.target.value as string) === 'yes')}
              >
                <MenuItem value="yes">{t('yes') || 'Yes'}</MenuItem>
                <MenuItem value="no">{t('no') || 'No'}</MenuItem>
              </Select>
            </FormControl>
            {includeCounter && (
              <TextField
                type="number"
                label={t('counterPadLength') || 'Counter pad length'}
                value={counterPadLength}
                onChange={(e) => setCounterPadLength(parseInt(e.target.value || '0', 10))}
                inputProps={{ min: 1, max: 6 }}
                helperText={t('counterPadHelp') || 'Number of digits for the counter, e.g. 2 -> 01, 3 -> 002'}
                fullWidth
              />
            )}

            <TextField
              label={t('filenamePreview') || 'Filename preview'}
              value={buildFilenamePreview()}
              fullWidth
              disabled
            />
            <TextField
              label={t('generatedGlob') || 'Generated glob pattern'}
              value={generatedPattern}
              fullWidth
              disabled
            />

            <TextField
              type="number"
              label={t('skipRows') || 'Skip Rows'}
              value={skipRows}
              onChange={(e) => setSkipRows(Number(e.target.value))}
              fullWidth
              inputProps={{ min: 0 }}
            />

            <TextField
              label={t('quoteChar') || 'Quote Character'}
              value={quoteChar}
              onChange={(e) => setQuoteChar(e.target.value)}
              fullWidth
            />

            <TextField
              label={t('delimiter') || 'Delimiter'}
              value={detectResult?.delimiter || ','}
              disabled
              fullWidth
            />

            <TextField
              label={t('fileName') || 'File Name'}
              value={detectResult?.fileName || ''}
              disabled
              fullWidth
            />
          </Box>
          <Alert severity="info" sx={{ mt: 2 }}>
            {t('configureFileHelp') || 'Configure parsing options. These settings will be saved with the file type.'}
          </Alert>
        </Box>
      )}

      {activeStep === 4 && (
        <Box>
          <Typography variant="h6" gutterBottom>
            {t('cronSchedule') || 'Schedule'}
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2, maxWidth: 800 }}>
            <FormControl fullWidth>
              <InputLabel id="freq-label">{t('frequency') || 'Frequency'}</InputLabel>
              <Select
                labelId="freq-label"
                label={t('frequency') || 'Frequency'}
                value={frequency}
                onChange={(e) => setFrequency(e.target.value as any)}
              >
                <MenuItem value="everyNMinutes">{t('everyNMinutes') || 'Every N minutes'}</MenuItem>
                <MenuItem value="everyNHours">{t('everyNHours') || 'Every N hours'}</MenuItem>
                <MenuItem value="hourly">{t('hourly') || 'Hourly'}</MenuItem>
                <MenuItem value="daily">{t('daily') || 'Daily'}</MenuItem>
                <MenuItem value="weekly">{t('weekly') || 'Weekly'}</MenuItem>
                <MenuItem value="monthly">{t('monthly') || 'Monthly'}</MenuItem>
              </Select>
            </FormControl>

            {frequency === 'everyNMinutes' && (
              <TextField
                type="number"
                label={t('minuteInterval') || 'Minute interval'}
                value={minuteInterval}
                onChange={(e) => setMinuteInterval(parseInt(e.target.value || '1', 10))}
                inputProps={{ min: 1, max: 59 }}
                fullWidth
              />
            )}

            {frequency === 'everyNHours' && (
              <>
                <TextField
                  type="number"
                  label={t('hourInterval') || 'Hour interval'}
                  value={hourInterval}
                  onChange={(e) => setHourInterval(parseInt(e.target.value || '1', 10))}
                  inputProps={{ min: 1, max: 23 }}
                  fullWidth
                />
                <TextField
                  label={t('minuteOfHour') || 'Minute of hour'}
                  type="number"
                  value={parseInt((timeOfDay.split(':')[1] || '0'), 10)}
                  onChange={(e) => setTimeOfDay(`${timeOfDay.split(':')[0] || '00'}:${String(Math.min(59, Math.max(0, parseInt(e.target.value || '0', 10))).toString().padStart(2, '0'))}`)}
                  inputProps={{ min: 0, max: 59 }}
                  fullWidth
                />
              </>
            )}

            {(frequency === 'daily' || frequency === 'weekly' || frequency === 'monthly') && (
              <TextField
                label={t('timeOfDay') || 'Time of day'}
                type="time"
                value={timeOfDay}
                onChange={(e) => setTimeOfDay(e.target.value)}
                InputLabelProps={{ shrink: true }}
                inputProps={{ step: 300 }}
                fullWidth
              />
            )}

            {frequency === 'weekly' && (
              <FormControl fullWidth>
                <InputLabel id="dow-label">{t('dayOfWeek') || 'Day of week'}</InputLabel>
                <Select
                  labelId="dow-label"
                  label={t('dayOfWeek') || 'Day of week'}
                  value={dayOfWeek}
                  onChange={(e) => setDayOfWeek(e.target.value as number)}
                >
                  <MenuItem value={0}>{t('sunday') || 'Sunday'}</MenuItem>
                  <MenuItem value={1}>{t('monday') || 'Monday'}</MenuItem>
                  <MenuItem value={2}>{t('tuesday') || 'Tuesday'}</MenuItem>
                  <MenuItem value={3}>{t('wednesday') || 'Wednesday'}</MenuItem>
                  <MenuItem value={4}>{t('thursday') || 'Thursday'}</MenuItem>
                  <MenuItem value={5}>{t('friday') || 'Friday'}</MenuItem>
                  <MenuItem value={6}>{t('saturday') || 'Saturday'}</MenuItem>
                </Select>
              </FormControl>
            )}

            {frequency === 'monthly' && (
              <TextField
                type="number"
                label={t('dayOfMonth') || 'Day of month'}
                value={dayOfMonth}
                onChange={(e) => setDayOfMonth(parseInt(e.target.value || '1', 10))}
                inputProps={{ min: 1, max: 28 }}
                fullWidth
              />
            )}

            <TextField
              label={t('cronExpression') || 'Cron expression'}
              value={cronExpr}
              fullWidth
              disabled
            />
          </Box>
          <Alert severity="info" sx={{ mt: 2 }}>
            {t('cronHelp') || 'Pick how often to import. We will run at the configured schedule.'}
          </Alert>
        </Box>
      )}

      {activeStep === 5 && (
        <Box>
          <Typography variant="h6" gutterBottom>
            {t('confirm')}
          </Typography>
          <Box sx={{ maxWidth: 900 }}>
            <Alert severity="info" sx={{ mb: 2 }}>{t('reviewBeforeFinish') || 'Review your selections before finishing.'}</Alert>
            <Typography variant="subtitle1">{t('summarySource') || 'Source'}: {banks.find(b => b.id === selectedSourceId)?.name || '-'}</Typography>
            <Typography variant="subtitle1">{t('summaryEntity') || 'Entity'}: {selectedEntity || '-'}</Typography>
            <Typography variant="subtitle1">{t('summaryMappings') || 'Mappings'}: {mappings.filter(m=>m.targetField).length} {t('mappedFields') || 'mapped fields'}</Typography>
            <Typography variant="subtitle1">{t('summaryPattern') || 'Filename Pattern'}: {buildFilenamePreview()} ({generatedPattern})</Typography>
            <Typography variant="subtitle1">{t('summaryCron') || 'Schedule'}: <code>{cronExpr}</code></Typography>
          </Box>
        </Box>
      )}
        </div>
      </Fade>

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
            {activeStep === 5 ? (t('finish') || 'Finish') : t('next')}
          </Button>
        )}
      </Box>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={1200}
        onClose={() => setSnackbarOpen(false)}
        message={`${t('movedToStep') || 'Moved to step'}: ${t(stepKeys[activeStep])}`}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Paper>
  );
};

export default NewFileWizard;
