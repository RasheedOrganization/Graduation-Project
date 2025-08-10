import React from 'react';
import { Link } from 'react-router-dom';

export default function Navbar() {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  return (
    <nav style={{ display: 'flex', gap: '10px' }}>
      {!token && (
        <>
          <Link to="/login">Login</Link>
          <Link to="/signup">Signup</Link>
        </>
      )}
      {token && <Link to="/solve-problem">Problem List</Link>}
      {token && role === 'admin' && <Link to="/create-problem">Create Problem</Link>}
    </nav>
  );
}
