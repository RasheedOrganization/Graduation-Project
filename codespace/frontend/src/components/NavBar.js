import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import AccountCircle from '@mui/icons-material/AccountCircle';
import Logout from '@mui/icons-material/Logout';
import '../styles/NavBar.css';
import logo from '../assets/images/logo.svg';
import userIcon from '../assets/images/user.svg';
import BACKEND_URL from '../config';

function NavBar() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [role, setRole] = useState(null);
  const [userId, setUserId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoggedIn(false);
      setRole(null);
      return;
    }

    fetch(`${BACKEND_URL}/api/auth/verify`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error('Not authenticated');
        return res.json();
      })
      .then((data) => {
        setLoggedIn(true);
        setRole(data.role);
        setUserId(data.id);
      })
      .catch(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        setLoggedIn(false);
        setRole(null);
      });
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token || !searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    fetch(`${BACKEND_URL}/api/users/search?username=${searchQuery}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error('Error');
        return res.json();
      })
      .then((data) => setSearchResults(data))
      .catch(() => setSearchResults([]));
  }, [searchQuery]);

  const handleToggleFriend = (user) => {
    const token = localStorage.getItem('token');
    if (!token || !userId) return;
    fetch(`${BACKEND_URL}/api/users/${userId}/friends/${user.id}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setSearchResults((prev) =>
          prev.map((u) =>
            u.id === user.id ? { ...u, isFriend: data.isFriend } : u
          )
        );
      });
  };

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    setRole(null);
    setLoggedIn(false);
    handleClose();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/" className="brand-link">
          <img src={logo} alt="Code Hub logo" className="brand-logo" />
          <span className="brand-name">Code Hub</span>
        </Link>
      </div>
      <div className="navbar-search">
        <input
          type="text"
          placeholder="Search users"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchResults.length > 0 && (
          <div className="navbar-search-results">
            <table>
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Add Friend</th>
                </tr>
              </thead>
              <tbody>
                {searchResults.map((user) => (
                  <tr key={user.id}>
                    <td>{user.username}</td>
                    <td>
                      <button onClick={() => handleToggleFriend(user)}>
                        {user.isFriend ? 'Remove' : 'Add'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <ul className="navbar-links">
        <li><Link to="/problems">Problems</Link></li>
        <li><Link to="/resources">Resources</Link></li>
        <li><Link to="/sections">Sections</Link></li>
        <li><Link to="/contests">Contests</Link></li>
        <li><Link to="/rooms">Rooms</Link></li>
        <li><Link to="/contact">Contact Us</Link></li>
        {(role === 'admin' || role === 'superadmin') && <li><Link to="/admin">Admin</Link></li>}
        {!loggedIn && <li><Link to="/login">Login</Link></li>}
        {loggedIn && (
          <li className="profile-container">
            <button className="profile-button" onClick={handleMenu}>
              <img src={userIcon} alt="User avatar" className="profile-avatar" />
            </button>
            <Menu
              anchorEl={anchorEl}
              open={open}
              onClose={handleClose}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
              <MenuItem component={Link} to="/profile" onClick={handleClose}>
                <ListItemIcon>
                  <AccountCircle fontSize="small" />
                </ListItemIcon>
                Profile
              </MenuItem>
              <MenuItem onClick={handleLogout}>
                <ListItemIcon>
                  <Logout fontSize="small" />
                </ListItemIcon>
                Log out
              </MenuItem>
            </Menu>
          </li>
        )}
      </ul>
    </nav>
  );
}

export default NavBar;
