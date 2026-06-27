import '../styles/global.css';
import Navbar from '../components/Navbar';

export const metadata = {
  title: 'FlashbackVHS',
  description: 'Turn modern media into retro VHS-style art.',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon.png', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-icon.png', type: 'image/png' },
    ],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-theme="dark" style={{ colorScheme: 'dark' }} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
try {
  var theme = localStorage.getItem('flashbackvhs.theme');
  if (theme !== 'light' && theme !== 'dark') {
    theme = window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  }
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
} catch (error) {
  document.documentElement.dataset.theme = 'dark';
  document.documentElement.style.colorScheme = 'dark';
}
            `.trim(),
          }}
        />
      </head>
      <body>
        <div className="scanline-overlay" />
        <Navbar />
        <main>{children}</main>
        <footer className="site-footer">
          <span>© 2026 Karlo Cavlovic. FlashbackVHS.</span>
          <nav aria-label="Footer links">
            <a href="https://www.karlo-cavlovic.dev/" target="_blank" rel="noreferrer">
              karlo-cavlovic.dev
            </a>
            <a href="https://github.com/ItzzKarlo/Flashback-VHS" target="_blank" rel="noreferrer">
              GitHub
            </a>
          </nav>
        </footer>
      </body>
    </html>
  );
}
