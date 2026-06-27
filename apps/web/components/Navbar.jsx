import Link from 'next/link';

import ThemeToggle from './ThemeToggle';

export default function Navbar() {
  return (
    <header className="nav-shell">
      <Link href="/" className="brand">
        <span className="brand-mark">
          <img src="/icon.png" alt="" />
        </span>
        <span>FlashbackVHS</span>
      </Link>

      <div className="nav-actions">
        <nav className="nav-links">
          <Link href="/upload">Create</Link>
          <Link href="/gallery">Gallery</Link>
          <Link href="/stats">Stats</Link>
          <Link href="/admin">Admin</Link>
          <Link href="/account">Account</Link>
          <Link href="/login">Login</Link>
        </nav>
        <ThemeToggle />
      </div>
    </header>
  );
}
