import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext.jsx'
import Navigation from './components/Navigation.jsx'
import Home from './components/Home.jsx'
import Auth from './components/Auth.jsx'
import ReportForm from './components/ReportForm.jsx'
import ScamWall from './components/ScamWall.jsx'
import FraudLookup from './components/FraudLookup.jsx'
import Articles from './components/Articles.jsx'
import Profile from './components/Profile.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
          <Navigation />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/report" element={<ReportForm />} />
            <Route path="/scam-wall" element={<ScamWall />} />
            <Route path="/lookup" element={<FraudLookup />} />
            <Route path="/awareness" element={<Articles />} />
            <Route path="/profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App
