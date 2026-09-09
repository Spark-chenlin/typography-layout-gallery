import { Route, Routes, useLocation } from 'react-router-dom';
import { SiteShell } from './components/SiteShell';
import { Gallery } from './pages/Gallery';
import { Detail } from './pages/Detail';
import { About } from './pages/About';
import { NotFound } from './pages/NotFound';

export function App() {
  const location = useLocation();
  return <SiteShell><Routes>
    <Route path="/" element={<Gallery />} />
    <Route path="/layouts/:id" element={<Detail key={location.pathname} />} />
    <Route path="/about" element={<About />} />
    <Route path="*" element={<NotFound />} />
  </Routes></SiteShell>;
}
