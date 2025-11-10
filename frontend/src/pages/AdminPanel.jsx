import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Tabs,
  Tab,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  IconButton,
  AppBar,
  Toolbar,
  CircularProgress,
  Grid,
  Card,
  CardContent,
} from '@mui/material';
import {
  ArrowBack,
  Add,
  Edit,
  Delete,
  People,
  Group,
  School,
  Person,
} from '@mui/icons-material';
import api from '../config/axios';

function TabPanel({ children, value, index }) {
  return (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

const AdminPanel = () => {
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [groups, setGroups] = useState([]);
  const [users, setUsers] = useState([]);
  const [parents, setParents] = useState([]);
  const [students, setStudents] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Dialog states
  const [groupDialogOpen, setGroupDialogOpen] = useState(false);
  const [studentDialogOpen, setStudentDialogOpen] = useState(false);
  const [parentDialogOpen, setParentDialogOpen] = useState(false);
  const [userDialogOpen, setUserDialogOpen] = useState(false);

  // Form states
  const [newGroup, setNewGroup] = useState({ name: '', location: '', description: '' });
  const [newStudent, setNewStudent] = useState({
    firstName: '',
    lastName: '',
    age: '',
    groupId: '',
    parentId: '',
  });
  const [newParent, setNewParent] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  });
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: 'teacher',
    assignedGroups: [],
  });

  useEffect(() => {
    fetchData();
  }, [tabValue]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (tabValue === 0) {
        const [groupsRes, statsRes] = await Promise.all([
          api.get('/api/groups'),
          api.get('/api/admin/stats'),
        ]);
        setGroups(groupsRes.data.data);
        setStats(statsRes.data.data);
      } else if (tabValue === 1) {
        const response = await api.get('/api/admin/users');
        setUsers(response.data.data);
      } else if (tabValue === 2) {
        const response = await api.get('/api/students');
        setStudents(response.data.data);
      } else if (tabValue === 3) {
        const response = await api.get('/api/admin/parents');
        setParents(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGroup = async () => {
    try {
      await api.post('/api/groups', newGroup);
      setGroupDialogOpen(false);
      setNewGroup({ name: '', location: '', description: '' });
      fetchData();
    } catch (error) {
      console.error('Error creating group:', error);
      alert('Viga grupi loomisel');
    }
  };

  const handleCreateStudent = async () => {
    try {
      await api.post('/api/students', {
        firstName: newStudent.firstName,
        lastName: newStudent.lastName,
        age: parseInt(newStudent.age),
        groupId: newStudent.groupId,
        parentId: newStudent.parentId,
      });
      setStudentDialogOpen(false);
      setNewStudent({ firstName: '', lastName: '', age: '', groupId: '', parentId: '' });
      fetchData();
    } catch (error) {
      console.error('Error creating student:', error);
      alert('Viga õpilase loomisel');
    }
  };

  const handleCreateParent = async () => {
    try {
      await api.post('/api/admin/parents', newParent);
      setParentDialogOpen(false);
      setNewParent({ firstName: '', lastName: '', email: '', phone: '' });
      fetchData();
    } catch (error) {
      console.error('Error creating parent:', error);
      alert('Viga lapsevanema loomisel');
    }
  };

  const handleCreateUser = async () => {
    try {
      await api.post('/auth/register', newUser);
      setUserDialogOpen(false);
      setNewUser({ name: '', email: '', password: '', role: 'teacher', assignedGroups: [] });
      fetchData();
    } catch (error) {
      console.error('Error creating user:', error);
      alert('Viga kasutaja loomisel');
    }
  };

  const handleDeleteGroup = async (id) => {
    if (window.confirm('Kas olete kindel, et soovite selle grupi kustutada?')) {
      try {
        await api.delete(`/api/groups/${id}`);
        fetchData();
      } catch (error) {
        console.error('Error deleting group:', error);
        alert('Viga grupi kustutamisel');
      }
    }
  };

  const handleDeleteStudent = async (id) => {
    if (window.confirm('Kas olete kindel, et soovite selle õpilase kustutada?')) {
      try {
        await api.delete(`/api/students/${id}`);
        fetchData();
      } catch (error) {
        console.error('Error deleting student:', error);
        alert('Viga õpilase kustutamisel');
      }
    }
  };

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={() => navigate('/')} sx={{ mr: 2 }}>
            <ArrowBack />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Admin Paneel
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {stats && (
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography color="text.secondary" gutterBottom>
                    Grupid
                  </Typography>
                  <Typography variant="h4">{stats.totalGroups}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography color="text.secondary" gutterBottom>
                    Õpilased
                  </Typography>
                  <Typography variant="h4">{stats.totalStudents}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography color="text.secondary" gutterBottom>
                    Lapsevanemad
                  </Typography>
                  <Typography variant="h4">{stats.totalParents}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography color="text.secondary" gutterBottom>
                    Õpetajad
                  </Typography>
                  <Typography variant="h4">{stats.totalTeachers}</Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        <Paper>
          <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
            <Tab label="Grupid" icon={<Group />} iconPosition="start" />
            <Tab label="Kasutajad" icon={<People />} iconPosition="start" />
            <Tab label="Õpilased" icon={<School />} iconPosition="start" />
            <Tab label="Lapsevanemad" icon={<Person />} iconPosition="start" />
          </Tabs>

          <TabPanel value={tabValue} index={0}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
              <Button variant="contained" startIcon={<Add />} onClick={() => setGroupDialogOpen(true)}>
                Lisa grupp
              </Button>
            </Box>
            {loading ? (
              <CircularProgress />
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Nimi</TableCell>
                      <TableCell>Asukoht</TableCell>
                      <TableCell>Õpilasi</TableCell>
                      <TableCell>Tegevused</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {groups.map((group) => (
                      <TableRow key={group._id}>
                        <TableCell>{group.name}</TableCell>
                        <TableCell>{group.location}</TableCell>
                        <TableCell>{group.studentCount || 0}</TableCell>
                        <TableCell>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDeleteGroup(group._id)}
                          >
                            <Delete />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
              <Button variant="contained" startIcon={<Add />} onClick={() => setUserDialogOpen(true)}>
                Lisa kasutaja
              </Button>
            </Box>
            {loading ? (
              <CircularProgress />
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Nimi</TableCell>
                      <TableCell>E-post</TableCell>
                      <TableCell>Roll</TableCell>
                      <TableCell>Määratud grupid</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user._id}>
                        <TableCell>{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Chip label={user.role} color={user.role === 'admin' ? 'primary' : 'default'} />
                        </TableCell>
                        <TableCell>{user.assignedGroups?.length || 0}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
              <Button variant="contained" startIcon={<Add />} onClick={() => setStudentDialogOpen(true)}>
                Lisa õpilane
              </Button>
            </Box>
            {loading ? (
              <CircularProgress />
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Nimi</TableCell>
                      <TableCell>Vanus</TableCell>
                      <TableCell>Grupp</TableCell>
                      <TableCell>Lapsevanem</TableCell>
                      <TableCell>Tegevused</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {students.map((student) => (
                      <TableRow key={student._id}>
                        <TableCell>
                          {student.firstName} {student.lastName}
                        </TableCell>
                        <TableCell>{student.age}</TableCell>
                        <TableCell>{student.group?.name}</TableCell>
                        <TableCell>{student.parent?.email}</TableCell>
                        <TableCell>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDeleteStudent(student._id)}
                          >
                            <Delete />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </TabPanel>

          <TabPanel value={tabValue} index={3}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
              <Button variant="contained" startIcon={<Add />} onClick={() => setParentDialogOpen(true)}>
                Lisa lapsevanem
              </Button>
            </Box>
            {loading ? (
              <CircularProgress />
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Nimi</TableCell>
                      <TableCell>E-post</TableCell>
                      <TableCell>Telefon</TableCell>
                      <TableCell>Õpilasi</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {parents.map((parent) => (
                      <TableRow key={parent._id}>
                        <TableCell>
                          {parent.firstName} {parent.lastName}
                        </TableCell>
                        <TableCell>{parent.email}</TableCell>
                        <TableCell>{parent.phone}</TableCell>
                        <TableCell>{parent.students?.length || 0}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </TabPanel>
        </Paper>
      </Container>

      {/* Group Dialog */}
      <Dialog open={groupDialogOpen} onClose={() => setGroupDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Lisa grupp</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Nimi"
            value={newGroup.name}
            onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Asukoht"
            value={newGroup.location}
            onChange={(e) => setNewGroup({ ...newGroup, location: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Kirjeldus"
            multiline
            rows={3}
            value={newGroup.description}
            onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setGroupDialogOpen(false)}>Tühista</Button>
          <Button onClick={handleCreateGroup} variant="contained">
            Lisa
          </Button>
        </DialogActions>
      </Dialog>

      {/* Student Dialog */}
      <Dialog open={studentDialogOpen} onClose={() => setStudentDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Lisa õpilane</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Eesnimi"
            value={newStudent.firstName}
            onChange={(e) => setNewStudent({ ...newStudent, firstName: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Perekonnanimi"
            value={newStudent.lastName}
            onChange={(e) => setNewStudent({ ...newStudent, lastName: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Vanus"
            type="number"
            value={newStudent.age}
            onChange={(e) => setNewStudent({ ...newStudent, age: e.target.value })}
            margin="normal"
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Grupp</InputLabel>
            <Select
              value={newStudent.groupId}
              onChange={(e) => setNewStudent({ ...newStudent, groupId: e.target.value })}
            >
              {groups.map((group) => (
                <MenuItem key={group._id} value={group._id}>
                  {group.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth margin="normal">
            <InputLabel>Lapsevanem</InputLabel>
            <Select
              value={newStudent.parentId}
              onChange={(e) => setNewStudent({ ...newStudent, parentId: e.target.value })}
            >
              {parents.map((parent) => (
                <MenuItem key={parent._id} value={parent._id}>
                  {parent.firstName} {parent.lastName} ({parent.email})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStudentDialogOpen(false)}>Tühista</Button>
          <Button onClick={handleCreateStudent} variant="contained">
            Lisa
          </Button>
        </DialogActions>
      </Dialog>

      {/* Parent Dialog */}
      <Dialog open={parentDialogOpen} onClose={() => setParentDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Lisa lapsevanem</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Eesnimi"
            value={newParent.firstName}
            onChange={(e) => setNewParent({ ...newParent, firstName: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Perekonnanimi"
            value={newParent.lastName}
            onChange={(e) => setNewParent({ ...newParent, lastName: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="E-post"
            type="email"
            value={newParent.email}
            onChange={(e) => setNewParent({ ...newParent, email: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Telefon"
            value={newParent.phone}
            onChange={(e) => setNewParent({ ...newParent, phone: e.target.value })}
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setParentDialogOpen(false)}>Tühista</Button>
          <Button onClick={handleCreateParent} variant="contained">
            Lisa
          </Button>
        </DialogActions>
      </Dialog>

      {/* User Dialog */}
      <Dialog open={userDialogOpen} onClose={() => setUserDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Lisa kasutaja</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Nimi"
            value={newUser.name}
            onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="E-post"
            type="email"
            value={newUser.email}
            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Parool"
            type="password"
            value={newUser.password}
            onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
            margin="normal"
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Roll</InputLabel>
            <Select
              value={newUser.role}
              onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
            >
              <MenuItem value="teacher">Õpetaja</MenuItem>
              <MenuItem value="admin">Admin</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUserDialogOpen(false)}>Tühista</Button>
          <Button onClick={handleCreateUser} variant="contained">
            Lisa
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AdminPanel;

