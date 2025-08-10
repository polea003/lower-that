import { useState } from 'react';
import WebcamCapture from './components/WebcamCapture';
import MostRecentImage from './components/MostRecentImage';
import Button from '@mui/material/Button';
import { apiUrl } from './lib/api';

export default function App() {
  const [description, setDescription] = useState('');
  const [analysis, setAnalysis] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onCapture = async (dataUrl: string) => {
    setError(null);
    const base64 = dataUrl.split(',')[1];
    const res = await fetch(apiUrl('/api/capture'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageBase64: base64 })
    });
    if (!res.ok) setError('Failed to save image');
  };

  const onAnalyze = async () => {
    setError(null);
    const res = await fetch(apiUrl('/api/analyze'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ description, imageBase64: null })
    });
    if (!res.ok) {
      setError('Validation error');
      setAnalysis(null);
      return;
    }
    const json = await res.json();
    setAnalysis(json);
  };

  return (
    <div className="min-h-full p-4 flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Lower-That</h1>
      <section className="flex gap-8 flex-wrap">
        <div>
          <h2 className="text-xl font-medium mb-2">Webcam</h2>
          <WebcamCapture onCapture={onCapture} />
        </div>
        <div>
          <h2 className="text-xl font-medium mb-2">Most Recent Image</h2>
          <MostRecentImage />
        </div>
      </section>
      <section>
        <h2 className="text-xl font-medium mb-2">Describe Content</h2>
        <div className="flex gap-2 items-center">
          <input
            aria-label="description"
            className="border rounded px-3 py-2 w-80"
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="e.g., loud action scene"
          />
          <Button variant="contained" color="success" onClick={onAnalyze}>Analyze</Button>
        </div>
        {error && <div role="alert" className="text-red-600 mt-2">{error}</div>}
        {analysis && (
          <pre className="bg-gray-100 rounded p-3 mt-3 max-w-xl overflow-auto text-sm">{JSON.stringify(analysis, null, 2)}</pre>
        )}
      </section>
    </div>
  );
}
