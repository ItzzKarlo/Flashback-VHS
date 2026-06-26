import '../styles/global.css';
import Navbar from '../components/Navbar';

export const metadata = {
  title: 'FlashbackVHS',
  description: 'Turn modern media into retro VHS-style art.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <div className="scanline-overlay" />
        <Navbar />
        <main>{children}</main>
      </body>
    </html>
  );
}
