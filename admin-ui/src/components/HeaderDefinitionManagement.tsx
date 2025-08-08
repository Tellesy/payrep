import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Snackbar,
  Alert,
  TextField,
  Typography,
  Table, TableBody, TableCell, TableHead, TableRow,
  CircularProgress
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import ViewColumnIcon from '@mui/icons-material/ViewColumn';
import { useTranslation } from 'react-i18next';

interface HeaderDefinition {
  id: number;
  entityType: string;
  key: string; // matches backend DTO field "key"
  displayName: string;
}

interface HeaderAlias {
  id: number;
  headerDefinitionId: number;
  alias: string;
}

const HeaderDefinitionManagement: React.FC = () => {
  const { token, logout } = useAuth();
  const { t } = useTranslation();

  const [defs, setDefs] = useState<HeaderDefinition[]>([]);
  const [aliases, setAliases] = useState<Record<number, HeaderAlias[]>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [filterEntity, setFilterEntity] = useState<string>('');
  const [search, setSearch] = useState('');

  const [editOpen, setEditOpen] = useState(false);
  const [current, setCurrent] = useState<Partial<HeaderDefinition> | null>(null);

  const [aliasOpen, setAliasOpen] = useState(false);
  const [aliasTarget, setAliasTarget] = useState<HeaderDefinition | null>(null);
  const [newAlias, setNewAlias] = useState('');

  const headersEndpoint = '/api/admin/headers';

  const authHeaders = useMemo(() => ({
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }), [token]);

  const fetchDefs = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(headersEndpoint, { headers: authHeaders });
      if (res.status === 401) {
        logout();
        window.location.href = '/login';
        return;
      }
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
      const data: HeaderDefinition[] = await res.json();
      // Canonicalize and de-duplicate by (entityType,key)
      const camelToSpaces = (s: string) => s.replace(/([a-z])([A-Z])/g, '$1 $2');
      const normalize = (s: string) => camelToSpaces(s.trim())
        .replace(/[_-]/g, ' ')
        .replace(/\s+/g, ' ')
        .toLowerCase();
      const canonicalEntityType = (raw: string) => {
        const norm = normalize(raw);
        const map: Record<string, string> = {
          'atm terminal data': 'ATM Terminal Data',
          'atm transaction data': 'ATM Transaction Data',
          'pos terminal data': 'POS Terminal Data',
          'pos transaction data': 'POS Transaction Data',
          'card lifecycle': 'Card Lifecycle',
          'e commerce card activity': 'E-Commerce Card Activity',
          'e-commerce card activity': 'E-Commerce Card Activity',
          'transaction volume': 'Transaction Volume',
        };
        return map[norm] ?? raw.trim();
      };
      const canonicalized = data.map(d => ({ ...d, entityType: canonicalEntityType(d.entityType) }));
      const grouped = new Map<string, HeaderDefinition[]>();
      canonicalized.forEach(d => {
        const key = `${d.entityType}::${d.key}`;
        const arr = grouped.get(key) ?? [];
        arr.push(d);
        grouped.set(key, arr);
      });
      const deduped: HeaderDefinition[] = Array.from(grouped.values()).map(list =>
        list.sort((a,b) => (a.id ?? 0) - (b.id ?? 0))[0]
      );
      // Sort by entityType then key
      deduped.sort((a,b) => a.entityType.localeCompare(b.entityType) || a.key.localeCompare(b.key));
      setDefs(deduped);
      setError(null);
    } catch (e: any) {
      setError(`${t('failedToLoadHeaders')}: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchAliasesFor = async (defId: number) => {
    try {
      const res = await fetch(`${headersEndpoint}/${defId}/aliases`, { headers: authHeaders });
      if (!res.ok) throw new Error(`${res.status}`);
      const data = await res.json();
      setAliases(prev => ({ ...prev, [defId]: data }));
    } catch (e) {
      // Silently ignore if endpoint not ready
    }
  };

  useEffect(() => {
    fetchDefs();
  }, [token]);

  const filtered = useMemo(() => {
    let list = defs;
    const norm = (s: string) => s.trim().toLowerCase().replace(/[_-]/g, ' ').replace(/\s+/g, ' ');
    if (filterEntity) list = list.filter(d => norm(d.entityType) === norm(filterEntity));
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(d =>
        d.displayName.toLowerCase().includes(q) ||
        d.key.toLowerCase().includes(q)
      );
    }
    // Ensure stable sort
    return [...list].sort((a,b) => a.entityType.localeCompare(b.entityType) || a.key.localeCompare(b.key));
  }, [defs, filterEntity, search]);

  const uniqueEntities = useMemo(() => {
    // defs already canonicalized; just unique and sort
    return Array.from(new Set(defs.map(d => d.entityType))).sort();
  }, [defs]);

  const openCreate = () => {
    setCurrent({ entityType: uniqueEntities[0] || '', key: '', displayName: '' });
    setEditOpen(true);
  };

  const openEdit = (d: HeaderDefinition) => {
    setCurrent({ ...d });
    setEditOpen(true);
  };

  const saveCurrent = async () => {
    if (!current || !current.entityType || !current.key || !current.displayName) {
      setError(t('pleaseFillRequiredFields'));
      return;
    }
    try {
      const isNew = !current.id;
      const method = isNew ? 'POST' : 'PUT';
      const url = isNew ? headersEndpoint : `${headersEndpoint}/${current.id}`;
      const res = await fetch(url, {
        method,
        headers: authHeaders,
        body: JSON.stringify(
          isNew
            ? { entityType: (current.entityType || '').trim(), key: current.key, displayName: current.displayName }
            : { displayName: current.displayName }
        )
      });
      if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
      setSuccessMsg(t('savedSuccessfully'));
      setEditOpen(false);
      setCurrent(null);
      fetchDefs();
    } catch (e: any) {
      setError(`${t('saveFailed')}: ${e.message}`);
    }
  };

  const deleteDef = async (id: number) => {
    if (!window.confirm(t('deleteConfirmHeader'))) return;
    try {
      const res = await fetch(`${headersEndpoint}/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error(`${res.status}`);
      setSuccessMsg(t('deleted'));
      setDefs(prev => prev.filter(d => d.id !== id));
    } catch (e: any) {
      setError(`${t('deleteFailed')}: ${e.message}`);
    }
  };

  const openAliasDialog = async (def: HeaderDefinition) => {
    setAliasTarget(def);
    setNewAlias('');
    setAliasOpen(true);
    await fetchAliasesFor(def.id);
  };

  const addAlias = async () => {
    if (!aliasTarget || !newAlias.trim()) return;
    try {
      const res = await fetch(`${headersEndpoint}/${aliasTarget.id}/aliases`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({ alias: newAlias.trim() })
      });
      if (!res.ok) throw new Error(`${res.status}`);
      setNewAlias('');
      await fetchAliasesFor(aliasTarget.id);
      setSuccessMsg(t('aliasAdded'));
    } catch (e: any) {
      setError(`${t('addAliasFailed')}: ${e.message}`);
    }
  };

  const removeAlias = async (aliasId: number) => {
    try {
      if (!aliasTarget) return;
      const res = await fetch(`${headersEndpoint}/${aliasTarget.id}/aliases/${aliasId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error(`${res.status}`);
      await fetchAliasesFor(aliasTarget.id);
    } catch (e: any) {
      setError(`${t('removeAliasFailed')}: ${e.message}`);
    }
  };

  return (
    <Paper sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <ViewColumnIcon color="primary" />
        <Typography variant="h6">{t('headerDefinitions')}</Typography>
      </Box>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
        <Box sx={{ flex: { xs: '1 1 100%', md: '0 0 25%' }, minWidth: { md: 260 } }}>
          <FormControl fullWidth>
            <InputLabel>{t('entityType')}</InputLabel>
            <Select value={filterEntity} label={t('entityType')} onChange={(e) => setFilterEntity(e.target.value)}>
              <MenuItem value="">{t('all')}</MenuItem>
              {uniqueEntities.map(et => (
                <MenuItem key={et} value={et}>{et}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
        <Box sx={{ flex: { xs: '1 1 100%', md: '0 0 41.666%' }, minWidth: { md: 320 } }}>
          <TextField fullWidth label={t('search')} placeholder={t('searchHeadersPlaceholder')} value={search} onChange={(e) => setSearch(e.target.value)} />
        </Box>
        <Box sx={{ flex: { xs: '1 1 100%', md: '0 0 33.333%' }, display: 'flex', justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
          <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>{t('newHeader')}</Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>{t('entityType')}</TableCell>
              <TableCell>{t('key')}</TableCell>
              <TableCell>{t('displayName')}</TableCell>
              <TableCell>{t('aliases')}</TableCell>
              <TableCell align="right">{t('actions')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.map(def => (
              <TableRow key={def.id} hover>
                <TableCell>{def.entityType}</TableCell>
                <TableCell><code>{def.key}</code></TableCell>
                <TableCell>{def.displayName}</TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {(aliases[def.id] || []).slice(0, 5).map(a => (
                      <Chip key={a.id} size="small" label={a.alias} onDelete={() => removeAlias(a.id)} />
                    ))}
                    <Button size="small" onClick={() => openAliasDialog(def)}>{t('manage')}</Button>
                  </Box>
                </TableCell>
                <TableCell align="right">
                  <IconButton onClick={() => openEdit(def)}><EditIcon /></IconButton>
                  <IconButton onClick={() => deleteDef(def.id)}><DeleteIcon /></IconButton>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={5}>
                  <Typography align="center" sx={{ py: 3 }}>{t('noHeadersFound')}</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={editOpen} onClose={() => setEditOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{current?.id ? t('editHeader') : t('newHeader')}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <FormControl fullWidth>
              <InputLabel>{t('entityType')}</InputLabel>
              <Select
                value={current?.entityType || ''}
                label={t('entityType')}
                onChange={(e) => setCurrent(prev => ({ ...(prev || {}), entityType: e.target.value }))}
              >
                {/* Allow free text by showing current entity + known entities */}
                {current?.entityType && !uniqueEntities.includes(current.entityType) && (
                  <MenuItem value={current.entityType}>{current.entityType}</MenuItem>
                )}
                {uniqueEntities.map(et => (
                  <MenuItem key={et} value={et}>{et}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label={t('key')}
              placeholder={t('keyPlaceholder')}
              value={current?.key || ''}
              onChange={(e) => setCurrent(prev => ({ ...(prev || {}), key: e.target.value }))}
              helperText={t('canonicalKeyHelper')}
              fullWidth
            />
            <TextField
              label={t('displayName')}
              placeholder={t('displayNamePlaceholder')}
              value={current?.displayName || ''}
              onChange={(e) => setCurrent(prev => ({ ...(prev || {}), displayName: e.target.value }))}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)}>{t('cancel')}</Button>
          <Button onClick={saveCurrent} variant="contained">{t('save')}</Button>
        </DialogActions>
      </Dialog>

      {/* Alias Dialog */}
      <Dialog open={aliasOpen} onClose={() => setAliasOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>
          {t('manageAliases')} {aliasTarget ? `(${aliasTarget.displayName})` : ''}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            <TextField
              label={t('newAlias')}
              value={newAlias}
              onChange={(e) => setNewAlias(e.target.value)}
              fullWidth
              placeholder={t('newAliasPlaceholder')}
            />
            <Button variant="contained" onClick={addAlias} startIcon={<AddIcon />}>{t('add')}</Button>
          </Box>
          <Divider sx={{ mb: 2 }} />
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {(aliasTarget && aliases[aliasTarget.id]) ? (
              aliases[aliasTarget.id].map(a => (
                <Chip key={a.id} label={a.alias} onDelete={() => removeAlias(a.id)} />
              ))
            ) : (
              <Typography variant="body2" color="text.secondary">{t('noAliasesYet')}</Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAliasOpen(false)}>{t('close')}</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={!!successMsg} autoHideDuration={2500} onClose={() => setSuccessMsg(null)}>
        <Alert onClose={() => setSuccessMsg(null)} severity="success" sx={{ width: '100%' }}>
          {successMsg}
        </Alert>
      </Snackbar>
    </Paper>
  );
};

export default HeaderDefinitionManagement;
