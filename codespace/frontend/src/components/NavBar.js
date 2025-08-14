import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/NavBar.css';
import logo from '../assets/images/logo.svg';

function NavBar() {
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
        <li><Link to="/login">Login</Link></li>
      </ul>
    </nav>
  );
}

export default NavBar;
