import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/NavBar.css';

export const Navbar: React.FC = () => {
  return (
    <nav className="ur-navbar">
      <div className="ur-nav-brand">
        BGS<span>::UR</span>
      </div>

      <div className="ur-nav-links">
        <Link to="/ur/breakdowns">Strona Główna</Link>
        <Link to="/ur/machines">Maszyny</Link>
        <Link to="/ur/all/breakdowns">Wszystkie Awarie</Link>
        <Link to="/ur/review-calendar">Przeglądy</Link>
      </div>

      <div className="ur-nav-user">
        <span>Szymon Żaba</span>
      </div>
    </nav>
  );
};