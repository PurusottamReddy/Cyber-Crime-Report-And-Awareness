import React from 'react'
import { Link } from 'react-router-dom'
import { Shield, AlertTriangle, Users, Search, BookOpen, FileText } from 'lucide-react'
import cybersecurityBg from '../assets/cybersecurity-bg.svg'

const Home = () => {
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section with Background */}
      <div className="relative">
        {/* Background Image - Only for hero section */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url(${cybersecurityBg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        />
        
        {/* Overlay for better text readability */}
        <div className="absolute inset-0 bg-black bg-opacity-20"></div>
        
        {/* Hero Content */}
        <div className="relative z-10 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
            <div className="text-center">
              <Shield className="h-16 w-16 mx-auto mb-6 text-blue-200" />
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                Protect Your Digital World
              </h1>
              <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto">
                Report scams, share security insights, and stay informed about the latest cyber threats
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/report"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg text-lg font-semibold transition-colors"
                >
                  Report a Scam
                </Link>
                <Link
                  to="/awareness"
                  className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-gray-900 px-8 py-3 rounded-lg text-lg font-semibold transition-colors"
                >
                  Learn More
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              How We Help You Stay Safe
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Comprehensive tools and resources to protect yourself online
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <Link
                  key={index}
                  to={feature.link}
                  className="bg-gray-50 dark:bg-gray-700 p-8 rounded-xl shadow-md hover:shadow-xl transition-shadow border border-gray-100 dark:border-gray-600"
                >
                  <div className={`w-12 h-12 rounded-lg ${feature.color} flex items-center justify-center mb-6`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">{feature.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{feature.description}</p>
                </Link>
              )
            })}
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-16 bg-blue-600 dark:bg-blue-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            {stats.map((stat, index) => (
              <div key={index}>
                <div className="text-3xl font-bold text-white mb-2">{stat.value}</div>
                <div className="text-blue-100">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Ready to Take Action?
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
            Join thousands of users who are already protecting themselves and others from online threats
          </p>
          <Link
            to="/report"
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg text-lg font-semibold transition-colors"
          >
            Get Started Today
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Home
