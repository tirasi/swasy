import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Heart, Shield, Brain, Users, Stethoscope, Activity, ChevronRight, Star, CheckCircle, ArrowRight, Sparkles, Zap, Globe, Award } from 'lucide-react';

export default function Index() {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);

  useEffect(() => {
    setIsVisible(true);
    const interval = setInterval(() => {
      setActiveFeature(prev => (prev + 1) % 4);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const features = [
    { icon: Brain, title: 'AI-Powered Diagnosis', desc: 'Advanced medical AI for accurate diagnostics' },
    { icon: Shield, title: 'HIPAA Compliant', desc: 'Enterprise-grade security & privacy' },
    { icon: Activity, title: 'Real-time Monitoring', desc: 'Continuous health tracking & alerts' },
    { icon: Users, title: 'Collaborative Care', desc: 'Seamless doctor-patient coordination' }
  ];

  const stats = [
    { value: '50K+', label: 'Patients Served', icon: Users },
    { value: '99.9%', label: 'Uptime', icon: Activity },
    { value: '24/7', label: 'Support', icon: Shield },
    { value: '150+', label: 'Specialists', icon: Stethoscope }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-lg border-b border-blue-100 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <Heart className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Swasth AI
              </span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-blue-600 transition-colors">Features</a>
              <a href="#about" className="text-gray-600 hover:text-blue-600 transition-colors">About</a>
              <a href="#contact" className="text-gray-600 hover:text-blue-600 transition-colors">Contact</a>
              <Button onClick={() => navigate('/login')} className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className={`space-y-8 ${isVisible ? 'animate-in slide-in-from-left duration-1000' : 'opacity-0'}`}>
              <div className="space-y-4">
                <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-blue-200">
                  <Sparkles className="h-4 w-4 mr-2" />
                  Next-Generation Healthcare Platform
                </Badge>
                <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
                  <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    Intelligent
                  </span>
                  <br />
                  <span className="text-gray-900">Healthcare</span>
                  <br />
                  <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    Reimagined
                  </span>
                </h1>
                <p className="text-xl text-gray-600 leading-relaxed max-w-2xl">
                  Experience the future of healthcare with our AI-powered platform. Seamless patient care, 
                  intelligent diagnostics, and real-time collaboration between patients, doctors, and pharmacies.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg" 
                  onClick={() => navigate('/login')} 
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-lg px-8 py-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Start Your Journey
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="text-lg px-8 py-6 rounded-xl border-2 border-blue-200 hover:border-blue-300 hover:bg-blue-50"
                >
                  Watch Demo
                  <Zap className="ml-2 h-5 w-5" />
                </Button>
              </div>

              <div className="flex items-center space-x-6 pt-4">
                <div className="flex items-center space-x-2">
                  <div className="flex -space-x-2">
                    {[1,2,3,4].map(i => (
                      <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 border-2 border-white" />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">Trusted by 50K+ patients</span>
                </div>
                <div className="flex items-center space-x-1">
                  {[1,2,3,4,5].map(i => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                  <span className="text-sm text-gray-600 ml-2">4.9/5 rating</span>
                </div>
              </div>
            </div>

            <div className={`relative ${isVisible ? 'animate-in slide-in-from-right duration-1000' : 'opacity-0'}`}>
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-3xl blur-3xl opacity-20 animate-pulse" />
                <div className="relative bg-white rounded-3xl shadow-2xl p-8 border border-blue-100">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-semibold text-gray-900">Patient Dashboard</h3>
                      <Badge className="bg-green-100 text-green-700">Live</Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      {stats.map((stat, i) => {
                        const Icon = stat.icon;
                        return (
                          <div key={i} className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
                            <Icon className="h-8 w-8 text-blue-600 mb-2" />
                            <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                            <div className="text-sm text-gray-600">{stat.label}</div>
                          </div>
                        );
                      })}
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-100">
                        <div className="flex items-center space-x-3">
                          <CheckCircle className="h-5 w-5 text-green-500" />
                          <span className="text-sm font-medium">Health Report Analyzed</span>
                        </div>
                        <Badge className="bg-blue-100 text-blue-700">AI</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-100">
                        <div className="flex items-center space-x-3">
                          <Activity className="h-5 w-5 text-blue-500" />
                          <span className="text-sm font-medium">Appointment Scheduled</span>
                        </div>
                        <Badge className="bg-green-100 text-green-700">Today</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="bg-blue-100 text-blue-700 mb-4">
              <Globe className="h-4 w-4 mr-2" />
              Advanced Features
            </Badge>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Revolutionizing Healthcare with
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"> AI Technology</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our comprehensive platform integrates cutting-edge AI, seamless workflows, and intuitive design 
              to deliver exceptional healthcare experiences.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <Card 
                  key={i} 
                  className={`group hover:shadow-xl transition-all duration-500 border-0 bg-gradient-to-br from-white to-blue-50 hover:from-blue-50 hover:to-indigo-50 ${
                    activeFeature === i ? 'ring-2 ring-blue-500 shadow-lg' : ''
                  }`}
                >
                  <CardContent className="p-8 text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                      <Icon className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center">
          <div className="space-y-8">
            <Badge className="bg-white/20 text-white border-white/30">
              <Award className="h-4 w-4 mr-2" />
              Trusted Healthcare Platform
            </Badge>
            <h2 className="text-4xl lg:text-5xl font-bold text-white leading-tight">
              Ready to Transform Your
              <br />
              Healthcare Experience?
            </h2>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              Join thousands of patients and healthcare providers who trust Swasth AI 
              for intelligent, secure, and efficient healthcare management.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                onClick={() => navigate('/login')} 
                className="bg-white text-blue-600 hover:bg-blue-50 text-lg px-8 py-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Get Started Now
                <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="text-white border-2 border-white/30 hover:bg-white/10 text-lg px-8 py-6 rounded-xl"
              >
                Schedule Demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                  <Heart className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold">Swasth AI</span>
              </div>
              <p className="text-gray-400">
                Intelligent healthcare platform powered by advanced AI technology.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Platform</h4>
              <div className="space-y-2 text-gray-400">
                <div>Patient Portal</div>
                <div>Doctor Dashboard</div>
                <div>Pharmacy System</div>
                <div>AI Analytics</div>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <div className="space-y-2 text-gray-400">
                <div>About Us</div>
                <div>Careers</div>
                <div>Privacy Policy</div>
                <div>Terms of Service</div>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <div className="space-y-2 text-gray-400">
                <div>Help Center</div>
                <div>Contact Us</div>
                <div>System Status</div>
                <div>Documentation</div>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Swasth AI. All rights reserved. Built with ❤️ for better healthcare.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
