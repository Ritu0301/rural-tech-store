import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { cuelinksAPI } from '../lib/cuelinks';

export interface AffiliateLink {
  id: string;
  user_id: string;
  original_url: string;
  affiliate_url: string;
  brand: string | null;
  product_name: string | null;
  commission_rate: number | null;
  clicks: number;
  conversions: number;
  earnings: number;
  created_at: string;
  updated_at: string;
}

export function useAffiliateLinks() {
  const { user } = useAuth();
  const [links, setLinks] = useState<AffiliateLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchLinks();
    }
  }, [user]);

  const fetchLinks = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('affiliate_links')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        setError(error.message);
      } else {
        setLinks(data || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const generateLink = async (originalUrl: string, productName?: string) => {
    if (!user) return { error: 'No user found' };

    try {
      // Generate affiliate link using Cuelinks API
      const affiliateData = await cuelinksAPI.generateAffiliateLink(originalUrl);
      
      if (!affiliateData) {
        return { error: 'Failed to generate affiliate link' };
      }

      // Save to database
      const { data, error } = await supabase
        .from('affiliate_links')
        .insert({
          user_id: user.id,
          original_url: originalUrl,
          affiliate_url: affiliateData.affiliateUrl,
          brand: affiliateData.brand,
          product_name: productName,
          commission_rate: affiliateData.commissionRate,
        })
        .select()
        .single();

      if (error) {
        return { error: error.message };
      }

      setLinks(prev => [data, ...prev]);

      // Create notification
      await supabase.from('notifications').insert({
        user_id: user.id,
        title: 'Affiliate Link Generated',
        message: `New affiliate link created for ${affiliateData.brand || 'product'}`,
        type: 'success',
      });

      return { data };
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'An error occurred' };
    }
  };

  const updateLinkStats = async (linkId: string, clicks?: number, conversions?: number, earnings?: number) => {
    if (!user) return { error: 'No user found' };

    try {
      const updates: any = { updated_at: new Date().toISOString() };
      if (clicks !== undefined) updates.clicks = clicks;
      if (conversions !== undefined) updates.conversions = conversions;
      if (earnings !== undefined) updates.earnings = earnings;

      const { data, error } = await supabase
        .from('affiliate_links')
        .update(updates)
        .eq('id', linkId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        return { error: error.message };
      }

      setLinks(prev => prev.map(link => link.id === linkId ? data : link));
      return { data };
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'An error occurred' };
    }
  };

  return {
    links,
    loading,
    error,
    generateLink,
    updateLinkStats,
    refetch: fetchLinks,
  };
}