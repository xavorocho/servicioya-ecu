import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Layout from "./components/Layout/Layout";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import VerifyEmail from "./pages/VerifyEmail";
import PasswordRecovery from "./pages/PasswordRecovery";
import Catalog from "./pages/Catalog";
import ProviderProfile from "./pages/ProviderProfile";
import Help from "./pages/Help";
import ClientHome from "./pages/Client/ClientHome";
import ClientCatalog from "./pages/Client/ClientCatalog";
import ClientRequests from "./pages/Client/ClientRequests";
import ClientProfile from "./pages/Client/ClientProfile";
import RequestForm from "./pages/Client/RequestForm";
import QuoteView from "./pages/Client/QuoteView";
import ProviderHome from "./pages/Provider/ProviderHome";
import ProviderRequests from "./pages/Provider/ProviderRequests";
import ProviderProfileEdit from "./pages/Provider/ProviderProfileEdit";
import ProviderDocuments from "./pages/Provider/ProviderDocuments";
import QuoteForm from "./pages/Provider/QuoteForm";
import NewQuoteForm from "./pages/Provider/NewQuoteForm";
import AdminHome from "./pages/Admin/AdminHome";
import AdminVerifications from "./pages/Admin/AdminVerifications";
import AdminUsers from "./pages/Admin/AdminUsers";
import AdminProviders from "./pages/Admin/AdminProviders";
import AdminCategories from "./pages/Admin/AdminCategories";
import AdminReports from "./pages/Admin/AdminReports";
import AdminRequests from "./pages/Admin/AdminRequests";
import AdminSupport from "./pages/Admin/AdminSupport";
import AdminSpecialtyReviews from "./pages/Admin/AdminSpecialtyReviews";
import ProviderWorkDetail from "./pages/Provider/ProviderWorkDetail";
import ClientRequestDetail from "./pages/Client/ClientRequestDetail";
import ClientPublicProfile from "./pages/Client/ClientPublicProfile";
import ProtectedRoute from "./components/Layout/ProtectedRoute";

export default function App() {
  const { user, loading } = useAuth();

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin h-10 w-10 border-4 border-blue-600 border-t-transparent rounded-full" /></div>;

  return (
    <Layout>
      <Routes>
        <Route path="/" element={user ? <Navigate to={`/${user.role}/inicio`} /> : <Home />} />
        <Route path="/login" element={user ? <Navigate to={`/${user.role}/inicio`} /> : <Login />} />
        <Route path="/registro" element={user ? <Navigate to={`/${user.role}/inicio`} /> : <Register />} />
        <Route path="/verificar-email" element={<VerifyEmail />} />
        <Route path="/recuperar-contrasena" element={<PasswordRecovery />} />
        <Route path="/restablecer-contrasena" element={<PasswordRecovery reset />} />
        <Route path="/catalogo" element={<Catalog />} />
        <Route path="/perfil/:id" element={<ProviderProfile />} />
        <Route path="/ayuda" element={<Help />} />

        <Route path="/cliente/inicio" element={<ProtectedRoute role="cliente"><ClientHome /></ProtectedRoute>} />
        <Route path="/cliente/catalogo" element={<ProtectedRoute role="cliente"><ClientCatalog /></ProtectedRoute>} />
        <Route path="/cliente/solicitar/:id" element={<ProtectedRoute role="cliente"><RequestForm /></ProtectedRoute>} />
        <Route path="/cliente/solicitudes" element={<ProtectedRoute role="cliente"><ClientRequests /></ProtectedRoute>} />
        <Route path="/cliente/cotizacion/:requestId" element={<ProtectedRoute role="cliente"><QuoteView /></ProtectedRoute>} />
        <Route path="/cliente/solicitud/:requestId" element={<ProtectedRoute role="cliente"><ClientRequestDetail /></ProtectedRoute>} />
        <Route path="/cliente/perfil" element={<ProtectedRoute role="cliente"><ClientProfile /></ProtectedRoute>} />

        <Route path="/proveedor/inicio" element={<ProtectedRoute role="proveedor"><ProviderHome /></ProtectedRoute>} />
        <Route path="/proveedor/solicitudes" element={<ProtectedRoute role="proveedor"><ProviderRequests /></ProtectedRoute>} />
        <Route path="/proveedor/solicitud/:requestId" element={<ProtectedRoute role="proveedor"><ProviderWorkDetail /></ProtectedRoute>} />
        <Route path="/proveedor/cotizar/:requestId" element={<ProtectedRoute role="proveedor"><QuoteForm /></ProtectedRoute>} />
        <Route path="/proveedor/nueva-cotizacion/:requestId" element={<ProtectedRoute role="proveedor"><NewQuoteForm /></ProtectedRoute>} />
        <Route path="/proveedor/perfil" element={<ProtectedRoute role="proveedor"><ProviderProfileEdit /></ProtectedRoute>} />
        <Route path="/proveedor/cliente/:email" element={<ProtectedRoute role="proveedor"><ClientPublicProfile /></ProtectedRoute>} />
        <Route path="/proveedor/documentos" element={<ProtectedRoute role="proveedor"><ProviderDocuments /></ProtectedRoute>} />

        <Route path="/admin/inicio" element={<ProtectedRoute role="admin"><AdminHome /></ProtectedRoute>} />
        <Route path="/admin/solicitudes" element={<ProtectedRoute role="admin"><AdminRequests /></ProtectedRoute>} />
        <Route path="/admin/verificaciones" element={<ProtectedRoute role="admin"><AdminVerifications /></ProtectedRoute>} />
        <Route path="/admin/usuarios" element={<ProtectedRoute role="admin"><AdminUsers /></ProtectedRoute>} />
        <Route path="/admin/proveedores" element={<ProtectedRoute role="admin"><AdminProviders /></ProtectedRoute>} />
        <Route path="/admin/categorias" element={<ProtectedRoute role="admin"><AdminCategories /></ProtectedRoute>} />
        <Route path="/admin/reportes" element={<ProtectedRoute role="admin"><AdminReports /></ProtectedRoute>} />
        <Route path="/admin/soporte" element={<ProtectedRoute role="admin"><AdminSupport /></ProtectedRoute>} />
        <Route path="/admin/especialidades" element={<ProtectedRoute role="admin"><AdminSpecialtyReviews /></ProtectedRoute>} />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Layout>
  );
}
