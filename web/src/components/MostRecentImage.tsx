import { useEffect, useState } from 'react';
import { apiUrl } from '../lib/api';

export default function MostRecentImage() {
  const [url, setUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let revoked: string | null = null;
    async function load() {
      try {
        const res = await fetch(apiUrl('/api/image/latest'));
        if (!res.ok) throw new Error('Not found');
        const blob = await res.blob();
        const objectUrl = URL.createObjectURL(blob);
        revoked = objectUrl;
        setUrl(objectUrl);
      } catch (err) {
        setError('No recent image');
      }
    }
    void load();
    return () => {
      if (revoked) URL.revokeObjectURL(revoked);
    };
  }, []);

  if (error) return <div className="text-gray-500">{error}</div>;
  if (!url) return <div className="text-gray-500">Loading...</div>;
  return <img src={url} alt="Most recent" className="rounded border max-w-md" />;
}
