'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AuthLayout } from '@/components/auth-layout';
import { useState, useCallback } from 'react';
import { getAuth, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { app } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';

interface FieldError {
  email?: string;
  password?: string;
  form?: string;
}

const firebaseErrorMap: Record<string, string> = {
  'auth/invalid-email': 'The email address is badly formatted.',
  'auth/user-disabled': 'This user account has been disabled.',
  'auth/user-not-found': 'No account found with that email.',
  'auth/wrong-password': 'Incorrect password. Please try again.',
  'auth/too-many-requests': 'Too many failed attempts. Please wait and try again.',
  'auth/popup-closed-by-user': 'Google sign-in popup was closed before completing.',
};

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [touched, setTouched] = useState<{ email: boolean; password: boolean }>({ email: false, password: false });
  const [errors, setErrors] = useState<FieldError>({});
  const { toast } = useToast();

  const validate = useCallback((draftEmail: string, draftPassword: string): FieldError => {
    const next: FieldError = {};
    if (!draftEmail.trim()) {
      next.email = 'Email is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draftEmail)) {
      next.email = 'Enter a valid email address.';
    }
    if (!draftPassword) {
      next.password = 'Password is required.';
    } else if (draftPassword.length < 6) {
      next.password = 'Password must be at least 6 characters.';
    }
    return next;
  }, []);

  const runValidation = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const next = validate(email, password);
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!runValidation()) return;
    setIsLoading(true);
    const auth = getAuth(app);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      router.push('/dashboard');
    } catch (error: any) {
      const code = error?.code as string | undefined;
      const friendly = (code && firebaseErrorMap[code]) || 'Unable to sign in. Please verify your credentials.';
      setErrors(prev => ({ ...prev, form: friendly }));
      toast({ title: 'Login Failed', description: friendly, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleGoogleLogin = async () => {
    setErrors({});
    setIsLoading(true);
    const auth = getAuth(app);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      router.push('/dashboard');
    } catch (error: any) {
      const code = error?.code as string | undefined;
      const friendly = (code && firebaseErrorMap[code]) || 'Google authentication did not complete.';
      setErrors(prev => ({ ...prev, form: friendly }));
      toast({ title: 'Google Login Failed', description: friendly, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      <form onSubmit={handleLogin} noValidate>
        <CardHeader className="space-y-2">
          <CardTitle className="text-xl tracking-tight">Sign in</CardTitle>
          <CardDescription className="text-sm leading-relaxed">
            Access your analytics dashboard. Your data is securely stored when authenticated.
          </CardDescription>
          {errors.form && (
            <p className="text-sm font-medium text-destructive bg-destructive/10 border border-destructive/20 rounded-md px-3 py-2">
              {errors.form}
            </p>
          )}
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-sm font-medium">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              inputMode="email"
              placeholder="name@company.com"
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? 'email-error' : undefined}
              value={email}
              onBlur={() => { setTouched(t => ({ ...t, email: true })); setErrors(prev => ({ ...prev, ...validate(email, password) })); }}
              onChange={e => { setEmail(e.target.value); if (touched.email) setErrors(prev => ({ ...prev, ...validate(e.target.value, password) })); }}
              className="transition-all focus:ring-2 focus:ring-ring"
            />
            {errors.email && (
              <p id="email-error" className="text-xs text-destructive mt-1">{errors.email}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center">
              <Label htmlFor="password" className="text-sm font-medium">Password</Label>
              <Link href="/forgot-password" className="ml-auto text-xs text-muted-foreground hover:text-foreground underline-offset-4 hover:underline focus-visible:underline">
                Forgot password?
              </Link>
            </div>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              aria-invalid={!!errors.password}
              aria-describedby={errors.password ? 'password-error' : undefined}
              value={password}
              onBlur={() => { setTouched(t => ({ ...t, password: true })); setErrors(prev => ({ ...prev, ...validate(email, password) })); }}
              onChange={e => { setPassword(e.target.value); if (touched.password) setErrors(prev => ({ ...prev, ...validate(email, e.target.value) })); }}
              className="transition-all focus:ring-2 focus:ring-ring"
            />
            {errors.password && (
              <p id="password-error" className="text-xs text-destructive mt-1">{errors.password}</p>
            )}
          </div>
          <Button type="submit" disabled={isLoading} className="w-full font-medium tracking-tight disabled:opacity-60">
            {isLoading ? 'Signing in...' : 'Sign in'}
          </Button>
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-[11px] uppercase tracking-wider text-muted-foreground">or</span>
            <div className="h-px flex-1 bg-border" />
          </div>
          <Button type="button" variant="outline" disabled={isLoading} onClick={handleGoogleLogin} className="w-full font-medium gap-2">
            <svg className="h-4 w-4" viewBox="0 0 488 512" aria-hidden="true"><path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"/></svg>
            Continue with Google
          </Button>
          <p className="text-xs text-muted-foreground leading-relaxed">
            By continuing you agree to our{' '}
            <Link href="/terms" className="underline underline-offset-4">Terms</Link> and{' '}
            <Link href="/privacy" className="underline underline-offset-4">Privacy Policy</Link>.
          </p>
          <p className="text-sm text-center">
            No account?{' '}
            <Link href="/signup" className="font-medium text-primary underline-offset-4 hover:underline">Create one</Link>
          </p>
        </CardContent>
      </form>
    </AuthLayout>
  );
}
