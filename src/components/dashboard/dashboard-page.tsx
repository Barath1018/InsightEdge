'use client';

import {
  Bell,
  FileText,
  HelpCircle,
  Home,
  Lightbulb,
  Settings,
  TrendingUp,
  Search,
} from 'lucide-react';
import type { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged, type User } from 'firebase/auth';
import { app } from '@/lib/firebase';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Logo } from '@/components/logo';
import { Input } from '@/components/ui/input';
import { UserNav } from './user-nav';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

// Pro Tips array for rotation
const PRO_TIPS = [
  "Monitor your profit margins regularly to maintain healthy business growth.",
  "Use data visualization to identify trends and patterns in your business metrics.",
  "Set up automated alerts for key performance indicators to stay informed.",
  "Regular data backup ensures your business insights are always protected.",
  "Compare year-over-year performance to understand seasonal business patterns.",
  "Track customer acquisition costs to optimize your marketing budget effectively.",
  "Implement A/B testing to make data-driven decisions about your products.",
  "Monitor cash flow patterns to predict and prevent potential financial issues.",
  "Use cohort analysis to understand customer retention and lifetime value.",
  "Export reports regularly to share insights with stakeholders and team members."
];

export default function DashboardPage({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentTipIndex, setCurrentTipIndex] = useState(0);

  useEffect(() => {
    const auth = getAuth(app);
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
      } else {
        router.push('/login');
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [router]);

  // Pro Tip rotation effect - changes every 30 seconds (30000ms)
  useEffect(() => {
    const tipInterval = setInterval(() => {
      setCurrentTipIndex((prevIndex) => (prevIndex + 1) % PRO_TIPS.length);
    }, 30000); // 30 seconds

    return () => clearInterval(tipInterval);
  }, []);

  const isActive = (path: string) => {
    // Exact match for dashboard, startsWith for others
    if (path === '/dashboard') {
      return pathname === path;
    }
    // Treat analytics aliases as active for both /analytics and /dashboard/analytics
    if (path === '/analytics') {
      return pathname.startsWith('/analytics') || pathname.startsWith('/dashboard/analytics');
    }
    return pathname.startsWith(path);
  };

  const userEmail = user?.email || '';
  const userName = user?.displayName || user?.email?.split('@')[0] || 'User';

  if (loading) {
    return null; // or a loading spinner
  }

  return (
      <SidebarProvider>
        <Sidebar>
          <SidebarHeader>
            <Logo />
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <Link href="/dashboard" passHref>
                  <SidebarMenuButton asChild isActive={isActive('/dashboard')}>
                    <span>
                      <Home />
                      Dashboard
                    </span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <Link href="/dashboard/reports" passHref>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive('/dashboard/reports')}
                  >
                    <span>
                      <FileText />
                      Reports
                    </span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            <SidebarMenuItem>
              <Link href="/analytics" passHref>
                <SidebarMenuButton
                  asChild
                  isActive={isActive('/analytics')}
                >
                  <span>
                    <TrendingUp />
                    Analytics
                  </span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <Link href="/dashboard/notifications" passHref>
                <SidebarMenuButton
                  asChild
                  isActive={isActive('/dashboard/notifications')}
                >
                  <span>
                    <Bell />
                    Notifications
                  </span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <Link href="/dashboard/settings" passHref>
                <SidebarMenuButton
                  asChild
                  isActive={isActive('/dashboard/settings')}
                >
                  <span>
                    <Settings />
                    Settings
                  </span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <Link href="/dashboard/help" passHref>
                <SidebarMenuButton asChild isActive={isActive('/dashboard/help')}>
                  <span>
                    <HelpCircle />
                    Help
                  </span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          <Card className="m-2 bg-sidebar-accent border-sidebar-border text-sidebar-foreground">
            <CardHeader className="p-4">
              <Lightbulb className="h-6 w-6 text-yellow-400 mb-2" />
              <CardTitle className="text-sm">Pro Tip</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 text-xs transition-all duration-500 ease-in-out">
              {PRO_TIPS[currentTipIndex]}
            </CardContent>
          </Card>
          <UserNav email={userEmail} name={userName} />
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <div className="flex min-h-screen w-full flex-col">
          <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/95 px-4 backdrop-blur sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
            <SidebarTrigger className="sm:hidden" />
            <div className="relative flex-1 md:grow-0">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search..."
                className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[336px]"
              />
            </div>
            <div className="ml-auto flex items-center gap-4">
              <Bell className="h-5 w-5 text-muted-foreground cursor-pointer" />
              <div className="hidden md:block">
                <UserNav email={userEmail} name={userName} />
              </div>
            </div>
          </header>
          <main className="flex flex-1 flex-col gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
            {children}
          </main>
        </div>
              </SidebarInset>
        </SidebarProvider>
    );
}
