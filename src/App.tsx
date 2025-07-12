// src/App.tsx
import { Route, Routes } from 'react-router-dom';
import BuilderPage from './pages/BuilderPage';
import LandingPage from './pages/LandingPage';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/builder" element={<BuilderPage />} />
    </Routes>
  );
}
