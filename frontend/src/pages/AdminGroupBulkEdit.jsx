import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Typography,
  Container,
  Paper,
  Box,
  Grid,
  TextField,
  Button,
  CircularProgress,
  Autocomplete,
  Chip,
  Snackbar,
  Alert,
  Divider,
} from '@mui/material';
import { Delete, Add } from '@mui/icons-material';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import AppHeader from '../components/AppHeader';
import api from '../config/axios';

const parentSchema = z.object({
  name: z.string().optional(),
  email: z.string().email('Palun sisestage kehtiv e-posti aadress'),
});

const groupSchema = z.object({
  name: z.string().min(1, 'Nimi on kohustuslik'),
  location: z.string().min(1, 'Asukoht on kohustuslik'),
  description: z.string().optional(),
  studentIds: z.array(z.string()).default([]),
  parents: z.array(parentSchema).default([]),
});

const AdminGroupBulkEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [students, setStudents] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
  } = useForm({
    resolver: zodResolver(groupSchema),
    defaultValues: {
      name: '',
      location: '',
      description: '',
      studentIds: [],
      parents: [],
    },
  });

  const { fields: parentFields, append: appendParent, remove: removeParent } = useFieldArray({
    control,
    name: 'parents',
  });

  const selectedStudentIds = watch('studentIds');

  const studentOptions = useMemo(
    () =>
      students.map((student) => ({
        id: student._id,
        label: `${student.firstName} ${student.lastName}`,
        data: student,
      })),
    [students]
  );

  const loadData = async () => {
    if (!id) {
      return;
    }
    setLoading(true);
    try {
      const [groupRes, studentsRes] = await Promise.all([
        api.get(`/groups/${id}/full`),
        api.get('/students'),
      ]);

      const group = groupRes.data.data;
      const allStudents = studentsRes.data.data || [];
      setStudents(allStudents);

      const studentIds = (group.students || []).map((student) => student._id);

      const parentMap = new Map();
      (group.parents || []).forEach((parent) => {
        const email = parent.email ? parent.email.toLowerCase().trim() : '';
        if (!email) {
          return;
        }
        parentMap.set(email, {
          name: `${parent.firstName || ''} ${parent.lastName || ''}`.trim(),
          email: parent.email,
        });
      });

      (group.students || []).forEach((student) => {
        const email =
          student.parentEmail ||
          (student.parent && student.parent.email) ||
          '';
        if (!email) {
          return;
        }
        const normalizedEmail = email.toLowerCase().trim();
        if (!parentMap.has(normalizedEmail)) {
          const name =
            student.parentName ||
            `${student.parent?.firstName || ''} ${student.parent?.lastName || ''}`.trim();
          parentMap.set(normalizedEmail, {
            name: name || '',
            email,
          });
        }
      });

      const parents = Array.from(parentMap.values());

      reset({
        name: group.name || '',
        location: group.location || '',
        description: group.description || '',
        studentIds,
        parents,
      });
    } catch (error) {
      console.error('Error loading group data:', error);
      setSnackbar({
        open: true,
        message: 'Grupi andmete laadimine ebaõnnestus',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const onSubmit = async (values) => {
    if (!id) return;
    setSubmitting(true);
    try {
      await api.patch(`/groups/${id}/full`, values);
      setSnackbar({
        open: true,
        message: 'Rühm salvestatud',
        severity: 'success',
      });
      setTimeout(() => {
        navigate('/admin');
      }, 1500);
    } catch (error) {
      console.error('Error saving group:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Rühma salvestamine ebaõnnestus',
        severity: 'error',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemoveStudent = (idToRemove) => {
    setValue(
      'studentIds',
      selectedStudentIds.filter((studentId) => studentId !== idToRemove)
    );
  };

  if (loading) {
    return (
      <Box display="flex" alignItems="center" justifyContent="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      <AppHeader title="Rühma bulk-muutmine" showBackButton backTo="/admin" />

      <Container maxWidth="lg" sx={{ mt: 4, mb: 6 }}>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <Paper sx={{ p: 3, mb: 4 }}>
            <Typography variant="h5" gutterBottom>
              Rühma andmed
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Controller
                  name="name"
                  control={control}
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      label="Nimi"
                      fullWidth
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Controller
                  name="location"
                  control={control}
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      label="Asukoht"
                      fullWidth
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12}>
                <Controller
                  name="description"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Kirjeldus"
                      fullWidth
                      multiline
                      minRows={3}
                    />
                  )}
                />
              </Grid>
            </Grid>
          </Paper>

          <Paper sx={{ p: 3, mb: 4 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h5">Õpilased</Typography>
              <Typography variant="body2" color="text.secondary">
                {selectedStudentIds.length} õpilast valitud
              </Typography>
            </Box>
            <Controller
              name="studentIds"
              control={control}
              render={({ field }) => (
                <Autocomplete
                  multiple
                  options={studentOptions}
                  value={studentOptions.filter((option) => field.value.includes(option.id))}
                  onChange={(_, newValue) => field.onChange(newValue.map((option) => option.id))}
                  getOptionLabel={(option) => option.label}
                  isOptionEqualToValue={(option, value) => option.id === value.id}
                  renderInput={(params) => <TextField {...params} label="Vali õpilased" />}
                />
              )}
            />
            <Divider sx={{ mt: 3, mb: 2 }} />
            <Box display="flex" flexWrap="wrap" gap={1}>
              {selectedStudentIds.map((studentId) => {
                const option = studentOptions.find((item) => item.id === studentId);
                return (
                  <Chip
                    key={studentId}
                    label={option ? option.label : 'Tundmatu õpilane'}
                    onDelete={() => handleRemoveStudent(studentId)}
                    color="primary"
                    variant="outlined"
                  />
                );
              })}
              {!selectedStudentIds.length && (
                <Typography variant="body2" color="text.secondary">
                  Rühmas pole praegu ühtegi õpilast.
                </Typography>
              )}
            </Box>
          </Paper>

          <Paper sx={{ p: 3, mb: 4 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h5">Lapsevanemad</Typography>
              <Button
                startIcon={<Add />}
                variant="outlined"
                onClick={() => appendParent({ name: '', email: '' })}
              >
                Lisa lapsevanem
              </Button>
            </Box>
            <Grid container spacing={2}>
              {parentFields.map((parentField, index) => (
                <React.Fragment key={parentField.id}>
                  <Grid item xs={12} md={5}>
                    <Controller
                      name={`parents.${index}.name`}
                      control={control}
                      render={({ field }) => (
                        <TextField {...field} label="Nimi" fullWidth placeholder="Nt. Mari Maasikas" />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} md={5}>
                    <Controller
                      name={`parents.${index}.email`}
                      control={control}
                      render={({ field, fieldState }) => (
                        <TextField
                          {...field}
                          label="E-post"
                          type="email"
                          fullWidth
                          error={!!fieldState.error}
                          helperText={fieldState.error?.message}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} md={2} display="flex" alignItems="center">
                    <Button
                      color="error"
                      startIcon={<Delete />}
                      onClick={() => removeParent(index)}
                    >
                      Eemalda
                    </Button>
                  </Grid>
                </React.Fragment>
              ))}
              {!parentFields.length && (
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    Ühtegi lapsevanemat pole lisatud.
                  </Typography>
                </Grid>
              )}
            </Grid>
          </Paper>

          <Box display="flex" justifyContent="flex-end">
            <Button type="submit" variant="contained" disabled={submitting}>
              Salvesta rühm
            </Button>
          </Box>
        </form>
      </Container>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default AdminGroupBulkEdit;


