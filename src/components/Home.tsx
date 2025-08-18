import React from 'react'
import { Link } from 'react-router-dom'
import { Shield, AlertTriangle, Users, Search, BookOpen, FileText } from 'lucide-react'

const Home: React.FC = () => {
  const features = [
    {
      icon: AlertTriangle,
      title: 'Report Cybercrime',
      description: 'Submit reports for fraud, phishing, harassment, and deepfakes with secure file uploads.',
      link: '/report',
      color: 'bg-red-50 text-red-600',
    },
    {
      icon: Shield,
      title: 'Community Scam Wall',
      description: 'View real-time reports from the community to stay informed about latest threats.',
      link: '/scam-wall',
      color: 'bg-blue-50 text-blue-600',
    },
    {
      icon: Search,
      title: 'Fraud Lookup',
      description: 'Check if phone numbers, emails, or websites have been previously reported.',
      link: '/lookup',
      color: 'bg-yellow-50 text-yellow-600',
    },
    {
      icon: BookOpen,
      title: 'Awareness Hub',
      description: 'Read latest articles and tips on how to protect yourself from cybercrime.',
      link: '/awareness',
      color: 'bg-green-50 text-green-600',
    },
  ]

  const stats = [
    { label: 'Reports Submitted', value: '2,847' },
    { label: 'Threats Identified', value: '1,293' },
    { label: 'Community Members', value: '12,500' },
    { label: 'Awareness Articles', value: '48' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <Shield className="h-16 w-16 mx-auto mb-6 text-blue-200" />
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Protect Your Digital World
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto text-blue-100">
              Report cybercrimes, stay informed about threats, and help build a safer online community for everyone.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/report"
                className="inline-flex items-center px-8 py-4 border border-transparent rounded-lg text-lg font-medium text-blue-600 bg-white hover:bg-gray-50 transition-colors"
              >
                <AlertTriangle className="h-5 w-5 mr-2" />
                Report Cybercrime
              </Link>
              <Link
                to="/scam-wall"
                className="inline-flex items-center px-8 py-4 border border-white rounded-lg text-lg font-medium text-white hover:bg-blue-700 transition-colors"
              >
                <Users className="h-5 w-5 mr-2" />
                View Community Reports
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">How CyberGuard Helps</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Our comprehensive platform provides everything you need to report, track, and prevent cybercrime.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <Link
                  key={index}
                  to={feature.link}
                  className="bg-white p-8 rounded-xl shadow-md hover:shadow-xl transition-shadow border border-gray-100"
                >
                  <div className={`w-12 h-12 rounded-lg ${feature.color} flex items-center justify-center mb-6`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </Link>
              )
            })}
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Join our community in the fight against cybercrime. Every report helps protect others.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/auth"
              className="inline-flex items-center px-6 py-3 border border-transparent rounded-md text-base font-medium text-gray-900 bg-white hover:bg-gray-50 transition-colors"
            >
              <FileText className="h-5 w-5 mr-2" />
              Sign Up Today
            </Link>
            <Link
              to="/report"
              className="inline-flex items-center px-6 py-3 border border-gray-300 rounded-md text-base font-medium text-white hover:bg-gray-800 transition-colors"
            >
              Report Anonymously
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home