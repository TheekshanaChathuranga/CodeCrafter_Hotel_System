// src/contexts/NotificationContext.jsx
import * as React from 'react';
import { createContext, useContext } from 'react';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';

const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  const [notification, setNotification] = React.useState(null);
  const [open, setOpen] = React.useState(false);

  const showNotification = (message, options = {}) => {
    setNotification({ message, ...options });
    setOpen(true);
  };

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpen(false);
  };

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      <Snackbar
        open={open}
        autoHideDuration={notification?.autoHideDuration || 3000}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={handleClose}
          severity={notification?.severity || 'info'}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {notification?.message}
        </Alert>
      </Snackbar>
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  return useContext(NotificationContext);
}