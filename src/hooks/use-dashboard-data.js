import useSWR from "swr";

const API_URL = "https://britain-agreements-approved-went.trycloudflare.com/dashboard-data/";

const fetcher = async (url) => {
  const res = await fetch(url);
  if (!res.ok) {
    const error = new Error("Failed to fetch");
    error.status = res.status;
    throw error;
  }
  return res.json();
};

export const useDashboardData = () => {
  const {
    data,
    error,
    isLoading,
    mutate: refetch
  } = useSWR(API_URL, fetcher, {
    refreshInterval: 5000,       // auto refresh every 5s
    revalidateOnFocus: true,     // refetch on window/tab focus
    revalidateIfStale: false,    // skip if cached is recent
    shouldRetryOnError: true     // retry on error
  });

  return {
    data,
    isLoading,
    error,
    refetch
  };
};
