'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

import { apiFetch, apiUrl } from '../../../lib/api';

export default function RenderJobPage() {
  const params = useParams();
  const jobId = params.jobId;
  const [job, setJob] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!jobId) return;

    apiFetch(`/api/render/${jobId}`)
      .then(setJob)
      .catch((err) => setError(err.message));
  }, [jobId]);

  return (
    <section className="simple-page">
      <span className="eyebrow">Render</span>
      <h1>Render job</h1>

      {error && <div className="alert error">{error}</div>}

      {job && (
        <div className="panel render-result">
          <strong>{job.output_filename}</strong>
          <small>Status: {job.status}</small>
          <small>Preset: {job.preset}</small>
          <small>Format: {job.output_format}</small>
          {job.download_url && (
            <a className="primary-button" href={apiUrl(job.download_url)}>Download render</a>
          )}
        </div>
      )}
    </section>
  );
}
