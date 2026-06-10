import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import Calendar from './pages/Calendar'
import Ideas from './pages/Ideas'
import Composer from './pages/Composer'
import Metrics from './pages/Metrics'
import Platform from './pages/Platform'
import Settings from './pages/Settings'

export default function App() {
  return (
    <div className="shell">
      <Sidebar />
      <main className="main">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/ideas" element={<Ideas />} />
          <Route path="/composer" element={<Composer />} />
          <Route path="/metrics" element={<Metrics />} />
          <Route path="/platform/:id" element={<Platform />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Dashboard />} />
        </Routes>
      </main>
    </div>
  )
}
