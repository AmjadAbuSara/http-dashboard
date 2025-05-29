import { useEffect, useState } from "react";

const API_URL = "https://postposted-occurred-dg-carol.trycloudflare.com/dashboard-data/";

export const useDashboardData = () => {
  const [data, setData] = useState(null);
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const res = await fetch(API_URL);
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 5000);
    return () => clearInterval(interval);
  }, []);

  return { data, isLoading, error, refetch: fetchDashboardData };
};
