import { Button } from "@/components/ui/button";
import { Download, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, Table, TableRow, TableCell, WidthType, BorderStyle } from "docx";

export const GuestManagementGuide = () => {
  const { toast } = useToast();

  const generateDocument = async () => {
    try {
      const doc = new Document({
        sections: [{
          properties: {},
          children: [
            // Title
            new Paragraph({
              text: "Guest Management System - User Guide",
              heading: HeadingLevel.TITLE,
              alignment: AlignmentType.CENTER,
              spacing: { after: 400 }
            }),

            // Overview
            new Paragraph({
              text: "Overview",
              heading: HeadingLevel.HEADING_1,
              spacing: { before: 400, after: 200 }
            }),
            new Paragraph({
              text: "The Guest Management System helps you track all your hotel guests, manage their profiles, monitor loyalty tiers, and maintain guest preferences for personalized service.",
              spacing: { after: 300 }
            }),

            // Getting Started
            new Paragraph({
              text: "Getting Started",
              heading: HeadingLevel.HEADING_1,
              spacing: { before: 400, after: 200 }
            }),
            new Paragraph({
              text: "Accessing Guest Management",
              heading: HeadingLevel.HEADING_2,
              spacing: { before: 200, after: 100 }
            }),
            new Paragraph({
              text: "1. Log in to your Hotel Management System",
              numbering: { reference: "default-numbering", level: 0 }
            }),
            new Paragraph({
              text: "2. Click on 'Guests' in the left sidebar menu",
              numbering: { reference: "default-numbering", level: 0 }
            }),
            new Paragraph({
              text: "3. You'll see the Guest Management dashboard at: /admin/guests",
              numbering: { reference: "default-numbering", level: 0 },
              spacing: { after: 300 }
            }),

            // Managing Guests
            new Paragraph({
              text: "Managing Guests",
              heading: HeadingLevel.HEADING_1,
              spacing: { before: 400, after: 200 }
            }),
            new Paragraph({
              text: "Adding a New Guest",
              heading: HeadingLevel.HEADING_2,
              spacing: { before: 200, after: 100 }
            }),
            new Paragraph({
              text: "1. Click the 'Add New Guest' button (top right)",
              numbering: { reference: "default-numbering", level: 0 }
            }),
            new Paragraph({
              text: "2. Fill in the guest information:",
              numbering: { reference: "default-numbering", level: 0 }
            }),
            new Paragraph({
              text: "Name (required)",
              numbering: { reference: "default-numbering", level: 1 }
            }),
            new Paragraph({
              text: "Email (optional but recommended)",
              numbering: { reference: "default-numbering", level: 1 }
            }),
            new Paragraph({
              text: "Phone Number (optional)",
              numbering: { reference: "default-numbering", level: 1 }
            }),
            new Paragraph({
              text: "Address (optional)",
              numbering: { reference: "default-numbering", level: 1 }
            }),
            new Paragraph({
              text: "Nationality (optional)",
              numbering: { reference: "default-numbering", level: 1 }
            }),
            new Paragraph({
              text: "Preferences (dietary, room preferences, etc.)",
              numbering: { reference: "default-numbering", level: 1 }
            }),
            new Paragraph({
              text: "Notes (special requests or important information)",
              numbering: { reference: "default-numbering", level: 1 }
            }),
            new Paragraph({
              text: "3. Click 'Save' to add the guest",
              numbering: { reference: "default-numbering", level: 0 },
              spacing: { after: 300 }
            }),

            new Paragraph({
              text: "Editing Guest Information",
              heading: HeadingLevel.HEADING_2,
              spacing: { before: 200, after: 100 }
            }),
            new Paragraph({
              text: "1. Find the guest in the list",
              numbering: { reference: "default-numbering", level: 0 }
            }),
            new Paragraph({
              text: "2. Click the 'Edit' button next to their name",
              numbering: { reference: "default-numbering", level: 0 }
            }),
            new Paragraph({
              text: "3. Update any information needed",
              numbering: { reference: "default-numbering", level: 0 }
            }),
            new Paragraph({
              text: "4. Click 'Save Changes'",
              numbering: { reference: "default-numbering", level: 0 },
              spacing: { after: 300 }
            }),

            // Loyalty Tiers
            new Paragraph({
              text: "Loyalty Tiers",
              heading: HeadingLevel.HEADING_1,
              spacing: { before: 400, after: 200 }
            }),
            new Paragraph({
              text: "The system automatically assigns loyalty tiers based on total spending:",
              spacing: { after: 200 }
            }),

            // Loyalty Tiers Table
            new Table({
              width: { size: 100, type: WidthType.PERCENTAGE },
              rows: [
                new TableRow({
                  children: [
                    new TableCell({
                      children: [new Paragraph({
                        children: [new TextRun({ text: "Tier", bold: true })]
                      })],
                      shading: { fill: "CCCCCC" }
                    }),
                    new TableCell({
                      children: [new Paragraph({
                        children: [new TextRun({ text: "Spending Required", bold: true })]
                      })],
                      shading: { fill: "CCCCCC" }
                    }),
                    new TableCell({
                      children: [new Paragraph({
                        children: [new TextRun({ text: "Benefits", bold: true })]
                      })],
                      shading: { fill: "CCCCCC" }
                    })
                  ]
                }),
                new TableRow({
                  children: [
                    new TableCell({ children: [new Paragraph("Bronze")] }),
                    new TableCell({ children: [new Paragraph("$0+")] }),
                    new TableCell({ children: [new Paragraph("Standard service")] })
                  ]
                }),
                new TableRow({
                  children: [
                    new TableCell({ children: [new Paragraph("Silver")] }),
                    new TableCell({ children: [new Paragraph("$2,000+")] }),
                    new TableCell({ children: [new Paragraph("Priority check-in")] })
                  ]
                }),
                new TableRow({
                  children: [
                    new TableCell({ children: [new Paragraph("Gold")] }),
                    new TableCell({ children: [new Paragraph("$5,000+")] }),
                    new TableCell({ children: [new Paragraph("Room upgrades, late checkout")] })
                  ]
                }),
                new TableRow({
                  children: [
                    new TableCell({ children: [new Paragraph("Platinum")] }),
                    new TableCell({ children: [new Paragraph("$10,000+")] }),
                    new TableCell({ children: [new Paragraph("VIP treatment, exclusive perks")] })
                  ]
                })
              ]
            }),

            new Paragraph({
              text: "Tiers are updated automatically when guests make bookings.",
              spacing: { before: 200, after: 300 }
            }),

            // Guest Status
            new Paragraph({
              text: "Guest Status",
              heading: HeadingLevel.HEADING_1,
              spacing: { before: 400, after: 200 }
            }),
            new Paragraph({
              text: "Status Types:",
              heading: HeadingLevel.HEADING_2,
              spacing: { after: 100 }
            }),
            new Paragraph({
              text: "Active: Regular guests in good standing",
              bullet: { level: 0 }
            }),
            new Paragraph({
              text: "VIP: Guests requiring special attention",
              bullet: { level: 0 }
            }),
            new Paragraph({
              text: "Blacklisted: Guests not allowed to book",
              bullet: { level: 0 },
              spacing: { after: 300 }
            }),

            // Best Practices
            new Paragraph({
              text: "Best Practices",
              heading: HeadingLevel.HEADING_1,
              spacing: { before: 400, after: 200 }
            }),
            new Paragraph({
              text: "1. Keep Guest Information Updated",
              heading: HeadingLevel.HEADING_2,
              spacing: { after: 100 }
            }),
            new Paragraph({
              text: "Always verify email and phone numbers",
              bullet: { level: 0 }
            }),
            new Paragraph({
              text: "Update preferences after each stay",
              bullet: { level: 0 }
            }),
            new Paragraph({
              text: "Note any special requirements",
              bullet: { level: 0 },
              spacing: { after: 200 }
            }),

            new Paragraph({
              text: "2. Use Guest Preferences",
              heading: HeadingLevel.HEADING_2,
              spacing: { after: 100 }
            }),
            new Paragraph({
              text: "Record dietary restrictions",
              bullet: { level: 0 }
            }),
            new Paragraph({
              text: "Note room preferences (floor, view, bed type)",
              bullet: { level: 0 }
            }),
            new Paragraph({
              text: "Track special occasions (anniversaries, birthdays)",
              bullet: { level: 0 },
              spacing: { after: 200 }
            }),

            new Paragraph({
              text: "3. Monitor Loyalty Tiers",
              heading: HeadingLevel.HEADING_2,
              spacing: { after: 100 }
            }),
            new Paragraph({
              text: "Acknowledge tier upgrades during check-in",
              bullet: { level: 0 }
            }),
            new Paragraph({
              text: "Offer tier-appropriate perks",
              bullet: { level: 0 }
            }),
            new Paragraph({
              text: "Use tiers for targeted marketing",
              bullet: { level: 0 },
              spacing: { after: 300 }
            }),

            // Security & Privacy
            new Paragraph({
              text: "Security & Privacy",
              heading: HeadingLevel.HEADING_1,
              spacing: { before: 400, after: 200 }
            }),
            new Paragraph({
              text: "Who Can Access Guest Data:",
              heading: HeadingLevel.HEADING_2,
              spacing: { after: 100 }
            }),
            new Paragraph({
              text: "Front Desk Staff: View and add guests",
              bullet: { level: 0 }
            }),
            new Paragraph({
              text: "Managers: Full access including delete",
              bullet: { level: 0 }
            }),
            new Paragraph({
              text: "Admin: Complete system access",
              bullet: { level: 0 }
            }),
            new Paragraph({
              text: "Other Departments: No access to guest data",
              bullet: { level: 0 },
              spacing: { after: 200 }
            }),

            new Paragraph({
              text: "Data Protection:",
              heading: HeadingLevel.HEADING_2,
              spacing: { after: 100 }
            }),
            new Paragraph({
              text: "Guest data is encrypted",
              bullet: { level: 0 }
            }),
            new Paragraph({
              text: "Access is logged for security",
              bullet: { level: 0 }
            }),
            new Paragraph({
              text: "Only authorized staff can view personal information",
              bullet: { level: 0 },
              spacing: { after: 300 }
            }),

            // Troubleshooting
            new Paragraph({
              text: "Troubleshooting",
              heading: HeadingLevel.HEADING_1,
              spacing: { before: 400, after: 200 }
            }),
            new Paragraph({
              children: [
                new TextRun({ text: "Problem: ", bold: true }),
                new TextRun("Can't add a new guest")
              ],
              spacing: { after: 100 }
            }),
            new Paragraph({
              text: "Check you have staff/manager permissions",
              bullet: { level: 0 }
            }),
            new Paragraph({
              text: "Ensure name field is filled",
              bullet: { level: 0 }
            }),
            new Paragraph({
              text: "Try refreshing the page",
              bullet: { level: 0 },
              spacing: { after: 200 }
            }),

            new Paragraph({
              children: [
                new TextRun({ text: "Problem: ", bold: true }),
                new TextRun("Guest not appearing in list")
              ],
              spacing: { after: 100 }
            }),
            new Paragraph({
              text: "Check your search/filter settings",
              bullet: { level: 0 }
            }),
            new Paragraph({
              text: "Verify guest was saved successfully",
              bullet: { level: 0 }
            }),
            new Paragraph({
              text: "Refresh the page",
              bullet: { level: 0 },
              spacing: { after: 300 }
            }),

            // Footer
            new Paragraph({
              text: "Last Updated: January 2025 | Version 1.0",
              alignment: AlignmentType.CENTER,
              spacing: { before: 600 }
            })
          ]
        }],
        numbering: {
          config: [{
            reference: "default-numbering",
            levels: [
              {
                level: 0,
                format: "decimal",
                text: "%1.",
                alignment: AlignmentType.LEFT
              },
              {
                level: 1,
                format: "lowerLetter",
                text: "%2)",
                alignment: AlignmentType.LEFT
              }
            ]
          }]
        }
      });

      const blob = await Packer.toBlob(doc);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'Guest_Management_System_Guide.docx';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Success!",
        description: "Guest Management Guide downloaded successfully. You can convert it to PDF using Microsoft Word or Google Docs.",
      });
    } catch (error) {
      console.error('Error generating document:', error);
      toast({
        title: "Error",
        description: "Failed to generate document. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Guest Management Guide</h2>
          <p className="text-muted-foreground mt-1">
            Download comprehensive documentation for your client
          </p>
        </div>
        <Button onClick={generateDocument} size="lg" className="gap-2">
          <Download className="h-5 w-5" />
          Download Guide (DOCX)
        </Button>
      </div>

      <div className="bg-muted/50 rounded-lg p-6 space-y-4">
        <div className="flex items-start gap-3">
          <FileText className="h-5 w-5 text-primary mt-0.5" />
          <div>
            <h3 className="font-semibold mb-2">What's Included:</h3>
            <ul className="space-y-1.5 text-sm text-muted-foreground">
              <li>✓ Complete system overview and getting started guide</li>
              <li>✓ Step-by-step instructions for managing guests</li>
              <li>✓ Loyalty tiers and benefits explanation</li>
              <li>✓ Guest status management procedures</li>
              <li>✓ Best practices and tips</li>
              <li>✓ Security and privacy information</li>
              <li>✓ Troubleshooting common issues</li>
              <li>✓ Quick reference tables</li>
            </ul>
          </div>
        </div>

        <div className="pt-4 border-t">
          <p className="text-sm text-muted-foreground">
            <strong>Note:</strong> The document is generated in DOCX format. You can easily convert it to PDF using:
          </p>
          <ul className="text-sm text-muted-foreground mt-2 ml-4 space-y-1">
            <li>• Microsoft Word (File → Save As → PDF)</li>
            <li>• Google Docs (Upload → File → Download → PDF)</li>
            <li>• Online converters (docx2pdf.com, etc.)</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
