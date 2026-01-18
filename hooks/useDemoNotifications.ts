/**
 * Hook to add demo notifications for testing
 */

'use client';

import { useEffect } from 'react';
import { useNotifications } from '@/contexts';

export function useDemoNotifications() {
  const { addNotification } = useNotifications();

  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];
    
    // Add some demo notifications after a short delay
    const mainTimer = setTimeout(() => {
      addNotification({
        type: 'shipment',
        title: 'Shipment Update',
        message: 'Your shipment #SH-2024-001 has been dispatched and is on its way.'
      });

      const timer1 = setTimeout(() => {
        addNotification({
          type: 'compliance',
          title: 'Compliance Reminder',
          message: 'Your facility license will expire in 30 days. Please renew to avoid service interruption.'
        });
      }, 2000);
      timers.push(timer1);

      const timer2 = setTimeout(() => {
        addNotification({
          type: 'success',
          title: 'Document Uploaded',
          message: 'Your compliance certificate has been successfully uploaded and verified.'
        });
      }, 4000);
      timers.push(timer2);
    }, 2000);
    timers.push(mainTimer);

    return () => {
      // Clean up all timers
      timers.forEach(timer => clearTimeout(timer));
    };
  }, [addNotification]);
}
