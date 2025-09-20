import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { Hotel, Shield, Smartphone, Fingerprint } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function MobileStaffLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isNativeApp, setIsNativeApp] = useState(false);
  
  const { signIn, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check if running in native mobile app
    setIsNativeApp(window.location.protocol === 'capacitor:');
    
    if (user) {
      navigate('/admin');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await signIn(email, password);
      if (!error) {
        toast({
          title: "Welcome back!",
          description: "Successfully logged into staff portal",
        });
        navigate('/admin');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-accent/10 p-4">
      <div className="w-full max-w-sm space-y-6">
        {/* Mobile App Header */}
        <div className="text-center space-y-4">
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-primary to-accent rounded-3xl flex items-center justify-center shadow-lg">
            <Hotel className="h-10 w-10 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">ALOKOLODO HOTELS</h1>
            <p className="text-sm text-muted-foreground">Staff Mobile Portal</p>
            {isNativeApp && (
              <div className="flex items-center justify-center gap-1 mt-2">
                <Smartphone className="h-4 w-4 text-primary" />
                <span className="text-xs text-primary font-medium">Native App</span>
              </div>
            )}
          </div>
        </div>

        <Card className="shadow-xl border-0 bg-card/95 backdrop-blur">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Shield className="h-5 w-5 text-primary" />
              Staff Access
            </CardTitle>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="mobile-email" className="text-sm font-medium">Email</Label>
                <Input
                  id="mobile-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your staff email"
                  className="h-12 text-base"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mobile-password" className="text-sm font-medium">Password</Label>
                <Input
                  id="mobile-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="h-12 text-base"
                  required
                />
              </div>
              <Button 
                type="submit" 
                className="w-full h-12 text-base font-medium" 
                disabled={loading}
              >
                {loading ? "Signing in..." : "Sign In"}
              </Button>
            </CardContent>
          </form>
        </Card>

        {isNativeApp && (
          <Card className="bg-muted/50 border-dashed">
            <CardContent className="p-4 text-center">
              <Fingerprint className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                Biometric authentication will be available in future updates
              </p>
            </CardContent>
          </Card>
        )}

        <div className="text-center text-xs text-muted-foreground">
          <p>🏨 Secure Staff Mobile Access</p>
          <p className="mt-1">Version 1.0 • ALOKOLODO HOTELS</p>
        </div>
      </div>
    </div>
  );
}