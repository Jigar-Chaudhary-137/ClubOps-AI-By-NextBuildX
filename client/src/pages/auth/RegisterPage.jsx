import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  Sparkles,
  Building2,
  KeyRound,
  ShieldCheck,
  Layers,
  Check,
  CheckCircle2
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import { useAuth } from '../../context/AuthContext';
import { normalizeApiError } from '../../services/api/client';

const roleOptions = [
  { value: 'organizer', label: 'Lead Organizer (Full Permissions)' },
  { value: 'volunteer', label: 'Volunteer (Task Execution & Attendance)' },
  { value: 'member', label: 'Club Member (General Access)' }
];

const categoryOptions = [
  { value: 'Technology', label: 'Technology & Coding' },
  { value: 'Cultural', label: 'Arts & Culture' },
  { value: 'Sports', label: 'Sports & Athletics' },
  { value: 'Academic', label: 'Academic & Research' },
  { value: 'Entrepreneurship', label: 'Startup & Entrepreneurship' },
  { value: 'Social', label: 'Social Impact & Community' },
  { value: 'General', label: 'General Club' }
];

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState('organizer');

  // Club setup mode: 'new' (Create new club) | 'join' (Join with code)
  const [clubMode, setClubMode] = useState('new');
  const [clubName, setClubName] = useState('');
  const [clubCategory, setClubCategory] = useState('Technology');
  const [clubCode, setClubCode] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleRegister = async (e) => {
    e?.preventDefault();

    if (!name.trim()) {
      setError('Please provide your full name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setError('Please provide a valid college email address.');
      return;
    }
    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setIsLoading(true);
    setError(null);

    const payload = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
      role
    };

    if (clubMode === 'new' && clubName.trim()) {
      payload.clubName = clubName.trim();
      payload.clubCategory = clubCategory;
    } else if (clubMode === 'join' && clubCode.trim()) {
      payload.clubCode = clubCode.trim().toUpperCase();
    }

    try {
      await register(payload);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      console.error('Registration error:', err);
      if (err.response?.status === 409) {
        setError('An account with this email address already exists. Try signing in instead.');
      } else if (err.response?.status === 404 && clubMode === 'join') {
        setError(`Club code "${clubCode.toUpperCase()}" not found. Please verify the code.`);
      } else {
        setError(normalizeApiError(err));
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
      {/* Left Column: Value Proposition & Onboarding Features */}
      <div className="lg:col-span-6 flex flex-col justify-center space-y-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#8B5CF6]/10 border border-[#8B5CF6]/30 text-xs font-semibold text-[#A78BFA] mb-4">
            <Sparkles className="w-3.5 h-3.5 text-[#C4B5FD]" />
            <span>Instant Workspace Setup</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Build your club's<br />
            <span className="bg-gradient-to-r from-[#A78BFA] via-[#818CF8] to-[#38BDF8] bg-clip-text text-transparent">
              command center.
            </span>
          </h1>
          <p className="mt-3 text-base text-[#94A3B8] leading-relaxed max-w-lg">
            Create your ClubOps workspace in seconds. Equip your team with autonomous event planning, volunteer dispatch, transcript intelligence, and risk detection.
          </p>
        </div>

        {/* Benefits Checklist */}
        <div className="space-y-3.5 pt-2">
          <div className="flex items-start gap-3">
            <div className="w-5 h-5 rounded-full bg-[#22C55E]/20 text-[#22C55E] flex items-center justify-center shrink-0 mt-0.5">
              <Check className="w-3.5 h-3.5" />
            </div>
            <div>
              <p className="text-sm font-medium text-[#F8FAFC]">Multi-Role Governance</p>
              <p className="text-xs text-[#94A3B8]">Organizers, volunteers, and members collaborate in tailored permission environments.</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-5 h-5 rounded-full bg-[#6366F1]/20 text-[#818CF8] flex items-center justify-center shrink-0 mt-0.5">
              <Check className="w-3.5 h-3.5" />
            </div>
            <div>
              <p className="text-sm font-medium text-[#F8FAFC]">Unique Club Invite Codes</p>
              <p className="text-xs text-[#94A3B8]">Effortlessly invite entire teams using self-service club codes like <code className="text-[#818CF8]">TECH-2026</code>.</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-5 h-5 rounded-full bg-[#8B5CF6]/20 text-[#A78BFA] flex items-center justify-center shrink-0 mt-0.5">
              <Check className="w-3.5 h-3.5" />
            </div>
            <div>
              <p className="text-sm font-medium text-[#F8FAFC]">Gemini-Ready Knowledge Base</p>
              <p className="text-xs text-[#94A3B8]">Index your handbooks and budgets for semantic RAG search from day one.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: Registration Card */}
      <div className="lg:col-span-6 w-full max-w-lg mx-auto">
        <Card className="border-[#263247] bg-[#151D2E]/95 backdrop-blur-md shadow-2xl relative overflow-hidden">
          {/* Top accent line */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#8B5CF6] via-[#6366F1] to-[#38BDF8]" />

          <CardHeader className="pb-4">
            <CardTitle className="text-xl sm:text-2xl font-bold text-white">
              Create your account
            </CardTitle>
            <CardDescription className="text-xs text-[#94A3B8]">
              Join thousands of campus organizers coordinating smarter events.
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleRegister}>
            <CardContent className="space-y-4">
              {/* Error Notification */}
              {error && (
                <div className="p-3 rounded-lg bg-[#EF4444]/15 border border-[#EF4444]/30 text-xs text-[#F87171] flex items-start gap-2.5 animate-in fade-in duration-200">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-[#EF4444]" />
                  <div className="flex-1 leading-relaxed">
                    <p className="font-medium">{error}</p>
                  </div>
                </div>
              )}

              {/* Name & Email Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="Full Name *"
                  type="text"
                  placeholder="Alex Vance"
                  leftIcon={<User className="w-4 h-4" />}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isLoading}
                  required
                />
                <Input
                  label="College Email *"
                  type="email"
                  placeholder="alex@club.edu"
                  leftIcon={<Mail className="w-4 h-4" />}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>

              {/* Password with visibility toggle */}
              <div className="relative">
                <Input
                  label="Password * (min. 6 characters)"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  leftIcon={<Lock className="w-4 h-4" />}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
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

              {/* Role Selector */}
              <div>
                <label className="block text-xs font-medium text-[#94A3B8] mb-1.5">
                  Your Role in the Club
                </label>
                <Select
                  options={roleOptions}
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  disabled={isLoading}
                />
              </div>

              {/* Club Association Toggle Pills */}
              <div className="pt-1">
                <label className="block text-xs font-medium text-[#94A3B8] mb-1.5">
                  Club Association
                </label>
                <div className="grid grid-cols-2 gap-2 bg-[#111827] p-1 rounded-xl border border-[#263247]">
                  <button
                    type="button"
                    onClick={() => setClubMode('new')}
                    className={`py-1.5 px-3 rounded-lg text-xs font-medium transition-all ${
                      clubMode === 'new'
                        ? 'bg-[#6366F1] text-white shadow'
                        : 'text-[#94A3B8] hover:text-white'
                    }`}
                  >
                    Create New Club
                  </button>
                  <button
                    type="button"
                    onClick={() => setClubMode('join')}
                    className={`py-1.5 px-3 rounded-lg text-xs font-medium transition-all ${
                      clubMode === 'join'
                        ? 'bg-[#6366F1] text-white shadow'
                        : 'text-[#94A3B8] hover:text-white'
                    }`}
                  >
                    Join with Code
                  </button>
                </div>
              </div>

              {/* Conditional Club Inputs */}
              {clubMode === 'new' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-xl bg-[#111827]/60 border border-[#263247]/60">
                  <Input
                    label="Club Name"
                    placeholder="e.g. Google Developer Student Club"
                    leftIcon={<Building2 className="w-4 h-4" />}
                    value={clubName}
                    onChange={(e) => setClubName(e.target.value)}
                    disabled={isLoading}
                  />
                  <div>
                    <label className="block text-xs font-medium text-[#94A3B8] mb-1.5">
                      Club Category
                    </label>
                    <Select
                      options={categoryOptions}
                      value={clubCategory}
                      onChange={(e) => setClubCategory(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-[#111827]/60 border border-[#263247]/60">
                  <Input
                    label="Enter Club Code"
                    placeholder="e.g. TECH2026 or ROBO2026"
                    leftIcon={<KeyRound className="w-4 h-4" />}
                    value={clubCode}
                    onChange={(e) => setClubCode(e.target.value)}
                    disabled={isLoading}
                  />
                  <p className="text-[11px] text-[#64748B] mt-1.5">
                    Ask your lead organizer for your club's 6-8 character identifier.
                  </p>
                </div>
              )}
            </CardContent>

            <CardFooter className="flex-col gap-3 pt-2">
              <Button
                type="submit"
                variant="primary"
                className="w-full py-2.5 text-sm font-semibold shadow-lg shadow-[#6366F1]/20 hover:shadow-[#6366F1]/40"
                isLoading={isLoading}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                {isLoading ? 'Creating workspace...' : 'Complete Registration'}
              </Button>

              <div className="text-center pt-1">
                <p className="text-xs text-[#94A3B8]">
                  Already have an account?{' '}
                  <Link
                    to="/login"
                    className="font-medium text-[#818CF8] hover:text-[#A78BFA] transition-colors inline-flex items-center gap-1 group"
                  >
                    Sign in
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
