import './globals.css';

export const metadata = {
  title: '日本語マスター · Nihongo Master (Aprende Japonés)',
  description: 'Plataforma interactiva para aprender japonés general basada en materiales de estudio, historias con furigana, práctica con teclado IME, partículas, kanjis y reproductor de voz con controles avanzados.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Noto+Sans+JP:wght@400;500;700;900&display=swap" rel="stylesheet" />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
