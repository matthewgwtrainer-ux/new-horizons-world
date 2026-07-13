import { Routes, Route } from 'react-router'
import LandingPage from './pages/LandingPage'
import IntroductionPage from './pages/IntroductionPage'
import WorldPage from './pages/WorldPage'
import TeacherPage from './pages/TeacherPage'
import CardsPage from './pages/CardsPage'
import MapPage from './pages/MapPage'

export default function App() {
  return (
    <div className="min-h-screen ocean-gradient">
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/introduction" element={<IntroductionPage />} />
        <Route path="/cards" element={<CardsPage />} />
        <Route path="/map" element={<MapPage />} />
        <Route path="/world/:code" element={<WorldPage />} />
        <Route path="/teacher/:code" element={<TeacherPage />} />
      </Routes>
    </div>
  )
}
