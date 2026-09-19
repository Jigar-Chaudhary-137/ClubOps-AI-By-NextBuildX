import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, Lock, Mail, ArrowRight, AlertCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import apiClient from '../../services/api/client';

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('lead@club.edu');
  const [password, setPassword] = useState('Password123!');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleLogin = async (e) => {
    e?.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiClient.post('/auth/login', {
        email: email.trim(),
        password
      });

      const { token, user } = response.data.data;
      if (token) {
        localStorage.setItem('token', token);
      }
      if (user) {
        localStorage.setItem('user', JSON.stringify(user));
      }

      navigate('/dashboard');
    } catch (err) {
      console.error('Login error:', err);
      setError(
        err.response?.data?.message ||
        err.message ||
        'Failed to authenticate. Please check your credentials.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-[#263247] shadow-2xl">
      <CardHeader>
        <div>
          <CardTitle>Sign In to Workspace</CardTitle>
          <CardDescription>
            Access your college club's centralized operations platform
          </CardDescription>
        </div>
      </CardHeader>

      <form onSubmit={handleLogin}>
        <CardContent className="space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-[#EF4444]/10 border border-[#EF4444]/30 text-xs text-[#F87171] flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <Input
            label="College Email"
            type="email"
            placeholder="organizer@club.edu"
            leftIcon={<Mail className="w-4 h-4" />}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
            required
          />
          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            leftIcon={<Lock className="w-4 h-4" />}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
            required
          />

          <div className="p-3 rounded-lg bg-[#111827] border border-[#263247] text-xs text-[#94A3B8] leading-relaxed">
            <span className="font-semibold text-[#818CF8]">Default Organizer:</span>{' '}
            <span className="text-white font-mono">lead@club.edu</span> /{' '}
            <span className="text-white font-mono">Password123!</span>
          </div>
        </CardContent>

        <CardFooter className="flex-col sm:flex-row gap-3">
          <Button
            type="submit"
            variant="primary"
            className="w-full"
            isLoading={isLoading}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Enter Workspace
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
