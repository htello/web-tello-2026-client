import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext.jsx'
import Layout from './app/Layout.jsx'
import HomeHero from './features/home/HomeHero.jsx'
import PaintingSection from './features/painting/PaintingSection.jsx'
import ExhibitionList from './features/painting/components/ExhibitionList.jsx'
import BiographySection from './features/biography/BiographySection.jsx'
import DesignSection from './features/design/DesignSection.jsx'
import IllustrationSection from './features/illustration/IllustrationSection.jsx'
import ContactForm from './features/contact/components/ContactForm.jsx'
import AdminLogin from './features/admin/components/AdminLogin.jsx'
import ForgotPasswordForm from './features/admin/components/ForgotPasswordForm.jsx'
import ResetPasswordForm from './features/admin/components/ResetPasswordForm.jsx'
import ProtectedRoute from './features/admin/components/ProtectedRoute.jsx'
import AdminLayout from './features/admin/AdminLayout.jsx'
import AdminDashboard from './features/admin/AdminDashboard.jsx'
import AdminUsers from './features/admin/AdminUsers.jsx'
import AdminCollections from './features/admin/AdminCollections.jsx'
import AdminPaintings from './features/admin/AdminPaintings.jsx'
import AdminExhibitions from './features/admin/AdminExhibitions.jsx'
import AdminDesign from './features/admin/AdminDesign.jsx'
import AdminIllustrations from './features/admin/AdminIllustrations.jsx'
import AdminBiography from './features/admin/AdminBiography.jsx'
import heroImage from './assets/prueba-camisa-1200.jpg'

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<HomeHero backgroundImage={heroImage} />} />
          <Route path="painting" element={<PaintingSection />} />
          <Route path="painting/exhibitions" element={<ExhibitionList />} />
          <Route path="biography" element={<BiographySection />} />
          <Route path="illustration" element={<IllustrationSection />} />
          <Route path="design" element={<DesignSection />} />
          <Route path="contact" element={<ContactForm />} />
        </Route>
        <Route path="admin/login" element={<AdminLogin />} />
        <Route path="admin/forgot-password" element={<ForgotPasswordForm />} />
        <Route path="reset-password" element={<ResetPasswordForm />} />
        <Route path="admin" element={<ProtectedRoute />}>
          <Route element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="collections" element={<AdminCollections />} />
            <Route path="paintings" element={<AdminPaintings />} />
            <Route path="exhibitions" element={<AdminExhibitions />} />
            <Route path="design" element={<AdminDesign />} />
            <Route path="illustrations" element={<AdminIllustrations />} />
            <Route path="biography" element={<AdminBiography />} />
            <Route path="users" element={<AdminUsers />} />
          </Route>
        </Route>
      </Routes>
    </AuthProvider>
  )
}

export default App
