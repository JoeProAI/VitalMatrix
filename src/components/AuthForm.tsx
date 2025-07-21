import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Mail, Lock, Eye, EyeOff, User, ArrowRight, AlertCircle } from 'lucide-react';

interface AuthFormProps {
  mode: 'login' | 'signup';
}

export const AuthForm: React.FC<AuthFormProps> = ({ mode }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { signup, login, loginWithGoogle, currentUser } = useAuth();
  const navigate = useNavigate();

  // Redirect if user is already authenticated
  useEffect(() => {
    if (currentUser) {
      console.log('🔄 User already authenticated, redirecting to dashboard');
      navigate('/dashboard');
    }
  }, [currentUser, navigate]);

  // Force dark mode for auth pages
  useEffect(() => {
    const htmlElement = document.documentElement;
    const originalClass = htmlElement.className;
    
    // Add dark class if not already present
    if (!htmlElement.classList.contains('dark')) {
      htmlElement.classList.add('dark');
    }
    
    // Cleanup: restore original classes when component unmounts
    return () => {
      // Only remove dark class if it wasn't there originally
      if (!originalClass.includes('dark')) {
        htmlElement.classList.remove('dark');
      }
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (mode === 'signup' && password !== confirmPassword) {
      return setError('Passwords do not match');
    }

    if (password.length < 6) {
      return setError('Password must be at least 6 characters');
    }

    try {
      setError('');
      setLoading(true);
      
      if (mode === 'signup') {
        await signup(email, password);
      } else {
        await login(email, password);
      }
      
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Auth error:', error);
      
      // Handle specific Firebase auth errors
      switch (error.code) {
        case 'auth/email-already-in-use':
          setError('An account with this email already exists. Please try logging in instead.');
          // Auto-suggest switching to login mode
          setTimeout(() => {
            if (mode === 'signup') {
              navigate('/login');
            }
          }, 3000);
          break;
        case 'auth/weak-password':
          setError('Password is too weak');
          break;
        case 'auth/invalid-email':
          setError('Invalid email address');
          break;
        case 'auth/user-not-found':
          setError('No account found with this email');
          break;
        case 'auth/wrong-password':
          setError('Incorrect password');
          break;
        case 'auth/too-many-requests':
          setError('Too many failed attempts. Please try again later');
          break;
        default:
          setError('An error occurred. Please try again');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setError('');
      setLoading(true);
      await loginWithGoogle();
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Google Sign-In error:', error);
      setError(error.message || 'Failed to sign in with Google');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-pearl dark:bg-midnight flex items-center justify-center px-6 py-12">
      {/* Background elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-40 dark:opacity-20" />
        <div className="absolute top-32 left-16 w-64 h-32 bg-ocean/5 dark:bg-ocean/10 transform rotate-12 animate-float-slow" />
        <div className="absolute top-64 right-24 w-48 h-48 bg-coral/5 dark:bg-coral/10 transform -rotate-6 animate-float-slow" style={{ animationDelay: '2s' }} />
      </div>

      <div className="relative w-full max-w-md">
        <div className="bg-pearl dark:bg-slate-blue border-l-4 border-ocean shadow-2xl transform hover:scale-[1.02] transition-all duration-300" style={{ clipPath: 'polygon(0 0, calc(100% - 20px) 0, 100% 100%, 0 100%)' }}>
          <div className="p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="flex items-center justify-center mb-4">
                <svg width="48" height="24" viewBox="0 0 48 24">
                  <defs>
                    <linearGradient id="authHeartbeatGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#2b6cb0" />
                      <stop offset="50%" stopColor="#3182ce" />
                      <stop offset="100%" stopColor="#d69e2e" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M0 12 L8 12 L10 8 L12 16 L14 4 L16 20 L18 12 L48 12"
                    stroke="url(#authHeartbeatGradient)"
                    strokeWidth="2.5"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="animate-pulse drop-shadow-sm"
                  />
                </svg>
              </div>
              <h1 className="text-2xl font-display font-bold text-midnight dark:text-pearl mb-2">
                {mode === 'login' ? 'Welcome Back' : 'Join VitalMatrix'}
              </h1>
              <p className="text-steel dark:text-mist">
                {mode === 'login' 
                  ? 'Sign in to access your healthcare dashboard' 
                  : 'Create your account to get started'
                }
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-ruby/10 border-l-4 border-ruby text-ruby flex items-center">
                <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-midnight dark:text-pearl mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-steel dark:text-mist" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border border-steel/20 dark:border-steel/30 bg-mist/50 dark:bg-midnight/50 text-midnight dark:text-pearl placeholder-steel dark:placeholder-mist focus:outline-none focus:ring-2 focus:ring-ocean focus:border-transparent transition-colors duration-200"
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-midnight dark:text-pearl mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-steel dark:text-mist" />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-10 pr-10 py-3 border border-steel/20 dark:border-steel/30 bg-mist/50 dark:bg-midnight/50 text-midnight dark:text-pearl placeholder-steel dark:placeholder-mist focus:outline-none focus:ring-2 focus:ring-ocean focus:border-transparent transition-colors duration-200"
                    placeholder="Enter your password"
                    minLength={6}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-steel dark:text-mist hover:text-ocean transition-colors" />
                    ) : (
                      <Eye className="h-5 w-5 text-steel dark:text-mist hover:text-ocean transition-colors" />
                    )}
                  </button>
                </div>
              </div>

              {/* Confirm Password Field (Sign Up Only) */}
              {mode === 'signup' && (
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-midnight dark:text-pearl mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-steel dark:text-mist" />
                    </div>
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="block w-full pl-10 pr-10 py-3 border border-steel/20 dark:border-steel/30 bg-mist/50 dark:bg-midnight/50 text-midnight dark:text-pearl placeholder-steel dark:placeholder-mist focus:outline-none focus:ring-2 focus:ring-ocean focus:border-transparent transition-colors duration-200"
                      placeholder="Confirm your password"
                      minLength={6}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-5 w-5 text-steel dark:text-mist hover:text-ocean transition-colors" />
                      ) : (
                        <Eye className="h-5 w-5 text-steel dark:text-mist hover:text-ocean transition-colors" />
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-ocean text-pearl py-3 px-4 font-semibold hover:bg-ocean-dark focus:outline-none focus:ring-2 focus:ring-ocean focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center"
                style={{ clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 100%, 12px 100%)' }}
              >
                {loading ? (
                  <div className="w-6 h-6 border-2 border-pearl border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    {mode === 'login' ? (
                      <>
                        <User className="w-5 h-5 mr-2" />
                        Sign In
                      </>
                    ) : (
                      <>
                        <User className="w-5 h-5 mr-2" />
                        Create Account
                      </>
                    )}
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="mt-6 mb-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-steel/20 dark:border-steel/30" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-pearl dark:bg-midnight text-steel dark:text-mist">or</span>
                </div>
              </div>
            </div>

            {/* Google Sign-In Button */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full bg-white dark:bg-steel/10 text-midnight dark:text-pearl border border-steel/20 dark:border-steel/30 py-3 px-4 font-semibold hover:bg-mist/50 dark:hover:bg-steel/20 focus:outline-none focus:ring-2 focus:ring-ocean focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center"
              style={{ clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 100%, 12px 100%)' }}
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-midnight dark:border-pearl border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continue with Google
                </>
              )}
            </button>

            {/* Footer */}
            <div className="mt-8 text-center">
              <p className="text-steel dark:text-mist text-sm">
                {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
                <Link
                  to={mode === 'login' ? '/signup' : '/login'}
                  className="text-ocean hover:text-ocean-dark font-semibold transition-colors duration-200"
                >
                  {mode === 'login' ? 'Sign up' : 'Sign in'}
                </Link>
              </p>
              
              <div className="mt-4">
                <Link
                  to="/"
                  className="text-steel dark:text-mist hover:text-ocean text-sm transition-colors duration-200"
                >
                  ← Back to Home
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};