// src/components/AlertNotification.jsx
import * as React from 'react';
import { useNotifications } from '../contexts/NotificationContext';
import Button from '@mui/material/Button';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import RadioGroup from '@mui/material/RadioGroup';
import Radio from '@mui/material/Radio';
import Stack from '@mui/material/Stack';

export default function AlertNotification() {
  const { showNotification } = useNotifications();
  const [severity, setSeverity] = React.useState('info');

  return (
    <div>
      <Stack spacing={2}>
        <FormControl>
          <FormLabel id="alert-notification-severity">Severity</FormLabel>
          <RadioGroup
            row
            value={severity}
            onChange={(event) => setSeverity(event.target.value)}
            aria-labelledby="alert-notification-severity"
            name="severity"
          >
            <FormControlLabel value="info" control={<Radio />} label="Info" />
            <FormControlLabel value="success" control={<Radio />} label="Success" />
            <FormControlLabel value="warning" control={<Radio />} label="Warning" />
            <FormControlLabel value="error" control={<Radio />} label="Error" />
          </RadioGroup>
        </FormControl>
        <Button
          variant="contained"
          onClick={() => {
            showNotification('Consider yourself notified!', {
              severity,
              autoHideDuration: 3000,
            });
          }}
        >
          Notify me
        </Button>
      </Stack>
    </div>
  );
}