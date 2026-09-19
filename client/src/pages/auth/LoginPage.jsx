import React from 'react';
import { Link } from 'react-router-dom';
import { LogIn, Lock, Mail, ArrowRight } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

export default function LoginPage() {
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

      <CardContent className="space-y-4">
        <Input
          label="College Email"
          type="email"
          placeholder="organizer@club.edu"
          leftIcon={<Mail className="w-4 h-4" />}
          disabled
        />
        <Input
          label="Password"
          type="password"
          placeholder="••••••••"
          leftIcon={<Lock className="w-4 h-4" />}
          disabled
        />

        <div className="p-3 rounded-lg bg-[#111827] border border-[#263247] text-xs text-[#94A3B8] leading-relaxed">
          <span className="font-semibold text-[#818CF8]">Foundation Note:</span> Authentication and JWT session handling will be integrated in subsequent backend stages.
        </div>
      </CardContent>

      <CardFooter className="flex-col sm:flex-row gap-3">
        <Link to="/dashboard" className="w-full">
          <Button
            variant="primary"
            className="w-full"
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Enter Demo Workspace
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
