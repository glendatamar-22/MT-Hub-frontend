import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import GroupDetail from './pages/GroupDetail';
import AdminPanel from './pages/AdminPanel';
import AdminGroupBulkEdit from './pages/AdminGroupBulkEdit';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#863c98',
      light: '#a366b5',
      dark: '#5d2a6a',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#6d28d9',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/groups/:id"
            element={
              <PrivateRoute>
                <GroupDetail />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <PrivateRoute adminOnly>
                <AdminPanel />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/groups/:id/edit"
            element={
              <PrivateRoute adminOnly>
                <AdminGroupBulkEdit />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/groups/:id"
            element={
              <PrivateRoute adminOnly>
                <AdminGroupBulkEdit />
              </PrivateRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;

