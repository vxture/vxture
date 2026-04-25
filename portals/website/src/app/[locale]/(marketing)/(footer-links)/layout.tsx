import { Footer, Header } from '@/components/layout';

export default function FooterLinksLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer />
    </>
  );
}
