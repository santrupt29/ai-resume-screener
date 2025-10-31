import React from 'react';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import LoginButton from '../auth/LoginButton';
import LogoutButton from '../auth/LogoutButton';
import { useAuth } from '../../hooks/useAuth';
import {supabase, supabaseServer} from '../../lib/supabase';
import { Sparkles, User, LogOut, Menu, X, ChevronDown } from 'lucide-react';

const BrandLogo = () => (
  <img src='logo.svg' alt="HireLyze Logo" width={32} height={32} className="mr-2 fill-primary" />
);

export default function Header() {
  const { user } = useAuth();
  const [name, setName] = useState(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  useEffect(() => {
    if (user?.id) {
      supabaseServer
        .from('profiles')
        .select('name')
        .eq('id', user.id)
        .single()
        .then(({ data, error }) => {
          if (data?.name) setName(data.name);
        });
    }
  }, [user]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
    <header className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
      isScrolled 
        ? 'bg-white/95 backdrop-blur-lg shadow-xl' 
        : 'bg-white shadow-md'
    }`}>
      {/* Animated gradient accent bar */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" 
             style={{
               backgroundSize: '200% 100%',
               animation: 'shimmer 3s infinite linear'
             }} />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo and branding */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center group focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 rounded-lg px-2 py-1 -ml-2">
              <BrandLogo />
              <div className="ml-3 flex flex-col">
                <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent group-hover:from-indigo-700 group-hover:via-purple-700 group-hover:to-pink-700 transition-all">
                  HireLyze
                </span>
                <span className="text-xs text-gray-500 font-medium tracking-wide">
                  {/* Powered by Intelligence */}
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-3">
            {user ? (
              <>
                {/* User info with dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-gradient-to-br from-gray-50 to-slate-50 hover:from-gray-100 hover:to-slate-100 border border-gray-200 hover:border-gray-300 transition-all group"
                  >
                    <div className="flex items-center justify-center w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 shadow-md group-hover:shadow-lg transition-shadow">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <div className="hidden lg:block text-left">
                      <p className="text-sm font-semibold text-gray-900">
                        {name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {user.email}
                      </p>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Dropdown menu */}
                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border border-gray-100 py-2 animate-in fade-in slide-in-from-top-2">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{user.email}</p>
                      </div>
                      <Link to="/dashboard" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors">
                        <User className="w-4 h-4" />
                        Dashboard
                      </Link>
                      <button
                      onClick={async() => {await supabase.auth.signOut()}}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-5 py-2.5 text-sm font-semibold text-gray-700 hover:text-indigo-700 transition-colors rounded-lg hover:bg-gray-50"
                >
                  Sign In
                </Link>
                <Link to="/signup">
                  <button className="group relative px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl text-sm font-bold shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95 overflow-hidden">
                    <span className="absolute inset-0 bg-gradient-to-r from-indigo-700 to-purple-700 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <span className="relative flex items-center gap-2">
                      Get Started
                      <Sparkles className="w-4 h-4" />
                    </span>
                  </button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white/95 backdrop-blur-lg animate-in slide-in-from-top">
          <div className="px-4 py-6 space-y-4">
            {user ? (
              <>
                <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border border-indigo-100">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 shadow-md">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                    <p className="text-xs text-gray-600">{user.email}</p>
                  </div>
                </div>
                <Link
                  to="/dashboard"
                  className="block px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  Dashboard
                </Link>
                <button
                  onClick={async() => {await supabase.auth.signOut()}}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="block px-4 py-3 text-center text-sm font-semibold text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Sign In
                </Link>
                <Link to="/signup">
                  <button className="w-full px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl text-sm font-bold shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95">
                    <span className="flex items-center justify-center gap-2">
                      Get Started
                      <Sparkles className="w-4 h-4" />
                    </span>
                  </button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
    </>
  );
}
