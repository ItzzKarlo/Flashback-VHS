'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

import { apiFetch } from '../lib/api';

export default function MaintenanceGate({ children }) {
  const pathname = usePathname();
  const [maintenance, setMaintenance] = useState(null);
  const allowed = pathname?.startsWith('/admin') || pathname?.startsWith('/login');

  useEffect(() => {
    let active = true;

    async function loadStatus() {
      try {
        const status = await apiFetch('/api/maintenance');
        if (active) setMaintenance(status);
      } catch {
        if (active) setMaintenance({ enabled: false });
      }
    }

    loadStatus();
    const timer = window.setInterval(loadStatus, 30000);
    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, []);

  if (maintenance?.enabled && !allowed) {
    return (
      <main>
        <section className="simple-page maintenance-page">
          <span className="eyebrow">Maintenance</span>
          <h1>Tracking needs a quick adjustment.</h1>
          <p>{maintenance.message || 'FlashbackVHS is briefly offline for maintenance.'}</p>
          <div className="hero-actions">
            <Link className="primary-button" href="/login">Admin login</Link>
            <Link className="secondary-button" href="/admin">Admin panel</Link>
          </div>
        </section>
      </main>
    );
  }

  return <main>{children}</main>;
}
