import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const NavLink: React.FC<{ to: string; children: React.ReactNode }> = ({ to, children }) => {
  const location = useLocation();
  const isActive = location.pathname === to || location.pathname.startsWith(`${to}/`);
  
  return (
    <Link
      to={to}
      className={`block px-4 py-2 rounded mb-1 ${
        isActive ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-800'
      }`}
    >
      {children}
    </Link>
  );
};

export const Sidebar: React.FC = () => {
  return (
    <div className="w-64 bg-gray-900 text-white h-screen flex flex-col">
      <div className="p-4 text-xl font-bold border-b border-gray-800">
        DataFlow Control
      </div>
      <nav className="flex-1 p-4">
        <NavLink to="/">Dashboard</NavLink>
        <NavLink to="/jobs">Jobs</NavLink>
        <NavLink to="/pipelines">Pipelines</NavLink>
      </nav>
      <div className="p-4 border-t border-gray-800 text-sm text-gray-500">
        v0.1.0
      </div>
    </div>
  );
};
