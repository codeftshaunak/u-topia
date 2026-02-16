import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export function useAdmin() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        if (!user?.email) {
          setIsAdmin(false);
          setIsLoading(false);
          return;
        }

        setUserEmail(user.email);

        const response = await fetch('/api/admin/check', {
          credentials: 'same-origin',
        });
        const data = await response.json();

        setIsAdmin(data.isAdmin || false);
      } catch (err) {
        console.error('Error in admin check:', err);
        setIsAdmin(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAdminStatus();
  }, [user]);

  return { isAdmin, isLoading, userEmail };
}
