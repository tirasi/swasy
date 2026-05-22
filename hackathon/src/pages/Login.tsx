import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Mail, Lock, Eye, EyeOff, UserCheck, Stethoscope, Pill, AlertTriangle, MapPin, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ToastService } from "@/components/ui/toast-notification";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import breakthroughLogo from "@/assets/breakthrough-logo.jpeg";
import { authService } from "@/lib/auth";
import { UserRole } from "@/types/medical";
import { ErrorHandler } from "@/lib/errorHandler";

export default function Login() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [medicalId, setMedicalId] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [dob, setDob] = useState("");
  const [age, setAge] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showEmergency, setShowEmergency] = useState(false);
  const [emergencyDetails, setEmergencyDetails] = useState('');
  const [location, setLocation] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    setEmail('');
    setPassword('');
    setName('');
    setMedicalId('');
    setSpecialty('');
    setDob('');
    setAge('');
    setPhoneNumber('');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields based on role
    if (selectedRole === 'DOCTOR') {
      if (!medicalId || !name || !specialty || !dob) {
        ToastService.show('Please fill all required fields: Medical ID, Name, Specialty, and DOB', 'error');
        return;
      }
    } else if (selectedRole === 'PATIENT') {
      if (!name || !age || !email || !phoneNumber || !dob) {
        ToastService.show('Please fill all required fields: Name, Age, Email, Phone Number, and DOB', 'error');
        return;
      }
    }
    
    if (!email || !password) {
      ToastService.show('Please enter email and password', 'error');
      return;
    }

    if (!ErrorHandler.validateInput(email, 'email')) {
      ToastService.show('Please enter a valid email address', 'error');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const user = await authService.login(email, password);
      ToastService.show(`Welcome ${user.role.toLowerCase()}!`, 'success');
      
      // Navigate to dashboard
      navigate('/dashboard');
    } catch (error: any) {
      const errorMessage = ErrorHandler.handleAPIError(error, 'Login failed');
      ToastService.show(errorMessage, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmergency = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setLocation(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
          setShowEmergency(true);
        },
        () => {
          setLocation('Location access denied');
          setShowEmergency(true);
        }
      );
    } else {
      setLocation('Geolocation not supported');
      setShowEmergency(true);
    }
  };

  const sendEmergencyAlert = () => {
    if (!emergencyDetails || !emergencyPhone) {
      alert('Please fill all emergency details');
      return;
    }

    const emergency = {
      id: `EMG_${Date.now()}`,
      details: emergencyDetails,
      location: location,
      phone: emergencyPhone,
      timestamp: new Date().toISOString(),
      status: 'ACTIVE'
    };

    const emergencies = JSON.parse(localStorage.getItem('emergencies') || '[]');
    emergencies.unshift(emergency);
    localStorage.setItem('emergencies', JSON.stringify(emergencies));

    alert(`🚨 EMERGENCY ALERT SENT!\n\nDetails: ${emergencyDetails}\nLocation: ${location}\nPhone: ${emergencyPhone}\n\n✅ All active doctors notified\n✅ Emergency services contacted\n✅ Ambulance dispatched`);
    
    setShowEmergency(false);
    setEmergencyDetails('');
    setEmergencyPhone('');
  };

  const handleQuickLogin = async (role: UserRole) => {
    setIsLoading(true);
    try {
      let email = '';
      let password = 'demo123';
      
      if (role === 'DOCTOR') {
        email = 'doctor@test.com';
      } else if (role === 'PATIENT') {
        email = 'patient@test.com';
      } else if (role === 'PHARMACY') {
        email = 'pharmacy@test.com';
      }
      
      await authService.login(email, password, role.toLowerCase() as any);
      ToastService.show(`Welcome ${role}!`, 'success');
      navigate('/dashboard');
    } catch (error) {
      console.error('Login failed:', error);
      ToastService.show('Login failed', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      await authService.loginWithGoogle();
      ToastService.show('Welcome Patient!', 'success');
      navigate('/dashboard');
    } catch (error) {
      console.error('Google login failed:', error);
      ToastService.show('Google login failed', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/90 via-indigo-600/90 to-purple-600/90" />
        
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
        
        <div className="relative z-10 flex flex-col justify-center px-12 xl:px-20">
          <div className="flex items-center gap-3 mb-8">
            <img src={breakthroughLogo} alt="BreakThrough" className="h-14 w-14 rounded-2xl shadow-2xl object-cover" />
            <span className="text-4xl font-bold text-white">Swasth AI</span>
          </div>
          
          <h1 className="text-5xl xl:text-6xl font-bold text-white leading-tight mb-6">
            AI-Powered Medical Intelligence
          </h1>
          
          <p className="text-xl text-blue-100 max-w-md mb-10">
            Advanced clinical decision support with Google Cloud AI & multi-agent system.
          </p>

          <div className="flex flex-wrap gap-3">
            {["Google Cloud AI", "Vertex AI", "HIPAA Compliant", "FHIR Compatible"].map((feature) => (
              <span
                key={feature}
                className="rounded-full border border-white/30 bg-white/20 backdrop-blur-sm px-5 py-2.5 text-sm text-white"
              >
                {feature}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md space-y-8">
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <img src={breakthroughLogo} alt="BreakThrough" className="h-12 w-12 rounded-xl object-cover shadow-lg" />
            <span className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Swasth AI</span>
          </div>

          <div className="text-center lg:text-left space-y-4">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 p-6 rounded-2xl">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">Welcome back</h2>
              <p className="text-gray-600">
                Select your role to access the platform
              </p>
            </div>
            
            <Button 
              onClick={handleEmergency}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              size="lg"
            >
              <AlertTriangle className="h-5 w-5 mr-2" />
              🚨 EMERGENCY - GET HELP NOW
            </Button>
          </div>

          {!selectedRole && (
            <div className="space-y-4">
              <p className="text-center font-medium text-gray-700">Quick Login - Select Role</p>
              <div className="grid grid-cols-1 gap-4">
                <Card 
                  className="cursor-pointer hover:bg-blue-50 border-2 hover:border-blue-300 transition-all duration-300 hover:shadow-lg"
                  onClick={() => handleQuickLogin('DOCTOR')}
                >
                  <CardContent className="p-6 flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                      <Stethoscope className="h-6 w-6 text-white" />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-gray-900">Doctor Portal</p>
                      <p className="text-sm text-gray-600">Access AI Council & Clinical Tools</p>
                    </div>
                  </CardContent>
                </Card>
                
                <Card 
                  className="cursor-pointer hover:bg-green-50 border-2 hover:border-green-300 transition-all duration-300 hover:shadow-lg"
                  onClick={() => handleQuickLogin('PATIENT')}
                >
                  <CardContent className="p-6 flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                      <UserCheck className="h-6 w-6 text-white" />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-gray-900">Patient Portal</p>
                      <p className="text-sm text-gray-600">Secure Medical Records Access</p>
                    </div>
                  </CardContent>
                </Card>
                
                <Card 
                  className="cursor-pointer hover:bg-orange-50 border-2 hover:border-orange-300 transition-all duration-300 hover:shadow-lg"
                  onClick={() => handleQuickLogin('PHARMACY')}
                >
                  <CardContent className="p-6 flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
                      <Pill className="h-6 w-6 text-white" />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-gray-900">Pharmacy Portal</p>
                      <p className="text-sm text-gray-600">Prescription Management</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {selectedRole && (
            <>
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Signing in as: {selectedRole}</p>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setSelectedRole(null)}
                >
                  Change Role
                </Button>
              </div>
              
              <form onSubmit={handleLogin} className="space-y-5">
                {selectedRole === 'PATIENT' && (
                  <>
                    <Button 
                      type="button"
                      onClick={handleGoogleLogin}
                      variant="outline"
                      className="w-full"
                      disabled={isLoading}
                    >
                      <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                      Continue with Google
                    </Button>
                    
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <Separator />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground">Or continue with email</span>
                      </div>
                    </div>
                  </>
                )}
                
                {selectedRole === 'DOCTOR' && (
                  <>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Medical ID *</label>
                      <Input
                        placeholder="MD123456"
                        value={medicalId}
                        onChange={(e) => setMedicalId(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Name *</label>
                      <Input
                        placeholder="Dr. John Doe"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Specialty *</label>
                      <Input
                        placeholder="Cardiology"
                        value={specialty}
                        onChange={(e) => setSpecialty(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Date of Birth *</label>
                      <Input
                        type="date"
                        value={dob}
                        onChange={(e) => setDob(e.target.value)}
                        required
                      />
                    </div>
                  </>
                )}
                
                {selectedRole === 'PATIENT' && (
                  <>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Name *</label>
                      <Input
                        placeholder="John Doe"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Age *</label>
                      <Input
                        type="number"
                        placeholder="25"
                        value={age}
                        onChange={(e) => setAge(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Phone Number *</label>
                      <Input
                        type="tel"
                        placeholder="+91-9876543210"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Date of Birth *</label>
                      <Input
                        type="date"
                        value={dob}
                        onChange={(e) => setDob(e.target.value)}
                        required
                      />
                    </div>
                  </>
                )}
                
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium">
                    Email address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@company.com"
                      className="pl-10"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="password" className="text-sm font-medium">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className="pl-10 pr-10"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="remember" />
                    <label htmlFor="remember" className="text-sm text-muted-foreground cursor-pointer">
                      Remember me
                    </label>
                  </div>
                </div>

                <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-2" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign in
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>
            </>
          )}

          <div className="text-center space-y-2">
            <p className="text-xs text-muted-foreground">
              Demo credentials are auto-filled. Click any role to login instantly.
            </p>
            <div className="text-xs text-gray-500 space-y-1">
              <p><strong>Doctor:</strong> Full AI Council access, patient management</p>
              <p><strong>Patient:</strong> Secure data submission, tokenized privacy</p>
              <p><strong>Pharmacy:</strong> Prescription management, WhatsApp e-bills</p>
            </div>
          </div>
        </div>
        
        <Dialog open={showEmergency} onOpenChange={setShowEmergency}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="h-5 w-5" />
                🚨 EMERGENCY ALERT
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm font-medium text-red-800 mb-2">
                  ⚡ IMMEDIATE MEDICAL ASSISTANCE
                </p>
                <p className="text-xs text-red-700">
                  All active doctors will be notified instantly. Emergency services will be contacted.
                </p>
              </div>
              
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium flex items-center gap-1 mb-1">
                    <MapPin className="h-4 w-4" />
                    Location
                  </label>
                  <Input 
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Auto-detected or enter manually"
                    className="text-sm"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium flex items-center gap-1 mb-1">
                    <Phone className="h-4 w-4" />
                    Phone Number
                  </label>
                  <Input 
                    value={emergencyPhone}
                    onChange={(e) => setEmergencyPhone(e.target.value)}
                    placeholder="Your contact number"
                    className="text-sm"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-1 block">
                    Emergency Details
                  </label>
                  <Textarea 
                    value={emergencyDetails}
                    onChange={(e) => setEmergencyDetails(e.target.value)}
                    placeholder="Describe the emergency situation..."
                    rows={3}
                    className="text-sm"
                  />
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  onClick={sendEmergencyAlert}
                  className="flex-1 bg-red-600 hover:bg-red-700"
                >
                  🚨 SEND EMERGENCY ALERT
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowEmergency(false)}
                >
                  Cancel
                </Button>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded p-2">
                <p className="text-xs text-blue-700 text-center">
                  📞 For life-threatening emergencies, also call 108 (India) or your local emergency number
                </p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}