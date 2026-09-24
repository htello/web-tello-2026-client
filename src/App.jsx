import { Routes, Route, useParams } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext.jsx'
import Layout from './app/Layout.jsx'
import HomeHero from './features/home/HomeHero.jsx'
import PaintingView from './features/painting/PaintingView.jsx'
import CollectionGallery from './features/painting/components/CollectionGallery.jsx'
import ExhibitionList from './features/painting/components/ExhibitionList.jsx'
import BiographySection from './features/biography/BiographySection.jsx'
import DesignSubcategorySlider from './features/design/components/DesignSubcategorySlider.jsx'
import DesignGallery from './features/design/components/DesignGallery.jsx'
import IllustrationGallery from './features/illustration/components/IllustrationGallery.jsx'
import ContactForm from './features/contact/components/ContactForm.jsx'
import AdminLogin from './features/admin/components/AdminLogin.jsx'
import ForgotPasswordForm from './features/admin/components/ForgotPasswordForm.jsx'
import ResetPasswordForm from './features/admin/components/ResetPasswordForm.jsx'
import ProtectedRoute from './features/admin/components/ProtectedRoute.jsx'
import AdminLayout from './features/admin/AdminLayout.jsx'
import AdminDashboard from './features/admin/AdminDashboard.jsx'
import AdminSectionPlaceholder from './features/admin/AdminSectionPlaceholder.jsx'
import AdminCollections from './features/admin/AdminCollections.jsx'
import AdminPaintings from './features/admin/AdminPaintings.jsx'
import AdminExhibitions from './features/admin/AdminExhibitions.jsx'
import heroImage from './assets/prueba-camisa-1200.jpg'

function CollectionGalleryRoute() {
  const { id } = useParams()
  return <CollectionGallery collectionId={Number(id)} />
}

function DesignGalleryRoute() {
  const { subcategory } = useParams()
  return <DesignGallery subcategory={subcategory} />
}

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<HomeHero backgroundImage={heroImage} />} />
          <Route path="painting" element={<PaintingView />} />
          <Route path="painting/collections/:id" element={<CollectionGalleryRoute />} />
          <Route path="painting/exhibitions" element={<ExhibitionList />} />
          <Route path="biography" element={<BiographySection />} />
          <Route path="illustration" element={<IllustrationGallery />} />
          <Route path="design" element={<DesignSubcategorySlider />} />
          <Route path="design/:subcategory" element={<DesignGalleryRoute />} />
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
            <Route path="design" element={<AdminSectionPlaceholder title="Diseño" />} />
            <Route path="illustrations" element={<AdminSectionPlaceholder title="Ilustración" />} />
            <Route path="biography" element={<AdminSectionPlaceholder title="Biografía" />} />
            <Route path="users" element={<AdminSectionPlaceholder title="Usuarios" />} />
          </Route>
        </Route>
      </Routes>
    </AuthProvider>
  )
}

export default App
