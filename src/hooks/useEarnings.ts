import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { cuelinksAPI } from '../lib/cuelinks';

export interface Earning {
  id: string;
  user_id: string;
  affiliate_link_id: string | null;
  amount: number;
  commission_rate: number | null;
  brand: string | null;
  product_name: string | null;
  status: string;
  transaction_date: string;
  created_at: string;
}

export interface EarningsSummary {
  totalEarnings: number;
  availableBalance: number;
  pendingEarnings: number;
  thisMonthEarnings: number;
  totalWithdrawn: number;
}

export function useEarnings() {
  const { user } = useAuth();
  const [earnings, setEarnings] = useState<Earning[]>([]);
  const [summary, setSummary] = useState<EarningsSummary>({
    totalEarnings: 0,
    availableBalance: 0,
    pendingEarnings: 0,
    thisMonthEarnings: 0,
    totalWithdrawn: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchEarnings();
      fetchEarningsSummary();
    }
  }, [user]);

  const fetchEarnings = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('earnings')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        setError(error.message);
      } else {
        setEarnings(data || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const fetchEarningsSummary = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Try to get data from Cuelinks API first
      const cuelinksData = await cuelinksAPI.getEarnings(user.id);
      
      if (cuelinksData) {
        setSummary(cuelinksData);
      } else {
        // Fallback to local database
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('total_earnings, available_balance, pending_earnings, total_withdrawn')
          .eq('user_id', user.id)
          .single();

        if (profile) {
          // Calculate this month's earnings
          const startOfMonth = new Date();
          startOfMonth.setDate(1);
          startOfMonth.setHours(0, 0, 0, 0);

          const { data: monthlyEarnings } = await supabase
            .from('earnings')
            .select('amount')
            .eq('user_id', user.id)
            .gte('transaction_date', startOfMonth.toISOString());

          const thisMonthTotal = monthlyEarnings?.reduce((sum, earning) => sum + earning.amount, 0) || 0;

          setSummary({
            totalEarnings: profile.total_earnings,
            availableBalance: profile.available_balance,
            pendingEarnings: profile.pending_earnings,
            thisMonthEarnings: thisMonthTotal,
            totalWithdrawn: profile.total_withdrawn,
          });
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const addEarning = async (earning: Omit<Earning, 'id' | 'user_id' | 'created_at'>) => {
    if (!user) return { error: 'No user found' };

    try {
      const { data, error } = await supabase
        .from('earnings')
        .insert({
          ...earning,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) {
        return { error: error.message };
      }

      setEarnings(prev => [data, ...prev]);
      await fetchEarningsSummary();

      // Create notification for new earning
      await supabase.from('notifications').insert({
        user_id: user.id,
        title: 'New Earning!',
        message: `You earned ₹${earning.amount} from ${earning.brand || 'affiliate commission'}!`,
        type: 'success',
      });

      return { data };
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'An error occurred' };
    }
  };

  return {
    earnings,
    summary,
    loading,
    error,
    addEarning,
    refetch: () => {
      fetchEarnings();
      fetchEarningsSummary();
    },
  };
}