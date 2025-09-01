import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import axios from 'axios';
import NavBar from '../components/NavBar';
import BACKEND_URL from '../config';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Select,
  MenuItem
} from '@mui/material';
import '../styles/AdminPage.css';

const AdminPage = () => {
  const role = localStorage.getItem('role');
  const token = localStorage.getItem('token');
  const [users, setUsers] = useState([]);

  useEffect(() => {
    if (role === 'admin' || role === 'superadmin') {
      axios
        .get(`${BACKEND_URL}/api/admin/users`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        .then((res) => setUsers(res.data))
        .catch((err) => console.error(err));
    }
  }, [role, token]);

  const handleRoleChange = (id, newRole) => {
    axios
      .patch(
        `${BACKEND_URL}/api/admin/users/${id}`,
        { role: newRole },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then(() => {
        setUsers((prev) =>
          prev.map((u) => (u._id === id ? { ...u, role: newRole } : u))
        );
      })
      .catch((err) => console.error(err));
  };

  if (role !== 'admin' && role !== 'superadmin') {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="admin-container">
      <NavBar />
      <div className="admin-content">
        <h2>Admin Dashboard</h2>
        <TableContainer component={Paper} className="admin-table">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Username</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Role</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user._id}>
                  <TableCell>{user.username}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    {(role === 'admin' && user.role === 'superadmin') ? (
                      user.role
                    ) : (
                      <Select
                        size="small"
                        value={user.role}
                        onChange={(e) => handleRoleChange(user._id, e.target.value)}
                      >
                        <MenuItem value="user">user</MenuItem>
                        <MenuItem value="admin">admin</MenuItem>
                        {role === 'superadmin' && (
                          <MenuItem value="superadmin">superadmin</MenuItem>
                        )}
                      </Select>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </div>
    </div>
  );
};

export default AdminPage;

