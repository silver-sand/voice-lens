import { Header } from './Header';
import { Footer } from './Footer';

interface PageLayoutProps {
  children: React.ReactNode;
  showHeader?: boolean;
  showFooter?: boolean;
}

export function PageLayout({
  children,
  showHeader = true,
  showFooter = true,
}: PageLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      {showHeader && <Header />}
      <main className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12" role="main">
        {children}
      </main>
      {showFooter && <Footer />}
    </div>
  );
}