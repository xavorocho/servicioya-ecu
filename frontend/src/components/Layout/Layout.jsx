import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import Toast from "../UI/Toast";
import HelpButton from "../UI/HelpButton";

export default function Layout({ children }) {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname]);

  return (
    <div className="min-h-screen flex flex-col">
      <a className="skip-link" href="#main-content">Saltar al contenido principal</a>
      <Navbar />
      <main id="main-content" className="flex-1 outline-none" tabIndex="-1">
        {children}
      </main>
      <Footer />
      <Toast />
      <HelpButton />
    </div>
  );
}
