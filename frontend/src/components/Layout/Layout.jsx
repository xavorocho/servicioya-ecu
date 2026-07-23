import Navbar from "./Navbar";
import Footer from "./Footer";
import Toast from "../UI/Toast";
import HelpButton from "../UI/HelpButton";

export default function Layout({ children }) {
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
