import { Routes, Route, useParams } from 'react-router-dom'
import Layout from './app/Layout.jsx'
import HomeHero from './features/home/HomeHero.jsx'
import CollectionsSlider from './features/painting/components/CollectionsSlider.jsx'
import CollectionGallery from './features/painting/components/CollectionGallery.jsx'
import ExhibitionList from './features/painting/components/ExhibitionList.jsx'
import BiographySection from './features/biography/BiographySection.jsx'
import DesignSubcategorySlider from './features/design/components/DesignSubcategorySlider.jsx'
import DesignGallery from './features/design/components/DesignGallery.jsx'
import IllustrationGallery from './features/illustration/components/IllustrationGallery.jsx'
import ContactForm from './features/contact/components/ContactForm.jsx'
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
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomeHero backgroundImage={heroImage} />} />
        <Route path="painting" element={<CollectionsSlider />} />
        <Route path="painting/collections/:id" element={<CollectionGalleryRoute />} />
        <Route path="painting/exhibitions" element={<ExhibitionList />} />
        <Route path="biography" element={<BiographySection />} />
        <Route path="illustration" element={<IllustrationGallery />} />
        <Route path="design" element={<DesignSubcategorySlider />} />
        <Route path="design/:subcategory" element={<DesignGalleryRoute />} />
        <Route path="contact" element={<ContactForm />} />
      </Route>
    </Routes>
  )
}

export default App
