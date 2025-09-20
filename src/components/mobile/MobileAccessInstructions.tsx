import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Smartphone, Download, Wifi, Shield, QrCode } from 'lucide-react';

export const MobileAccessInstructions = () => {
  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold">ALOKOLODO HOTELS Staff Mobile App</h1>
        <p className="text-muted-foreground">Professional mobile access for hotel staff operations</p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="h-5 w-5 text-primary" />
              Mobile App Access Methods
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Badge variant="secondary" className="mt-1">1</Badge>
                <div>
                  <h4 className="font-medium">Native Mobile App</h4>
                  <p className="text-sm text-muted-foreground">
                    Install the dedicated mobile app for iOS and Android devices with native features and offline capabilities.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Badge variant="secondary" className="mt-1">2</Badge>
                <div>
                  <h4 className="font-medium">Direct URL Access</h4>
                  <p className="text-sm text-muted-foreground">
                    Access via mobile browser: <code className="bg-muted px-2 py-1 rounded text-xs">/mobile/staff-login</code>
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Badge variant="secondary" className="mt-1">3</Badge>
                <div>
                  <h4 className="font-medium">QR Code Access</h4>
                  <p className="text-sm text-muted-foreground">
                    Scan QR codes placed in staff areas for quick access to the mobile portal.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5 text-primary" />
              Installation Instructions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div>
                <h4 className="font-medium mb-2">For Development/Testing:</h4>
                <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                  <li>Export project to GitHub repository</li>
                  <li>Clone and run <code className="bg-muted px-1 rounded">npm install</code></li>
                  <li>Add mobile platforms: <code className="bg-muted px-1 rounded">npx cap add ios/android</code></li>
                  <li>Build project: <code className="bg-muted px-1 rounded">npm run build</code></li>
                  <li>Sync: <code className="bg-muted px-1 rounded">npx cap sync</code></li>
                  <li>Run: <code className="bg-muted px-1 rounded">npx cap run ios/android</code></li>
                </ol>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Security Features
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Wifi className="h-4 w-4 text-green-500" />
                <span>Secure Authentication</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-green-500" />
                <span>Role-based Access</span>
              </div>
              <div className="flex items-center gap-2">
                <Smartphone className="h-4 w-4 text-green-500" />
                <span>Native App Security</span>
              </div>
              <div className="flex items-center gap-2">
                <QrCode className="h-4 w-4 text-green-500" />
                <span>QR Code Access</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};