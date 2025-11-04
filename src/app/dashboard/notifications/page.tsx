
'use client';

import { Bell, AlertTriangle, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
  TableHead,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { useBusinessData } from '@/contexts/business-data-context';

const iconMap = {
  success: <CheckCircle className="h-5 w-5 text-green-500" />,
  warning: <AlertTriangle className="h-5 w-5 text-yellow-500" />,
  info: <Bell className="h-5 w-5 text-blue-500" />,
};

export default function NotificationsPage() {
  const { businessData, isProcessing } = useBusinessData();
  
  // Use mock notifications for now, or generate from business data if available
  const notifications = businessData ? [
    {
      type: 'success' as const,
      title: 'Data Upload Successful',
      description: `Successfully processed ${businessData.data.length} records from your business file.`,
      time: 'Just now'
    },
    {
      type: 'info' as const,
      title: 'Analysis Complete',
      description: 'Your business data has been analyzed and insights are ready.',
      time: '2 minutes ago'
    }
  ] : [
    {
      type: 'info' as const,
      title: 'No Data Available',
      description: 'Upload a business file to see notifications and insights.',
      time: 'Upload required'
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Notifications</h1>
        <p className="text-sm text-muted-foreground">
          Stay updated with important events and alerts.
        </p>
      </div>
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Recent Notifications</CardTitle>
          </CardHeader>
          <CardContent>
            {isProcessing && !businessData ? (
              <div className="space-y-4">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[64px]"></TableHead>
                    <TableHead>Details</TableHead>
                    <TableHead className="text-right">Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {notifications?.map((notification, index) => (
                    <TableRow key={index}>
                      <TableCell>{iconMap[notification.type]}</TableCell>
                      <TableCell>
                        <div className="font-medium">{notification.title}</div>
                        <div className="text-sm text-muted-foreground">
                          {notification.description}
                        </div>
                      </TableCell>
                      <TableCell className="text-right text-sm text-muted-foreground">
                        {notification.time}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
