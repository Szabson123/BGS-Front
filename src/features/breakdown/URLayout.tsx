import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './views/NavBar';

export const URLayout: React.FC = () => {
  return (
    <div>
      <Navbar />
      <main>
        <Outlet /> 
      </main>
    </div>
  );
};