import React from 'react';
import { Navigate } from 'react-router-dom';

const AdminPage = () => {
  const role = localStorage.getItem('role');
  if (role !== 'admin' && role !== 'superadmin') {
    return <Navigate to="/" replace />;
  }
  return (
    <div>
      <h2>Admin Dashboard</h2>
      {role === 'superadmin' ? (
        <p>Super Admin privileges: manage admins and users.</p>
      ) : (
        <p>Admin privileges: manage users.</p>
      )}
    </div>
  );
};

export default AdminPage;
