import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserCircle, Users, LogOut } from 'lucide-react';
import { NavLinks } from './NavLinks';

const Navbar: React.FC = () => {
  const { isAuthenticated, logout } = useAuth();

  return (
    <nav className="bg-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="text-xl font-bold text-indigo-600">
            MentorMatch
          </Link>
          <NavLinks isAuthenticated={isAuthenticated} onLogout={logout} />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;