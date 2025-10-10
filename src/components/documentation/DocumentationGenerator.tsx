import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { 
  FileText, Download, CheckCircle, 
  Smartphone, Monitor, Tablet, 
  BookOpen, Settings, Users,
  AlertCircle, Info
} from 'lucide-react';
import { HotelManagementDocumentationGenerator } from '@/utils/documentationGenerator';

interface DocumentationProps {
  onClose?: () => void;
}

export const DocumentationGenerator: React.FC<DocumentationProps> = ({ onClose }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [generationStep, setGenerationStep] = useState('');
  const { toast } = useToast();

  const documentSections = [
    {
      title: "System Overview",
      description: "Complete system architecture and feature overview",
      icon: Info,
      pages: "8 pages"
    },
    {
      title: "Installation Guide", 
      description: "Step-by-step setup for all platforms",
      icon: Settings,
      pages: "12 pages"
    },
    {
      title: "User Training Manual",
      description: "Comprehensive training for all user roles",
      icon: Users,
      pages: "18 pages"
    },
    {
      title: "Module Guides",
      description: "Detailed guides for all system modules",
      icon: BookOpen,
      pages: "45 pages"
    },
    {
      title: "Mobile App Guide",
      description: "iOS and Android app usage instructions",
      icon: Smartphone,
      pages: "12 pages"
    },
    {
      title: "Troubleshooting",
      description: "Common issues and solutions",
      icon: AlertCircle,
      pages: "8 pages"
    }
  ];

  const platformSupport = [
    { name: "Desktop Web", icon: Monitor, description: "Windows, macOS, Linux" },
    { name: "iOS Mobile", icon: Smartphone, description: "iPhone & iPad native app" },
    { name: "Android", icon: Tablet, description: "Phone & tablet native app" }
  ];

  const generateDocumentation = async () => {
    setIsGenerating(true);
    setProgress(0);

    try {
      const generator = new HotelManagementDocumentationGenerator();
      
      // Simulate progress updates
      const steps = [
        "Initializing documentation generator...",
        "Creating title page and table of contents...",
        "Generating system overview section...",
        "Building installation guide...",
        "Creating user training manual...", 
        "Documenting all system modules...",
        "Generating mobile app guide...",
        "Creating troubleshooting section...",
        "Adding appendices and references...",
        "Finalizing document formatting...",
        "Preparing download..."
      ];

      for (let i = 0; i < steps.length; i++) {
        setGenerationStep(steps[i]);
        setProgress(((i + 1) / steps.length) * 90);
        await new Promise(resolve => setTimeout(resolve, 800));
      }

      // Generate the actual document
      setGenerationStep("Generating final document...");
      const blob = await generator.generateDocumentation();
      
      setProgress(100);
      setGenerationStep("Download ready!");

      // Create download
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'ALOKOLODO_HOTELS_Complete_Documentation.docx';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Documentation Generated Successfully!",
        description: "Your comprehensive documentation has been downloaded.",
      });

    } catch (error) {
      console.error('Error generating documentation:', error);
      console.error('Error details:', error instanceof Error ? error.message : String(error));
      toast({
        title: "Generation Failed",
        description: `There was an error generating the documentation: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
      setTimeout(() => {
        setProgress(0);
        setGenerationStep('');
      }, 2000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <FileText className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Documentation Generator</h1>
        </div>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Generate comprehensive documentation package including installation guides, 
          training manuals, and user guides for the entire ALOKOLODO HOTELS management system.
        </p>
      </div>

      {/* Platform Support */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Monitor className="h-5 w-5" />
            Platform Coverage
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {platformSupport.map((platform) => (
              <div key={platform.name} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                <platform.icon className="h-6 w-6 text-primary" />
                <div>
                  <div className="font-medium">{platform.name}</div>
                  <div className="text-sm text-muted-foreground">{platform.description}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Document Sections */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Documentation Sections
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {documentSections.map((section) => (
              <div key={section.title} className="flex items-start gap-3 p-4 border rounded-lg">
                <section.icon className="h-5 w-5 text-primary mt-1" />
                <div className="flex-1">
                  <div className="font-medium">{section.title}</div>
                  <div className="text-sm text-muted-foreground mb-2">{section.description}</div>
                  <Badge variant="secondary" className="text-xs">{section.pages}</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Generation Status */}
      {isGenerating && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                <span className="font-medium">Generating Documentation...</span>
              </div>
              <Progress value={progress} className="w-full" />
              <p className="text-sm text-muted-foreground">{generationStep}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Generation Complete */}
      {!isGenerating && progress === 100 && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 text-green-700">
              <CheckCircle className="h-6 w-6" />
              <div>
                <div className="font-medium">Documentation Generated Successfully!</div>
                <div className="text-sm">Your comprehensive guide has been downloaded.</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex justify-center gap-4">
        <Button 
          onClick={generateDocumentation}
          disabled={isGenerating}
          size="lg"
          className="min-w-48"
        >
          <Download className="mr-2 h-5 w-5" />
          {isGenerating ? 'Generating...' : 'Generate Documentation'}
        </Button>
        
        {onClose && (
          <Button variant="outline" onClick={onClose} size="lg">
            Close
          </Button>
        )}
      </div>

      {/* Document Info */}
      <Card className="bg-muted/30">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-2xl font-bold text-primary">100+</div>
              <div className="text-sm text-muted-foreground">Total Pages</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary">15+</div>
              <div className="text-sm text-muted-foreground">System Modules</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary">3</div>
              <div className="text-sm text-muted-foreground">Platforms Covered</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Additional Info */}
      <div className="text-center text-sm text-muted-foreground space-y-1">
        <p>📄 Generated in Microsoft Word (.docx) format</p>
        <p>🔄 Includes installation, training, and troubleshooting guides</p>
        <p>📱 Covers desktop web, iOS, and Android platforms</p>
        <p>⚡ Ready for immediate use and distribution to staff</p>
      </div>
    </div>
  );
};