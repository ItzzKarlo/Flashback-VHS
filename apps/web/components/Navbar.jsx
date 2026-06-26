import Link from 'next/link';

export default function Navbar() {
  return (
    <header className="nav-shell">
      <Link href="/" className="brand">
        <span className="brand-mark">VHS</span>
        <span>FlashbackVHS</span>
      </Link>

      <nav className="nav-links">
        <Link href="/upload">Create</Link>
        <Link href="/gallery">Gallery</Link>
        <Link href="/account">Account</Link>
        <Link href="/login">Login</Link>
      </nav>
    </header>
  );
}
