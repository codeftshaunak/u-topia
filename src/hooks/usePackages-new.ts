import { useState, useEffect } from 'react';

interface Package {
  id: string;
  name: string;
  priceUsd: number;
  shares: number;
  dividendCapPercent: number;
  stripeProductId: string | null;
  stripePriceId: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export function usePackages() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        setError(null);

        const response = await fetch('/api/packages', {
          credentials: 'same-origin',
        });

        if (!response.ok) {
          throw new Error('Failed to fetch packages');
        }

        const data = await response.json();
        setPackages(data.packages || []);
      } catch (err) {
        console.error('Error fetching packages:', err);
        setError('Failed to fetch packages');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPackages();
  }, []);

  return { packages, isLoading, error };
}
