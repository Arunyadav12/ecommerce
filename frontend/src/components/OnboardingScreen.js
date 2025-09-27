import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Separator } from './ui/separator';
import { Store, MapPin, Phone, Lock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../hooks/use-toast';

const OnboardingScreen = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { login, register, isAuthenticated } = useAuth();
  const [isLogin, setIsLogin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    shopName: '',
    mobile: '',
    location: '',
    password: ''
  });

  // Redirect if already authenticated
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/home');
    }
  }, [isAuthenticated, navigate]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (isLogin) {
        // Login
        if (!formData.mobile || !formData.password) {
          toast({
            title: "Login Failed",
            description: "Please enter mobile and password",
            variant: "destructive"
          });
          return;
        }

        const result = await login({
          mobile: formData.mobile,
          password: formData.password
        });

        if (result.success) {
          toast({
            title: "Login Successful",
            description: "Welcome back to WholeMart!"
          });
          navigate('/home');
        } else {
          toast({
            title: "Login Failed",
            description: result.error,
            variant: "destructive"
          });
        }
      } else {
        // Registration
        if (!formData.shopName || !formData.mobile || !formData.location || !formData.password) {
          toast({
            title: "Registration Failed",
            description: "Please fill all required fields",
            variant: "destructive"
          });
          return;
        }

        const result = await register({
          shop_name: formData.shopName,
          mobile: formData.mobile,
          location: formData.location,
          password: formData.password
        });

        if (result.success) {
          toast({
            title: "Registration Successful", 
            description: "Welcome to WholeMart!"
          });
          navigate('/home');
        } else {
          toast({
            title: "Registration Failed",
            description: result.error,
            variant: "destructive"
          });
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const detectLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // Mock reverse geocoding
          setFormData({
            ...formData,
            location: "Shop No. 15, Main Market, Sector 22"
          });
          toast({
            title: "Location Detected",
            description: "Location set successfully"
          });
        },
        () => {
          toast({
            title: "Location Error",
            description: "Unable to detect location. Please enter manually.",
            variant: "destructive"
          });
        }
      );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl border-0 bg-white/95 backdrop-blur-sm">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl flex items-center justify-center">
            <Store className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-slate-800">
            {isLogin ? 'Welcome Back' : 'Join WholeMart'}
          </CardTitle>
          <p className="text-slate-600 text-sm">
            {isLogin ? 'Login to your wholesale account' : 'Register your shop for wholesale orders'}
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="shopName" className="text-sm font-medium text-slate-700">
                  Shop/Vendor Name
                </Label>
                <div className="relative">
                  <Store className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    id="shopName"
                    name="shopName"
                    type="text"
                    placeholder="e.g., Ramesh & Sons Retail"
                    value={formData.shopName}
                    onChange={handleInputChange}
                    className="pl-10 h-12"
                    required={!isLogin}
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="mobile" className="text-sm font-medium text-slate-700">
                Mobile Number
              </Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input
                  id="mobile"
                  name="mobile"
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={formData.mobile}
                  onChange={handleInputChange}
                  className="pl-10 h-12"
                  required
                />
              </div>
            </div>

            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="location" className="text-sm font-medium text-slate-700">
                  Shop Location
                </Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    id="location"
                    name="location"
                    type="text"
                    placeholder="Enter your shop address"
                    value={formData.location}
                    onChange={handleInputChange}
                    className="pl-10 pr-20 h-12"
                    required={!isLogin}
                  />
                  <Button
                    type="button"
                    onClick={detectLocation}
                    size="sm"
                    className="absolute right-1 top-1 h-10 px-3 bg-slate-100 hover:bg-slate-200 text-slate-600"
                    variant="ghost"
                  >
                    GPS
                  </Button>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-slate-700">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="pl-10 h-12"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-slate-800 hover:bg-slate-900 text-white font-medium rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  {isLogin ? 'Logging in...' : 'Registering...'}
                </div>
              ) : (
                isLogin ? 'Login' : 'Register'
              )}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-slate-500">or</span>
            </div>
          </div>

          <Button
            onClick={() => setIsLogin(!isLogin)}
            variant="ghost"
            className="w-full text-slate-600 hover:text-slate-800"
          >
            {isLogin ? "Don't have an account? Register" : "Already have an account? Login"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default OnboardingScreen;