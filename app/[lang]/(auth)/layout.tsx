import LoginNavbar from "../../components/login/LoginNavbar";
import SiteFooter from "../../components/SiteFooter";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <LoginNavbar />
      {children}
      <SiteFooter />
    </>
  );
}
