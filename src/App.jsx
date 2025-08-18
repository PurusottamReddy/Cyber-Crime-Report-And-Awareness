import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext.jsx'
import Navigation from './components/Navigation.jsx'
import Home from './components/Home.jsx'
import Auth from './components/Auth.jsx'
import ReportForm from './components/ReportForm.jsx'
import ScamWall from './components/ScamWall.jsx'
import FraudLookup from './components/FraudLookup.jsx'
import Awareness from './components/Awareness.jsx'

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Navigation />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/report" element={<ReportForm />} />
            <Route path="/scam-wall" element={<ScamWall />} />
            <Route path="/lookup" element={<FraudLookup />} />
            <Route path="/awareness" element={<Awareness />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App
