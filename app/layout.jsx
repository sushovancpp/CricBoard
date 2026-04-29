import './globals.css';

export const metadata = {
  title: 'Live Cricket Score',
  description: 'Real-time college cricket scoreboard',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@500;700&display=swap"
          rel="stylesheet"
        />
        <meta name="theme-color" content="#04150A" />
      </head>
      <body className="bg-pitch-950 text-white antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
