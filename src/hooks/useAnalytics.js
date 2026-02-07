import { useState, useEffect } from 'react';

export const useAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/analytics/user', {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch analytics');
      }

      const data = await response.json();
      if (data.success) {
        setAnalytics(data.data);
      } else {
        throw new Error(data.message || 'Failed to fetch analytics');
      }
    } catch (err) {
      setError(err.message);
      console.error('Analytics fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const trackView = async (username) => {
    try {
      await fetch('/api/analytics/track-view', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username })
      });
    } catch (err) {
      console.error('Error tracking view:', err);
    }
  };

  const trackClick = async (username, linkType) => {
    try {
      await fetch('/api/analytics/track-click', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, linkType })
      });
    } catch (err) {
      console.error('Error tracking click:', err);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  return {
    analytics,
    loading,
    error,
    refetch: fetchAnalytics,
    trackView,
    trackClick
  };
};
