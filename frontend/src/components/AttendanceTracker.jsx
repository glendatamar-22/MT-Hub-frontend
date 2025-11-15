import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  CircularProgress,
  Button,
  Chip,
  Alert,
} from '@mui/material';
import { Download, CheckCircle, Cancel } from '@mui/icons-material';
import dayjs from 'dayjs';
import api from '../config/axios';

const AttendanceTracker = ({ groupId }) => {
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(dayjs().format('YYYY-MM'));
  const [attendanceData, setAttendanceData] = useState(null);
  const [schedules, setSchedules] = useState([]);

  const months = [
    { value: '2025-09', label: 'September 2025' },
    { value: '2025-10', label: 'Oktoober 2025' },
    { value: '2025-11', label: 'November 2025' },
    { value: '2025-12', label: 'Detsember 2025' },
    { value: '2026-01', label: 'Jaanuar 2026' },
    { value: '2026-02', label: 'Veebruar 2026' },
    { value: '2026-03', label: 'Märts 2026' },
    { value: '2026-04', label: 'Aprill 2026' },
    { value: '2026-05', label: 'Mai 2026' },
  ];

  useEffect(() => {
    fetchAttendance();
  }, [selectedMonth, groupId]);

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const startDate = dayjs(selectedMonth).startOf('month').format('YYYY-MM-DD');
      const endDate = dayjs(selectedMonth).endOf('month').format('YYYY-MM-DD');

      const response = await api.get(
        `/schedules/group/${groupId}/attendance?startDate=${startDate}&endDate=${endDate}`
      );

      setAttendanceData(response.data.data.attendanceByStudent);
      setSchedules(response.data.data.schedules);
    } catch (error) {
      console.error('Error fetching attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleAttendance = async (scheduleId, studentId, currentStatus) => {
    try {
      await api.post(`/schedules/${scheduleId}/attendance`, {
        studentId,
        present: !currentStatus,
      });
      fetchAttendance(); // Refresh data
    } catch (error) {
      console.error('Error toggling attendance:', error);
    }
  };

  const exportCSV = () => {
    if (!attendanceData || attendanceData.length === 0) return;

    const BOM = '\uFEFF';
    let csv = BOM + 'Õpilane,E-post,Lapsevanem,Kuu,Osalenud,Kokku trenne,Protsent\n';

    attendanceData.forEach((item) => {
      const studentName = `${item.student.firstName} ${item.student.lastName}`;
      const parentEmail = item.student.parentEmail || item.student.parent?.email || '';
      const parentName = item.student.parentName || 
        (item.student.parent ? `${item.student.parent.firstName || ''} ${item.student.parent.lastName || ''}`.trim() : '');
      const month = dayjs(selectedMonth).format('MMMM YYYY');
      const percentage = item.totalLessons > 0 
        ? Math.round((item.attended / item.totalLessons) * 100) 
        : 0;

      const escapeCSV = (str) => {
        if (!str) return '';
        const s = String(str);
        if (s.includes(',') || s.includes('"') || s.includes('\n')) {
          return `"${s.replace(/"/g, '""')}"`;
        }
        return s;
      };

      csv += [
        escapeCSV(studentName),
        escapeCSV(parentEmail),
        escapeCSV(parentName),
        escapeCSV(month),
        item.attended,
        item.totalLessons,
        `${percentage}%`,
      ].join(',') + '\n';
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `kohalolek_${selectedMonth}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  };

  const getAttendanceStatus = (studentId, scheduleId) => {
    if (!attendanceData) return false;
    
    const studentData = attendanceData.find(
      (item) => item.student._id === studentId
    );
    
    if (!studentData) return false;
    
    const record = studentData.records.find(
      (r) => r.schedule._id === scheduleId
    );
    
    return record ? record.present : false;
  };

  const getAttendancePercentage = (attended, total) => {
    if (total === 0) return 0;
    return Math.round((attended / total) * 100);
  };

  const getPercentageColor = (percentage) => {
    if (percentage >= 90) return 'success';
    if (percentage >= 70) return 'warning';
    return 'error';
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">Kohalolek</Typography>
          <Box display="flex" gap={2} alignItems="center">
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel>Kuu</InputLabel>
              <Select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                label="Kuu"
              >
                {months.map((month) => (
                  <MenuItem key={month.value} value={month.value}>
                    {month.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button
              variant="outlined"
              startIcon={<Download />}
              onClick={exportCSV}
              disabled={!attendanceData || attendanceData.length === 0}
            >
              Ekspordi CSV
            </Button>
          </Box>
        </Box>

        {schedules.length === 0 ? (
          <Alert severity="info">
            Sellel kuul pole veel trenne planeeritud.
          </Alert>
        ) : (
          <TableContainer sx={{ maxHeight: 600 }}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold', minWidth: 150 }}>
                    Õpilane
                  </TableCell>
                  {schedules.map((schedule) => (
                    <TableCell
                      key={schedule._id}
                      align="center"
                      sx={{ fontWeight: 'bold', minWidth: 80 }}
                    >
                      {dayjs(schedule.date).format('DD.MM')}
                    </TableCell>
                  ))}
                  <TableCell align="center" sx={{ fontWeight: 'bold', minWidth: 100 }}>
                    Kokku
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold', minWidth: 100 }}>
                    %
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {attendanceData && attendanceData.map((item) => {
                  const percentage = getAttendancePercentage(item.attended, item.totalLessons);
                  
                  return (
                    <TableRow key={item.student._id} hover>
                      <TableCell>
                        {item.student.firstName} {item.student.lastName}
                      </TableCell>
                      {schedules.map((schedule) => {
                        const isPresent = getAttendanceStatus(item.student._id, schedule._id);
                        return (
                          <TableCell key={schedule._id} align="center">
                            <Checkbox
                              checked={isPresent}
                              onChange={() =>
                                toggleAttendance(schedule._id, item.student._id, isPresent)
                              }
                              icon={<Cancel color="error" />}
                              checkedIcon={<CheckCircle color="success" />}
                            />
                          </TableCell>
                        );
                      })}
                      <TableCell align="center">
                        <Typography variant="body2" fontWeight="bold">
                          {item.attended}/{item.totalLessons}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={`${percentage}%`}
                          color={getPercentageColor(percentage)}
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
    </Box>
  );
};

export default AttendanceTracker;

