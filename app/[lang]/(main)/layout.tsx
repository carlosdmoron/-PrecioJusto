import Navbar from "../../components/Navbar";
import SiteFooter from "../../components/SiteFooter";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      {children}
      <SiteFooter />
    </>
  );
}
