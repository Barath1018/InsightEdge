import type { ReactNode } from 'react';
import DashboardPage from '@/components/dashboard/dashboard-page';

export default function AnalyticsLayout({ children }: { children: ReactNode }) {
  return <DashboardPage>{children}</DashboardPage>;
}
