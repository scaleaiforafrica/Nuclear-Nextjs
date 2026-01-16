/**
 * Hook to add demo notifications for testing
 */

'use client';

import { useEffect } from 'react';
import { useNotifications } from '@/contexts';

export function useDemoNotifications() {
  const { addNotification } = useNotifications();

  useEffect(() => {
    // Add some demo notifications after a short delay
    const timer = setTimeout(() => {
      addNotification({
        type: 'shipment',
        title: 'Shipment Update',
        message: 'Your shipment #SH-2024-001 has been dispatched and is on its way.'
      });

      setTimeout(() => {
        addNotification({
          type: 'compliance',
          title: 'Compliance Reminder',
          message: 'Your facility license will expire in 30 days. Please renew to avoid service interruption.'
        });
      }, 2000);

      setTimeout(() => {
        addNotification({
          type: 'success',
          title: 'Document Uploaded',
          message: 'Your compliance certificate has been successfully uploaded and verified.'
        });
      }, 4000);
    }, 2000);

    return () => clearTimeout(timer);
  }, [addNotification]);
}
