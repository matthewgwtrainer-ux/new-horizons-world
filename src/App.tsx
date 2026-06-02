import { Routes, Route } from 'react-router'
import LandingPage from './pages/LandingPage'
import WorldPage from './pages/WorldPage'
import TeacherPage from './pages/TeacherPage'

export default function App() {
  return (
    <div className="min-h-screen ocean-gradient">
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/world/:code" element={<WorldPage />} />
        <Route path="/teacher/:code" element={<TeacherPage />} />
      </Routes>
    </div>
  )
}
