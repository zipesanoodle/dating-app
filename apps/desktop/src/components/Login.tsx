import React, { useState } from 'react';
import { api } from '../api';

interface LoginProps {
  onLogin: () => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isRegistering) {
        await api.register(email, password);
      }
      const res = await api.login(email, password);
      api.setToken(res.token);
      onLogin();
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm p-8 bg-white rounded-3xl shadow-2xl border border-gray-100 animate-in fade-in zoom-in duration-500">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-black text-gray-900 tracking-tight">
          {isRegistering ? 'Join HeartSync' : 'Welcome Back'}
        </h2>
        <p className="text-gray-500 mt-2">
          {isRegistering ? 'Create your profile to start matching' : 'Sign in to see your matches'}
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-1">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Email Address</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-pink-500 outline-none transition-all"
            placeholder="name@example.com"
            required
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-pink-500 outline-none transition-all"
            placeholder="••••••••"
            required
          />
        </div>
        
        {error && (
          <p className="text-red-500 text-xs font-medium text-center bg-red-50 py-2 rounded-lg">
            {error}
          </p>
        )}
        
        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 px-4 rounded-2xl shadow-lg text-white font-bold bg-gradient-to-r from-pink-500 to-orange-400 hover:shadow-pink-200 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-70"
        >
          {loading ? 'Processing...' : isRegistering ? 'Create Account' : 'Sign In'}
        </button>
      </form>
      
      <button
        onClick={() => {
          setIsRegistering(!isRegistering);
          setError('');
        }}
        className="w-full mt-6 text-sm font-semibold text-gray-400 hover:text-pink-500 transition-colors"
      >
        {isRegistering ? 'Already have an account? Log in' : "Don't have an account? Sign up"}
      </button>
    </div>
  );
};
