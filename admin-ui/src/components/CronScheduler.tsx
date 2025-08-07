import React, { useState, useEffect } from 'react';
import {
    Box,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    TextField,
    Typography,
    Chip
} from '@mui/material';

interface CronSchedulerProps {
    value: string;
    onChange: (cronExpression: string) => void;
    label?: string;
}

interface ScheduleConfig {
    type: 'minutes' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'custom';
    interval?: number;
    hour?: number;
    minute?: number;
    dayOfWeek?: number;
    dayOfMonth?: number;
}

const CronScheduler: React.FC<CronSchedulerProps> = ({ value, onChange, label = "Schedule" }) => {
    const [config, setConfig] = useState<ScheduleConfig>({ type: 'daily', hour: 0, minute: 0 });

    // Parse existing cron expression to config
    useEffect(() => {
        if (value) {
            const parsed = parseCronExpression(value);
            if (parsed) {
                setConfig(parsed);
            }
        }
    }, [value]);

    // Convert config to cron expression and notify parent
    useEffect(() => {
        const cronExpression = configToCron(config);
        if (cronExpression !== value) {
            onChange(cronExpression);
        }
    }, [config, value]); // Remove onChange from dependencies to prevent infinite loop

    const parseCronExpression = (cron: string): ScheduleConfig | null => {
        const parts = cron.trim().split(/\s+/);
        if (parts.length !== 5) return null;

        const [minute, hour, dayOfMonth, month, dayOfWeek] = parts;

        // Every X minutes
        if (minute.startsWith('*/') && hour === '*' && dayOfMonth === '*' && month === '*' && dayOfWeek === '*') {
            return { type: 'minutes', interval: parseInt(minute.substring(2)) };
        }

        // Hourly at specific minute
        if (hour === '*' && dayOfMonth === '*' && month === '*' && dayOfWeek === '*') {
            return { type: 'hourly', minute: parseInt(minute) };
        }

        // Daily at specific time
        if (dayOfMonth === '*' && month === '*' && dayOfWeek === '*') {
            return { type: 'daily', hour: parseInt(hour), minute: parseInt(minute) };
        }

        // Weekly on specific day and time
        if (dayOfMonth === '*' && month === '*' && dayOfWeek !== '*') {
            return { type: 'weekly', dayOfWeek: parseInt(dayOfWeek), hour: parseInt(hour), minute: parseInt(minute) };
        }

        // Monthly on specific day and time
        if (month === '*' && dayOfWeek === '*' && dayOfMonth !== '*') {
            return { type: 'monthly', dayOfMonth: parseInt(dayOfMonth), hour: parseInt(hour), minute: parseInt(minute) };
        }

        return { type: 'custom' };
    };

    const configToCron = (config: ScheduleConfig): string => {
        switch (config.type) {
            case 'minutes':
                return `*/${config.interval || 5} * * * *`;
            case 'hourly':
                return `${config.minute || 0} * * * *`;
            case 'daily':
                return `${config.minute || 0} ${config.hour || 0} * * *`;
            case 'weekly':
                return `${config.minute || 0} ${config.hour || 0} * * ${config.dayOfWeek || 0}`;
            case 'monthly':
                return `${config.minute || 0} ${config.hour || 0} ${config.dayOfMonth || 1} * *`;
            case 'custom':
                return value || '0 0 * * *';
            default:
                return '0 0 * * *';
        }
    };

    const getScheduleDescription = (): string => {
        switch (config.type) {
            case 'minutes':
                return `Every ${config.interval} minutes`;
            case 'hourly':
                return `Every hour at minute ${config.minute}`;
            case 'daily':
                return `Daily at ${String(config.hour).padStart(2, '0')}:${String(config.minute).padStart(2, '0')}`;
            case 'weekly':
                const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
                return `Weekly on ${days[config.dayOfWeek || 0]} at ${String(config.hour).padStart(2, '0')}:${String(config.minute).padStart(2, '0')}`;
            case 'monthly':
                return `Monthly on day ${config.dayOfMonth} at ${String(config.hour).padStart(2, '0')}:${String(config.minute).padStart(2, '0')}`;
            case 'custom':
                return `Custom: ${value}`;
            default:
                return '';
        }
    };

    return (
        <Box>
            <FormControl fullWidth margin="normal">
                <InputLabel>{label}</InputLabel>
                <Select
                    value={config.type}
                    label={label}
                    onChange={(e) => setConfig({ ...config, type: e.target.value as ScheduleConfig['type'] })}
                >
                    <MenuItem value="minutes">Every X Minutes</MenuItem>
                    <MenuItem value="hourly">Hourly</MenuItem>
                    <MenuItem value="daily">Daily</MenuItem>
                    <MenuItem value="weekly">Weekly</MenuItem>
                    <MenuItem value="monthly">Monthly</MenuItem>
                    <MenuItem value="custom">Custom Cron Expression</MenuItem>
                </Select>
            </FormControl>

            {config.type === 'minutes' && (
                <TextField
                    fullWidth
                    type="number"
                    label="Interval (minutes)"
                    value={config.interval || 5}
                    onChange={(e) => setConfig({ ...config, interval: parseInt(e.target.value) || 5 })}
                    inputProps={{ min: 1, max: 59 }}
                    margin="normal"
                />
            )}

            {config.type === 'hourly' && (
                <TextField
                    fullWidth
                    type="number"
                    label="Minute"
                    value={config.minute || 0}
                    onChange={(e) => setConfig({ ...config, minute: parseInt(e.target.value) || 0 })}
                    inputProps={{ min: 0, max: 59 }}
                    margin="normal"
                    helperText="Minute of the hour (0-59)"
                />
            )}

            {config.type === 'daily' && (
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <TextField
                        fullWidth
                        type="number"
                        label="Hour"
                        value={config.hour || 0}
                        onChange={(e) => setConfig({ ...config, hour: parseInt(e.target.value) || 0 })}
                        inputProps={{ min: 0, max: 23 }}
                        margin="normal"
                        helperText="Hour (0-23)"
                    />
                    <TextField
                        fullWidth
                        type="number"
                        label="Minute"
                        value={config.minute || 0}
                        onChange={(e) => setConfig({ ...config, minute: parseInt(e.target.value) || 0 })}
                        inputProps={{ min: 0, max: 59 }}
                        margin="normal"
                        helperText="Minute (0-59)"
                    />
                </Box>
            )}

            {config.type === 'weekly' && (
                <>
                    <FormControl fullWidth margin="normal">
                        <InputLabel>Day of Week</InputLabel>
                        <Select
                            value={config.dayOfWeek || 0}
                            label="Day of Week"
                            onChange={(e) => setConfig({ ...config, dayOfWeek: e.target.value as number })}
                        >
                            <MenuItem value={0}>Sunday</MenuItem>
                            <MenuItem value={1}>Monday</MenuItem>
                            <MenuItem value={2}>Tuesday</MenuItem>
                            <MenuItem value={3}>Wednesday</MenuItem>
                            <MenuItem value={4}>Thursday</MenuItem>
                            <MenuItem value={5}>Friday</MenuItem>
                            <MenuItem value={6}>Saturday</MenuItem>
                        </Select>
                    </FormControl>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <TextField
                            fullWidth
                            type="number"
                            label="Hour"
                            value={config.hour || 0}
                            onChange={(e) => setConfig({ ...config, hour: parseInt(e.target.value) || 0 })}
                            inputProps={{ min: 0, max: 23 }}
                            margin="normal"
                        />
                        <TextField
                            fullWidth
                            type="number"
                            label="Minute"
                            value={config.minute || 0}
                            onChange={(e) => setConfig({ ...config, minute: parseInt(e.target.value) || 0 })}
                            inputProps={{ min: 0, max: 59 }}
                            margin="normal"
                        />
                    </Box>
                </>
            )}

            {config.type === 'monthly' && (
                <>
                    <TextField
                        fullWidth
                        type="number"
                        label="Day of Month"
                        value={config.dayOfMonth || 1}
                        onChange={(e) => setConfig({ ...config, dayOfMonth: parseInt(e.target.value) || 1 })}
                        inputProps={{ min: 1, max: 31 }}
                        margin="normal"
                        helperText="Day of the month (1-31)"
                    />
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <TextField
                            fullWidth
                            type="number"
                            label="Hour"
                            value={config.hour || 0}
                            onChange={(e) => setConfig({ ...config, hour: parseInt(e.target.value) || 0 })}
                            inputProps={{ min: 0, max: 23 }}
                            margin="normal"
                        />
                        <TextField
                            fullWidth
                            type="number"
                            label="Minute"
                            value={config.minute || 0}
                            onChange={(e) => setConfig({ ...config, minute: parseInt(e.target.value) || 0 })}
                            inputProps={{ min: 0, max: 59 }}
                            margin="normal"
                        />
                    </Box>
                </>
            )}

            {config.type === 'custom' && (
                <TextField
                    fullWidth
                    label="Custom Cron Expression"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    margin="normal"
                    helperText="Enter a custom cron expression (e.g., '0 */2 * * *' for every 2 hours)"
                />
            )}

            <Box mt={2}>
                <Typography variant="body2" color="textSecondary">
                    Schedule: <Chip label={getScheduleDescription()} size="small" color="primary" />
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                    Cron Expression: <code>{configToCron(config)}</code>
                </Typography>
            </Box>
        </Box>
    );
};

export default CronScheduler;
