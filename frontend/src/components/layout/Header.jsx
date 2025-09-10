// src/components/layout/Header.jsx (updated)
import React from 'react';
import { Link } from 'react-router-dom';
import LoginButton from '../auth/LoginButton';
import LogoutButton from '../auth/LogoutButton';
import { useAuth } from '../../hooks/useAuth';

export default function Header() {
  const { user } = useAuth();

  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="text-xl font-bold text-primary">AI Resume Screener</Link>
            </div>
          </div>
          <div className="flex items-center">
            {user ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-700">Welcome, {user.email}</span>
                <LogoutButton />
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link to="/login" className="text-sm font-medium text-gray-700 hover:text-primary">
                  Sign In
                </Link>
                <Link to="/signup">
                  <button className="bg-primary text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-primary/90">
                    Sign Up
                  </button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}