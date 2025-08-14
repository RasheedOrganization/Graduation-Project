import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/NavBar.css';
import logo from '../assets/images/logo.svg';
import userIcon from '../assets/images/user.svg';

function NavBar() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    setLoggedIn(!!token);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setLoggedIn(false);
    setOpen(false);
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/" className="brand-link">
          <img src={logo} alt="USACO Guide logo" className="brand-logo" />
          <span className="brand-name">USACO Guide</span>
        </Link>
      </div>
      <ul className="navbar-links">
        <li><Link to="/problems">Problems</Link></li>
        <li><Link to="/resources">Resources</Link></li>
        <li><Link to="/sections">Sections</Link></li>
        <li><Link to="/contest">Contest</Link></li>
        <li><Link to="/rooms">Rooms</Link></li>
        <li><Link to="/contact">Contact Us</Link></li>
        {!loggedIn && <li><Link to="/login">Login</Link></li>}
        {loggedIn && (
          <li className="profile-container">
            <button className="profile-button" onClick={() => setOpen(!open)}>
              <img src={userIcon} alt="User avatar" className="profile-avatar" />
            </button>
            {open && (
              <ul className="profile-dropdown">
                <li>
                  <Link to="/profile" onClick={() => setOpen(false)}>
                    Profile
                  </Link>
                </li>
                <li>
                  <button onClick={handleLogout}>Log out</button>
                </li>
              </ul>
            )}
          </li>
        )}
      </ul>
    </nav>
  );
}

export default NavBar;
