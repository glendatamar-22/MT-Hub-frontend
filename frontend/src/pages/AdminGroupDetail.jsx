import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Container,
  Paper,
  Box,
  Grid,
  TextField,
  Button,
  Divider,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { ArrowBack, Edit, Delete, Add } from '@mui/icons-material';
import api from '../config/axios';

const emptyStudentForm = {
  firstName: '',
  lastName: '',
  age: '',
  parentName: '',
  parentEmail: '',
};

const AdminGroupDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [savingGroup, setSavingGroup] = useState(false);
  const [savingStudent, setSavingStudent] = useState(false);
  const [group, setGroup] = useState(null);
  const [groupForm, setGroupForm] = useState({
    name: '',
    location: '',
    description: '',
  });
  const [students, setStudents] = useState([]);
  const [studentDialogOpen, setStudentDialogOpen] = useState(false);
  const [studentForm, setStudentForm] = useState(emptyStudentForm);
  const [editingStudentId, setEditingStudentId] = useState(null);

  const studentDialogTitleId = useMemo(
    () => `student-dialog-title-${editingStudentId || 'new'}`,
    [editingStudentId]
  );

  const loadGroup = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/groups/${id}`);
      const data = response.data.data;
      setGroup(data);
      setGroupForm({
        name: data.name || '',
        location: data.location || '',
        description: data.description || '',
      });

      const sortedStudents = (data.students || []).slice().sort((a, b) => {
        const nameA = `${a.firstName} ${a.lastName}`.toLowerCase();
        const nameB = `${b.firstName} ${b.lastName}`.toLowerCase();
        return nameA.localeCompare(nameB);
      });
      setStudents(sortedStudents);
    } catch (error) {
      console.error('Error fetching group details:', error);
      alert('Grupi andmete laadimine ebaõnnestus');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      loadGroup();
    }
  }, [id]);

  const handleGroupFormChange = (key, value) => {
    setGroupForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSaveGroup = async () => {
    setSavingGroup(true);
    try {
      await api.put(`/groups/${id}`, groupForm);
      await loadGroup();
    } catch (error) {
      console.error('Error updating group:', error);
      alert('Grupi uuendamine ebaõnnestus');
    } finally {
      setSavingGroup(false);
    }
  };

  const openStudentDialog = (student = null) => {
    if (student) {
      setEditingStudentId(student._id);
      setStudentForm({
        firstName: student.firstName || '',
        lastName: student.lastName || '',
        age: student.age?.toString() || '',
        parentName:
          student.parentName ||
          `${student.parent?.firstName || ''} ${student.parent?.lastName || ''}`.trim(),
        parentEmail: student.parentEmail || student.parent?.email || '',
      });
    } else {
      setEditingStudentId(null);
      setStudentForm(emptyStudentForm);
    }
    setStudentDialogOpen(true);
  };

  const closeStudentDialog = () => {
    setStudentDialogOpen(false);
    setStudentForm(emptyStudentForm);
    setEditingStudentId(null);
  };

  const handleStudentFormChange = (key, value) => {
    setStudentForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSaveStudent = async () => {
    setSavingStudent(true);
    try {
      const ageValue = Number.parseInt(studentForm.age, 10);
      if (Number.isNaN(ageValue)) {
        alert('Palun sisestage kehtiv vanus');
        setSavingStudent(false);
        return;
      }
      if (!studentForm.parentEmail) {
        alert('Lapsevanema e-post on kohustuslik');
        setSavingStudent(false);
        return;
      }

      const payload = {
        ...studentForm,
        age: ageValue,
        parentEmail: studentForm.parentEmail.trim(),
        parentName: studentForm.parentName.trim(),
        groupId: id,
      };
      if (editingStudentId) {
        await api.put(`/students/${editingStudentId}`, payload);
      } else {
        await api.post('/students', payload);
      }
      closeStudentDialog();
      await loadGroup();
    } catch (error) {
      console.error('Error saving student:', error);
      const message = error.response?.data?.message || 'Õpilase salvestamine ebaõnnestus';
      alert(message);
    } finally {
      setSavingStudent(false);
    }
  };

  const handleDeleteStudent = async (studentId) => {
    if (!window.confirm('Kas olete kindel, et soovite selle õpilase eemaldada?')) {
      return;
    }
    try {
      await api.delete(`/students/${studentId}`);
      await loadGroup();
    } catch (error) {
      console.error('Error deleting student:', error);
      alert('Õpilase eemaldamine ebaõnnestus');
    }
  };

  if (loading) {
    return (
      <Box display="flex" alignItems="center" justifyContent="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!group) {
    return (
      <Box display="flex" alignItems="center" justifyContent="center" minHeight="100vh">
        <Typography variant="h6" color="text.secondary">
          Gruppi ei leitud
        </Typography>
      </Box>
    );
  }

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={() => navigate('/admin')} sx={{ mr: 2 }}>
            <ArrowBack />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Admin • {group.name}
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 6 }}>
        <Paper sx={{ p: 3, mb: 4 }}>
          <Typography variant="h5" gutterBottom>
            Grupi andmed
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                label="Nimi"
                value={groupForm.name}
                onChange={(e) => handleGroupFormChange('name', e.target.value)}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Asukoht"
                value={groupForm.location}
                onChange={(e) => handleGroupFormChange('location', e.target.value)}
                fullWidth
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Kirjeldus"
                value={groupForm.description}
                onChange={(e) => handleGroupFormChange('description', e.target.value)}
                fullWidth
                multiline
                rows={3}
              />
            </Grid>
          </Grid>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
            <Button
              variant="contained"
              onClick={handleSaveGroup}
              disabled={savingGroup}
            >
              Salvesta grupi andmed
            </Button>
          </Box>
        </Paper>

        <Paper sx={{ p: 3 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h5">Õpilased</Typography>
            <Button
              startIcon={<Add />}
              variant="contained"
              onClick={() => openStudentDialog()}
            >
              Lisa õpilane
            </Button>
          </Box>
          <Divider sx={{ mb: 2 }} />
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nimi</TableCell>
                <TableCell>Vanus</TableCell>
                <TableCell>Lapsevanema nimi</TableCell>
                <TableCell>Lapsevanema e-post</TableCell>
                <TableCell align="right">Tegevused</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {students.map((student) => (
                <TableRow key={student._id}>
                  <TableCell>
                    {student.firstName} {student.lastName}
                  </TableCell>
                  <TableCell>{student.age}</TableCell>
                  <TableCell>{student.parentName || '-'}</TableCell>
                  <TableCell>{student.parentEmail || student.parent?.email || '-'}</TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => openStudentDialog(student)}
                      aria-label="Muuda õpilast"
                      sx={{ mr: 1 }}
                    >
                      <Edit />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDeleteStudent(student._id)}
                      aria-label="Kustuta õpilane"
                    >
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {!students.length && (
                <TableRow>
                  <TableCell colSpan={5}>
                    <Typography variant="body2" color="text.secondary" align="center">
                      Selles grupis pole veel ühtegi õpilast.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Paper>
      </Container>

      <Dialog
        open={studentDialogOpen}
        onClose={closeStudentDialog}
        fullWidth
        maxWidth="sm"
        aria-labelledby={studentDialogTitleId}
      >
        <DialogTitle id={studentDialogTitleId}>
          {editingStudentId ? 'Muuda õpilast' : 'Lisa õpilane'}
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Eesnimi"
                value={studentForm.firstName}
                onChange={(e) => handleStudentFormChange('firstName', e.target.value)}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Perekonnanimi"
                value={studentForm.lastName}
                onChange={(e) => handleStudentFormChange('lastName', e.target.value)}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                label="Vanus"
                type="number"
                value={studentForm.age}
                onChange={(e) => handleStudentFormChange('age', e.target.value)}
                fullWidth
                inputProps={{ min: 0 }}
              />
            </Grid>
            <Grid item xs={12} sm={8}>
              <TextField
                label="Lapsevanema nimi"
                value={studentForm.parentName}
                onChange={(e) => handleStudentFormChange('parentName', e.target.value)}
                fullWidth
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Lapsevanema e-post"
                type="email"
                value={studentForm.parentEmail}
                onChange={(e) => handleStudentFormChange('parentEmail', e.target.value)}
                fullWidth
                required
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeStudentDialog}>Tühista</Button>
          <Button
            variant="contained"
            onClick={handleSaveStudent}
            disabled={savingStudent}
          >
            Salvesta
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AdminGroupDetail;


