import { useState, useEffect } from "react";
import { fetchApi } from "@/services/api";

export function useFetch<T = unknown>(endpoint: string) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetchApi(endpoint)
      .then(setData)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [endpoint]);

  return { data, loading, error };
}