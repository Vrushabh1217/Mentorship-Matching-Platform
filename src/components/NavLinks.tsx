import React from 'react';
import { Link } from 'react-router-dom';
import { UserCircle, Users, LogOut } from 'lucide-react';

interface NavLinksProps {
  isAuthenticated: boolean;
  onLogout: () => void;
}

export const NavLinks: React.FC<NavLinksProps> = ({ isAuthenticated, onLogout }) => {
  if (isAuthenticated) {
    return (
      <div className="flex items-center space-x-4">
        <Link to="/discovery" className="flex items-center text-gray-700 hover:text-indigo-600">
          <Users className="w-5 h-5 mr-1" />
          <span>Discover</span>
        </Link>
        <Link to="/profile" className="flex items-center text-gray-700 hover:text-indigo-600">
          <UserCircle className="w-5 h-5 mr-1" />
          <span>Profile</span>
        </Link>
        <button
          onClick={onLogout}
          className="flex items-center text-gray-700 hover:text-indigo-600"
        >
          <LogOut className="w-5 h-5 mr-1" />
          <span>Logout</span>
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-4">
      <Link to="/login" className="text-gray-700 hover:text-indigo-600">
        Login
      </Link>
      <Link to="/register" className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">
        Register
      </Link>
    </div>
  );
};