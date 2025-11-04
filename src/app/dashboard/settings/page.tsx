
'use client';

import { useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import { app } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import FirebaseUserSettingsService from '@/services/firebase-user-settings-service';
import { useToast } from '@/hooks/use-toast';

export default function SettingsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [autoRunGemini, setAutoRunGemini] = useState<boolean>(() => {
    try { return localStorage.getItem('autoRunGemini') === 'true'; } catch { return false; }
  });
  const [preferredKpiCount, setPreferredKpiCount] = useState<number>(() => {
    try { const v = localStorage.getItem('preferredKpiCount'); return v ? Number(v) : 3; } catch { return 3; }
  });
  const [preferredChartType, setPreferredChartType] = useState<'line'|'bar'|'pie'|'scatter'>(() => {
    try { const v = localStorage.getItem('preferredChartType'); return (v as any) || 'line'; } catch { return 'line'; }
  });
  const { toast } = useToast();

  useEffect(() => {
    const auth = getAuth(app);
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      // If user logged in, load persisted setting from Firestore
      (async () => {
        if (currentUser) {
          try {
            const s = await FirebaseUserSettingsService.getUserSettings(currentUser.uid);
            if (s) {
              if (typeof s.autoRunGemini === 'boolean') {
                setAutoRunGemini(s.autoRunGemini);
                try { localStorage.setItem('autoRunGemini', s.autoRunGemini ? 'true' : 'false'); } catch {}
              }
              if (typeof s.preferredKpiCount === 'number') {
                setPreferredKpiCount(s.preferredKpiCount);
                try { localStorage.setItem('preferredKpiCount', String(s.preferredKpiCount)); } catch {}
              }
              if (typeof s.preferredChartType === 'string') {
                setPreferredChartType(s.preferredChartType as any);
                try { localStorage.setItem('preferredChartType', s.preferredChartType); } catch {}
              }
            }
          } catch (e) {
            // ignore and keep local values
          }
        }
      })();
    });
    return () => unsubscribe();
  }, []);

  const firstName = user?.displayName?.split(' ')[0] || '';
  const lastName = user?.displayName?.split(' ').slice(1).join(' ') || '';

  return (
    <>
      <div className="flex-1">
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Manage your account and application settings.
        </p>
      </div>
      <main className="flex flex-1 flex-col gap-4 pt-4 sm:px-6 sm:py-0 md:gap-8">
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>
                Update your personal information.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="grid gap-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                    <div className="grid gap-2">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Skeleton className="h-4 w-12" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                </div>
              ) : (
                <form className="grid gap-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="first-name">First name</Label>
                      <Input id="first-name" value={firstName} readOnly />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="last-name">Last name</Label>
                      <Input id="last-name" value={lastName} readOnly />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={user?.email || ''}
                      readOnly
                    />
                  </div>
                </form>
              )}
            </CardContent>
            <CardFooter className="border-t px-6 py-4">
              <Button disabled>Save</Button>
            </CardFooter>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Preferences</CardTitle>
              <CardDescription>
                Customize the application to your liking.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
              <div className="flex items-center justify-between space-x-2">
                <Label
                  htmlFor="email-notifications"
                  className="flex flex-col space-y-1"
                >
                  <span>Email Notifications</span>
                  <span className="text-xs font-normal text-muted-foreground">
                    Receive email updates and alerts.
                  </span>
                </Label>
                <Switch id="email-notifications" defaultChecked />
              </div>

              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="auto-run-gemini" className="flex flex-col space-y-1">
                  <span>Auto-run Gemini on upload</span>
                  <span className="text-xs font-normal text-muted-foreground">
                    Automatically run a quick Gemini analysis after uploading a dataset (requires Gemini enabled).
                  </span>
                </Label>
                <Switch
                  id="auto-run-gemini"
                  checked={autoRunGemini}
                  onCheckedChange={async (val: boolean) => {
                    const newVal = Boolean(val);
                    try { localStorage.setItem('autoRunGemini', newVal ? 'true' : 'false'); } catch {}
                    setAutoRunGemini(newVal);
                    // If user is logged in, persist to Firestore
                    try {
                      if (user?.uid) {
                        await FirebaseUserSettingsService.setUserSettings(user.uid, { autoRunGemini: newVal });
                        toast({ title: 'Preference saved', description: 'Auto-run setting persisted to your account.' });
                      } else {
                        toast({ title: 'Preference set locally', description: 'Auto-run will be stored in this browser.' });
                      }
                    } catch (e) {
                      console.warn('Failed to persist autoRunGemini to server', e);
                      toast({ title: 'Save failed', description: 'Could not persist preference to server.', variant: 'destructive' });
                    }
                  }}
                />
              </div>

              <div className="grid grid-cols-2 gap-4 items-center">
                <div>
                  <Label htmlFor="preferred-kpi-count">Preferred KPI count</Label>
                  <p className="text-xs text-muted-foreground">How many KPI cards to display in analytics.</p>
                </div>
                <div className="flex items-center gap-2">
                  <Input id="preferred-kpi-count" type="number" value={preferredKpiCount} min={1} max={10} onChange={async (e) => {
                    const v = Math.max(1, Math.min(10, Number(e.target.value || 3)));
                    setPreferredKpiCount(v);
                    try { localStorage.setItem('preferredKpiCount', String(v)); } catch {}
                    if (user?.uid) {
                      try {
                        await FirebaseUserSettingsService.setUserSettings(user.uid, { preferredKpiCount: v });
                        toast({ title: 'Preference saved', description: 'Preferred KPI count persisted.' });
                      } catch (err) {
                        console.warn('Failed to save preferredKpiCount', err);
                        toast({ title: 'Save failed', description: 'Could not persist preferred KPI count.', variant: 'destructive' });
                      }
                    }
                  }} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 items-center">
                <div>
                  <Label htmlFor="preferred-chart-type">Preferred Chart Type</Label>
                  <p className="text-xs text-muted-foreground">Default chart type when AI suggests charts.</p>
                </div>
                <div className="flex items-center gap-2">
                  <select id="preferred-chart-type" className="input" value={preferredChartType} onChange={async (e) => {
                    const v = e.target.value as any;
                    setPreferredChartType(v);
                    try { localStorage.setItem('preferredChartType', v); } catch {}
                    if (user?.uid) {
                      try {
                        await FirebaseUserSettingsService.setUserSettings(user.uid, { preferredChartType: v });
                        toast({ title: 'Preference saved', description: 'Preferred chart type persisted.' });
                      } catch (err) {
                        console.warn('Failed to save preferredChartType', err);
                        toast({ title: 'Save failed', description: 'Could not persist preferred chart type.', variant: 'destructive' });
                      }
                    }
                  }}>
                    <option value="line">Line</option>
                    <option value="bar">Bar</option>
                    <option value="pie">Pie</option>
                    <option value="scatter">Scatter</option>
                  </select>
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t px-6 py-4">
              <Button>Save</Button>
            </CardFooter>
          </Card>
        </div>
      </main>
    </>
  );
}
