// src/pages/SignUpPage.jsx (Updated)

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../lib/ToastContext';
import Card, { CardContent, CardDescription, CardHeader, CardTitle } from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import { supabase } from '../lib/supabase';

export default function SignUpPage() {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [signUpForm, setSignUpForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignUpChange = (e) => {
    const { name, value } = e.target;
    setSignUpForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSignUpSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    // Validate passwords match
    if (signUpForm.password !== signUpForm.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }
    
    // Validate password strength
    if (signUpForm.password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }
    
    try {
      const result = await signUp(signUpForm.email, signUpForm.password, signUpForm.name);
      
      if (result && result.user) {
        if (!result.user.email_confirmed_at && result.user.identities?.length === 0) {
          addToast('Sign up successful! Please check your email to verify your account.', 'success');
          navigate('/login');
        } else {
          addToast('Sign up successful! You can now sign in.', 'success');
          navigate('/login');
        }
      } else {
        throw new Error('Failed to create account - no user data returned');
      }
    } catch (err) {
      console.error('Sign up error:', err);
      
      // Handle specific error messages
      if (err.message?.includes('already registered')) {
        setError('An account with this email already exists. Please sign in instead.');
        addToast('An account with this email already exists. Please sign in instead.', 'error');
      } else if (err.message?.includes('password')) {
        setError('Password is too weak. Please use a stronger password.');
        addToast('Password is too weak. Please use a stronger password.', 'error');
      } else {
        setError(err.message || 'Failed to create account. Please try again.');
        addToast(err.message || 'Sign up failed. Please try again.', 'error');
      }
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-gray-900">Create your account</h1>
          <p className="mt-2 text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-primary hover:text-primary/80">
              Sign in
            </Link>
          </p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Sign Up</CardTitle>
            <CardDescription>
              Create a new recruiter account to get started
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignUpSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-1">
                  Full Name
                </label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={signUpForm.name}
                  onChange={handleSignUpChange}
                  required
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-1">
                  Email address
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  value={signUpForm.email}
                  onChange={handleSignUpChange}
                  required
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium mb-1">
                  Password
                </label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Create a password"
                  value={signUpForm.password}
                  onChange={handleSignUpChange}
                  required
                />
              </div>
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium mb-1">
                  Confirm Password
                </label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  value={signUpForm.confirmPassword}
                  onChange={handleSignUpChange}
                  required
                />
              </div>
              {error && (
                <div className="text-red-500 text-sm">{error}</div>
              )}
              <div className="flex items-center">
                <input
                  id="agree-terms"
                  name="agree-terms"
                  type="checkbox"
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                  required
                />
                <label htmlFor="agree-terms" className="ml-2 block text-sm text-gray-900">
                  I agree to the{' '}
                  <Link to="/terms" className="text-primary hover:text-primary/80">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link to="/privacy" className="text-primary hover:text-primary/80">
                    Privacy Policy
                  </Link>
                </label>
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={loading}
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}