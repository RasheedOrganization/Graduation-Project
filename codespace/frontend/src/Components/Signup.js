import React, { useState } from 'react';
import axios from 'axios';

const api = `${process.env.REACT_APP_BACKEND_URL}/auth/register`;

export default function Signup() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(api, { username, email, password });
      // after signup, maybe redirect to login or show message
      alert('Signup successful');
    } catch (err) {
      console.error('Signup failed');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Signup</h2>
      <input placeholder="Username" value={username} onChange={(e)=>setUsername(e.target.value)} />
      <input placeholder="Email" value={email} onChange={(e)=>setEmail(e.target.value)} />
      <input type="password" placeholder="Password" value={password} onChange={(e)=>setPassword(e.target.value)} />
      <button type="submit">Signup</button>
    </form>
  );
}
