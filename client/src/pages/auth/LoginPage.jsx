import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
  LogIn,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  Sparkles,
  Calendar,
  CheckCircle2,
  FileText,
  ShieldAlert,
  Bot,
  Zap,
  Users
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { useAuth } from '../../context/AuthContext';
import { normalizeApiError } from '../../services/api/client';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [email, setEmail] = useState('lead@club.edu');
  const [password, setPassword] = useState('Password123!');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Where to redirect after login (preserve attempted route)
  const from = location.state?.from?.pathname || '/dashboard';

  const handleLogin = async (e) => {
    e?.preventDefault();
    if (!email.trim()) {
      setError('Please enter your college email address.');
      return;
    }
    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await login({
        email: email.trim(),
        password
      });

      navigate(from, { replace: true });
    } catch (err) {
      console.error('Login error:', err);
      if (err.response?.status === 401) {
        setError('Invalid email or password. Please verify your credentials.');
      } else if (err.response?.status === 403) {
        setError(err.response?.data?.message || 'Access denied. Account is deactivated.');
      } else {
        setError(normalizeApiError(err));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleFillDemo = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError(null);
  };

  return (
    <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
      {/* Left Column: Brand Story & Feature Telemetry (Hidden on small mobile if needed, elegant on desktop) */}
      <div className="lg:col-span-7 flex flex-col justify-center space-y-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#6366F1]/10 border border-[#6366F1]/30 text-xs font-semibold text-[#818CF8] mb-4">
            <Sparkles className="w-3.5 h-3.5 text-[#A78BFA]" />
            <span>Autonomous Club Infrastructure</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Run your club.<br />
            <span className="bg-gradient-to-r from-[#818CF8] via-[#A78BFA] to-[#C084FC] bg-clip-text text-transparent">
              Let AI handle the operations.
            </span>
          </h1>
          <p className="mt-3 text-base text-[#94A3B8] leading-relaxed max-w-xl">
            Plan events, coordinate volunteers, extract meeting action items, query documents with RAG, and mitigate operational risks from a unified command center.
          </p>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <div className="p-3.5 rounded-xl bg-[#151D2E]/80 border border-[#263247] hover:border-[#6366F1]/50 transition-colors flex items-start gap-3">
            <div className="p-2 rounded-lg bg-[#6366F1]/15 text-[#818CF8] shrink-0">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xs font-semibold text-white">Event Lifecycle Hub</h2>
              <p className="text-[11px] text-[#94A3B8] leading-snug mt-0.5">
                Dynamic milestone tracking, budgets, and automated roadmaps.
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#151D2E]/80 border border-[#263247] hover:border-[#8B5CF6]/50 transition-colors flex items-start gap-3">
            <div className="p-2 rounded-lg bg-[#8B5CF6]/15 text-[#A78BFA] shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xs font-semibold text-white">AI Operations Agent</h2>
              <p className="text-[11px] text-[#94A3B8] leading-snug mt-0.5">
                Gemini-powered task dispatch and human-in-the-loop proposals.
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#151D2E]/80 border border-[#263247] hover:border-[#22C55E]/50 transition-colors flex items-start gap-3">
            <div className="p-2 rounded-lg bg-[#22C55E]/15 text-[#4ADE80] shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xs font-semibold text-white">Meeting Intelligence</h2>
              <p className="text-[11px] text-[#94A3B8] leading-snug mt-0.5">
                Auto-convert transcripts into verified assigned tasks with due dates.
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#151D2E]/80 border border-[#263247] hover:border-[#F59E0B]/50 transition-colors flex items-start gap-3">
            <div className="p-2 rounded-lg bg-[#F59E0B]/15 text-[#FBBF24] shrink-0">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xs font-semibold text-white">Risk Radar</h2>
              <p className="text-[11px] text-[#94A3B8] leading-snug mt-0.5">
                Proactive bottleneck prediction and AI mitigation playbooks.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: Sign In Card */}
      <div className="lg:col-span-5 w-full max-w-md mx-auto">
        <Card className="border-[#263247] bg-[#151D2E]/95 backdrop-blur-md shadow-2xl relative overflow-hidden">
          {/* Top accent glow */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#6366F1] via-[#8B5CF6] to-[#3B82F6]" />

          <CardHeader className="pb-4">
            <div className="flex items-center gap-2 mb-1">
              <CardTitle className="text-xl sm:text-2xl font-bold text-white">
                Welcome back
              </CardTitle>
              <span className="text-xl">👋</span>
            </div>
            <CardDescription className="text-xs text-[#94A3B8]">
              Sign in to your ClubOps workspace and command center.
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleLogin}>
            <CardContent className="space-y-4">
              {/* Error Message */}
              {error && (
                <div className="p-3 rounded-lg bg-[#EF4444]/15 border border-[#EF4444]/30 text-xs text-[#F87171] flex items-start gap-2.5 animate-in fade-in duration-200">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-[#EF4444]" />
                  <div className="flex-1 leading-relaxed">
                    <p className="font-medium">{error}</p>
                  </div>
                </div>
              )}

              {/* Email Field */}
              <Input
                label="College Email"
                type="email"
                placeholder="organizer@club.edu"
                leftIcon={<Mail className="w-4 h-4" />}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                autoComplete="email"
                required
              />

              {/* Password Field with Show/Hide Toggle */}
              <div className="relative">
                <Input
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  leftIcon={<Lock className="w-4 h-4" />}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-[34px] text-[#94A3B8] hover:text-[#F8FAFC] transition-colors p-1 rounded focus:outline-none"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Quick Fill Demo Credential Card */}
              <div className="p-3 rounded-xl bg-[#111827] border border-[#263247] flex flex-col gap-2">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-semibold text-[#818CF8] flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-[#F59E0B]" />
                    Demo Organizer:
                  </span>
                  <button
                    type="button"
                    onClick={() => handleFillDemo('lead@club.edu', 'Password123!')}
                    className="text-[10px] font-medium text-[#A78BFA] hover:text-[#C4B5FD] underline cursor-pointer"
                  >
                    Quick Fill
                  </button>
                </div>
                <div className="text-[11px] font-mono text-[#CBD5E1] flex items-center justify-between bg-[#0B1020]/60 px-2.5 py-1.5 rounded-lg border border-[#1E293B]">
                  <span>lead@club.edu</span>
                  <span className="text-[#64748B]">&bull;</span>
                  <span>Password123!</span>
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex-col gap-3 pt-2">
              <Button
                type="submit"
                variant="primary"
                className="w-full py-2.5 text-sm font-semibold shadow-lg shadow-[#6366F1]/20 hover:shadow-[#6366F1]/40"
                isLoading={isLoading}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                {isLoading ? 'Signing in...' : 'Sign In to Workspace'}
              </Button>

              {/* Register Link */}
              <div className="text-center pt-2">
                <p className="text-xs text-[#94A3B8]">
                  Don't have an account?{' '}
                  <Link
                    to="/register"
                    className="font-medium text-[#818CF8] hover:text-[#A78BFA] transition-colors inline-flex items-center gap-1 group"
                  >
                    Create an account
                    <span className="inline-block transition-transform duration-200 group-hover:translate-x-0.5">&rarr;</span>
                  </Link>
                </p>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
