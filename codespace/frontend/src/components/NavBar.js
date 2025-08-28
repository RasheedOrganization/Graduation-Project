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

function NavBar() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    setLoggedIn(!!token);
  }, []);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
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
      <ul className="navbar-links">
        <li><Link to="/problems">Problems</Link></li>
        <li><Link to="/resources">Resources</Link></li>
        <li><Link to="/sections">Sections</Link></li>
        <li><Link to="/contests">Contests</Link></li>
        <li><Link to="/rooms">Rooms</Link></li>
        <li><Link to="/contact">Contact Us</Link></li>
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
