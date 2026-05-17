import { useEffect, useState } from 'react';
import type { Manifest } from '@/types';

interface UseManifestResult {
  manifest: Manifest | null;
  loading: boolean;
  error: Error | null;
}

export function useManifest(): UseManifestResult {
  const [manifest, setManifest] = useState<Manifest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetch(`${import.meta.env.BASE_URL}data/manifest.json`)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data: Manifest) => {
        if (!cancelled) {
          setManifest(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error(String(err)));
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { manifest, loading, error };
}
