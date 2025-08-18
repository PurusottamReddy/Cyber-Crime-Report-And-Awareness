import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import Navigation from './components/Navigation'
import Home from './components/Home'
import Auth from './components/Auth'
import ReportForm from './components/ReportForm'
import ScamWall from './components/ScamWall'
import FraudLookup from './components/FraudLookup'
import Awareness from './components/Awareness'

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