import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx';

export interface DocumentationSection {
  title: string;
  content: string[];
  subsections?: DocumentationSection[];
}

export class HotelManagementDocumentationGenerator {
  
  constructor() {
    // Constructor will initialize document in generateDocumentation method
  }

  private createTitlePage(): Paragraph[] {
    return [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 400 },
        children: [
          new TextRun({
            text: "ALOKOLODO HOTELS",
            bold: true,
            size: 48,
            color: "1F4E79",
          }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
        children: [
          new TextRun({
            text: "MANAGEMENT SYSTEM",
            bold: true,
            size: 36,
            color: "2F5F8F",
          }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 600 },
        children: [
          new TextRun({
            text: "Complete Documentation Package",
            size: 24,
            color: "4472C4",
          }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 300 },
        children: [
          new TextRun({
            text: "• Installation Guide",
            size: 18,
          }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 300 },
        children: [
          new TextRun({
            text: "• User Training Manual",
            size: 18,
          }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 300 },
        children: [
          new TextRun({
            text: "• System Operation Guide",
            size: 18,
          }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 600 },
        children: [
          new TextRun({
            text: "For Desktop, iOS & Android Platforms",
            size: 16,
            italics: true,
          }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
        children: [
          new TextRun({
            text: `Version 1.0 - ${new Date().toLocaleDateString()}`,
            size: 14,
            color: "666666",
          }),
        ],
      }),
    ];
  }

  private createTableOfContents(): Paragraph[] {
    return [
      new Paragraph({
        text: "TABLE OF CONTENTS",
        heading: HeadingLevel.HEADING_1,
        alignment: AlignmentType.CENTER,
        spacing: { after: 400 },
      }),
      new Paragraph({
        children: [
          new TextRun({ text: "1. SYSTEM OVERVIEW", bold: true }),
          new TextRun({ text: "\t\t\t\t\t\t\t\t\t3", bold: true }),
        ],
      }),
      new Paragraph({
        children: [
          new TextRun({ text: "2. INSTALLATION GUIDE", bold: true }),
          new TextRun({ text: "\t\t\t\t\t\t\t\t5", bold: true }),
        ],
      }),
      new Paragraph({
        children: [
          new TextRun({ text: "3. USER TRAINING MANUAL", bold: true }),
          new TextRun({ text: "\t\t\t\t\t\t\t12", bold: true }),
        ],
      }),
      new Paragraph({
        children: [
          new TextRun({ text: "4. MODULE GUIDES", bold: true }),
          new TextRun({ text: "\t\t\t\t\t\t\t\t\t25", bold: true }),
        ],
      }),
      new Paragraph({
        children: [
          new TextRun({ text: "5. MOBILE APP GUIDE", bold: true }),
          new TextRun({ text: "\t\t\t\t\t\t\t\t68", bold: true }),
        ],
      }),
      new Paragraph({
        children: [
          new TextRun({ text: "6. TROUBLESHOOTING", bold: true }),
          new TextRun({ text: "\t\t\t\t\t\t\t\t75", bold: true }),
        ],
      }),
      new Paragraph({
        children: [
          new TextRun({ text: "7. APPENDICES", bold: true }),
          new TextRun({ text: "\t\t\t\t\t\t\t\t\t\t82", bold: true }),
        ],
      }),
    ];
  }

  private createSystemOverview(): Paragraph[] {
    return [
      new Paragraph({
        text: "1. SYSTEM OVERVIEW",
        heading: HeadingLevel.HEADING_1,
        pageBreakBefore: true,
      }),
      new Paragraph({
        text: "1.1 Introduction",
        heading: HeadingLevel.HEADING_2,
      }),
      new Paragraph({
        text: "The ALOKOLODO HOTELS Management System is a comprehensive digital platform designed to streamline all aspects of hotel operations. This modern, web-based solution provides integrated management tools for front desk operations, housekeeping, food & beverage service, financial management, and guest services.",
      }),
      new Paragraph({
        text: "1.2 Key Features",
        heading: HeadingLevel.HEADING_2,
      }),
      new Paragraph({
        text: "• Multi-platform support (Desktop, iOS, Android)",
      }),
      new Paragraph({
        text: "• Real-time booking and reservation management",
      }),
      new Paragraph({
        text: "• Integrated POS system for restaurants and bars",
      }),
      new Paragraph({
        text: "• Comprehensive financial tracking and reporting",
      }),
      new Paragraph({
        text: "• Staff management and payroll processing",
      }),
      new Paragraph({
        text: "• Inventory management with low-stock alerts",
      }),
      new Paragraph({
        text: "• Guest management and history tracking",
      }),
      new Paragraph({
        text: "• Analytics dashboard with business insights",
      }),
      new Paragraph({
        text: "• Mobile staff app for on-the-go management",
      }),
      new Paragraph({
        text: "• Automated housekeeping schedules",
      }),
      new Paragraph({
        text: "1.3 System Architecture",
        heading: HeadingLevel.HEADING_2,
      }),
      new Paragraph({
        text: "The system is built on modern web technologies with a cloud-based backend powered by Supabase. The frontend uses React with TypeScript for reliability and performance.",
      }),
      new Paragraph({
        text: "• Frontend: React + TypeScript + Tailwind CSS",
      }),
      new Paragraph({
        text: "• Backend: Supabase (PostgreSQL + Real-time APIs)",
      }),
      new Paragraph({
        text: "• Mobile: Capacitor for native iOS/Android apps",
      }),
      new Paragraph({
        text: "• Authentication: Supabase Auth with role-based access",
      }),
      new Paragraph({
        text: "• File Storage: Supabase Storage for documents and images",
      }),
    ];
  }

  private createInstallationGuide(): Paragraph[] {
    return [
      new Paragraph({
        text: "2. INSTALLATION GUIDE",
        heading: HeadingLevel.HEADING_1,
        pageBreakBefore: true,
      }),
      new Paragraph({
        text: "2.1 System Requirements",
        heading: HeadingLevel.HEADING_2,
      }),
      new Paragraph({
        text: "2.1.1 Desktop Requirements",
        heading: HeadingLevel.HEADING_3,
      }),
      new Paragraph({
        text: "• Operating System: Windows 10+, macOS 10.14+, or Linux (Ubuntu 18.04+)",
      }),
      new Paragraph({
        text: "• RAM: Minimum 4GB, Recommended 8GB+",
      }),
      new Paragraph({
        text: "• Storage: 500MB free space",
      }),
      new Paragraph({
        text: "• Internet: Stable broadband connection (minimum 10 Mbps)",
      }),
      new Paragraph({
        text: "• Browser: Chrome 90+, Firefox 88+, Safari 14+, or Edge 90+",
      }),
      new Paragraph({
        text: "2.1.2 Mobile Requirements",
        heading: HeadingLevel.HEADING_3,
      }),
      new Paragraph({
        text: "• iOS: Version 12.0 or later",
      }),
      new Paragraph({
        text: "• Android: Version 7.0 (API level 24) or later",
      }),
      new Paragraph({
        text: "• RAM: Minimum 2GB, Recommended 4GB+",
      }),
      new Paragraph({
        text: "• Storage: 100MB free space",
      }),
      new Paragraph({
        text: "• Internet: Wi-Fi or cellular data connection",
      }),
      new Paragraph({
        text: "2.2 Web Application Setup",
        heading: HeadingLevel.HEADING_2,
      }),
      new Paragraph({
        text: "2.2.1 Accessing the System",
        heading: HeadingLevel.HEADING_3,
      }),
      new Paragraph({
        text: "1. Open your web browser",
      }),
      new Paragraph({
        text: "2. Navigate to your hotel's system URL",
      }),
      new Paragraph({
        text: "3. You will see the ALOKOLODO HOTELS welcome page",
      }),
      new Paragraph({
        text: "4. Click 'Book Your Stay' for guest bookings",
      }),
      new Paragraph({
        text: "5. Staff access is available through the mobile app or direct URL",
      }),
      new Paragraph({
        text: "2.2.2 First-Time Setup",
        heading: HeadingLevel.HEADING_3,
      }),
      new Paragraph({
        text: "1. Contact your system administrator for initial login credentials",
      }),
      new Paragraph({
        text: "2. Log in using the provided admin account",
      }),
      new Paragraph({
        text: "3. Configure hotel settings in Admin > Settings",
      }),
      new Paragraph({
        text: "4. Set up rooms, rates, and basic inventory",
      }),
      new Paragraph({
        text: "5. Create staff accounts and assign roles",
      }),
      new Paragraph({
        text: "2.3 Mobile App Installation",
        heading: HeadingLevel.HEADING_2,
      }),
      new Paragraph({
        text: "2.3.1 Development/Testing Installation",
        heading: HeadingLevel.HEADING_3,
      }),
      new Paragraph({
        text: "For organizations wanting to deploy the mobile app:",
      }),
      new Paragraph({
        text: "1. Export project to GitHub repository",
      }),
      new Paragraph({
        text: "2. Clone repository: git clone [repository-url]",
      }),
      new Paragraph({
        text: "3. Install dependencies: npm install",
      }),
      new Paragraph({
        text: "4. Add mobile platforms:",
      }),
      new Paragraph({
        text: "   • iOS: npx cap add ios",
      }),
      new Paragraph({
        text: "   • Android: npx cap add android",
      }),
      new Paragraph({
        text: "5. Update platforms: npx cap update ios android",
      }),
      new Paragraph({
        text: "6. Build project: npm run build",
      }),
      new Paragraph({
        text: "7. Sync to native: npx cap sync",
      }),
      new Paragraph({
        text: "8. Run on device:",
      }),
      new Paragraph({
        text: "   • iOS: npx cap run ios (requires Xcode on Mac)",
      }),
      new Paragraph({
        text: "   • Android: npx cap run android (requires Android Studio)",
      }),
      new Paragraph({
        text: "2.3.2 Staff Mobile Access Options",
        heading: HeadingLevel.HEADING_3,
      }),
      new Paragraph({
        text: "1. Native Mobile App - Full featured native application",
      }),
      new Paragraph({
        text: "2. Mobile Web Access - Access via [domain]/mobile/staff-login",
      }),
      new Paragraph({
        text: "3. QR Code Access - Scan codes placed in staff areas",
      }),
      new Paragraph({
        text: "4. Direct URL Bookmarks - Bookmark mobile portal for quick access",
      }),
    ];
  }

  private createUserTrainingManual(): Paragraph[] {
    return [
      new Paragraph({
        text: "3. USER TRAINING MANUAL",
        heading: HeadingLevel.HEADING_1,
        pageBreakBefore: true,
      }),
      new Paragraph({
        text: "3.1 Getting Started",
        heading: HeadingLevel.HEADING_2,
      }),
      new Paragraph({
        text: "3.1.1 User Roles and Permissions",
        heading: HeadingLevel.HEADING_3,
      }),
      new Paragraph({
        text: "The system supports multiple user roles with different access levels:",
      }),
      new Paragraph({
        text: "• Admin: Full system access, user management, settings configuration",
      }),
      new Paragraph({
        text: "• Manager: Department management, reporting, staff oversight",
      }),
      new Paragraph({
        text: "• Front Desk: Bookings, guest management, check-in/out",
      }),
      new Paragraph({
        text: "• Housekeeping: Room status updates, maintenance requests",
      }),
      new Paragraph({
        text: "• Restaurant Staff: POS operations, menu management",
      }),
      new Paragraph({
        text: "• Maintenance: Equipment status, work orders",
      }),
      new Paragraph({
        text: "3.1.2 Login Process",
        heading: HeadingLevel.HEADING_3,
      }),
      new Paragraph({
        text: "Desktop Web Access:",
      }),
      new Paragraph({
        text: "1. Open web browser and navigate to system URL",
      }),
      new Paragraph({
        text: "2. Access staff portal via direct URL or mobile app",
      }),
      new Paragraph({
        text: "3. Enter email and password provided by administrator",
      }),
      new Paragraph({
        text: "4. Click 'Sign In' to access your dashboard",
      }),
      new Paragraph({
        text: "Mobile App Access:",
      }),
      new Paragraph({
        text: "1. Open ALOKOLODO HOTELS Staff app",
      }),
      new Paragraph({
        text: "2. Enter staff credentials",
      }),
      new Paragraph({
        text: "3. Access quick actions from mobile dashboard",
      }),
      new Paragraph({
        text: "3.1.3 Dashboard Overview",
        heading: HeadingLevel.HEADING_3,
      }),
      new Paragraph({
        text: "Upon logging in, users see a personalized dashboard showing:",
      }),
      new Paragraph({
        text: "• Key performance metrics relevant to their role",
      }),
      new Paragraph({
        text: "• Recent activities and notifications",
      }),
      new Paragraph({
        text: "• Quick action buttons for common tasks",
      }),
      new Paragraph({
        text: "• Navigation menu to access different modules",
      }),
      new Paragraph({
        text: "• Real-time alerts and system status",
      }),
    ];
  }

  private createModuleGuides(): Paragraph[] {
    return [
      new Paragraph({
        text: "4. MODULE GUIDES",
        heading: HeadingLevel.HEADING_1,
        pageBreakBefore: true,
      }),
      new Paragraph({
        text: "4.1 Room Management Module",
        heading: HeadingLevel.HEADING_2,
      }),
      new Paragraph({
        text: "4.1.1 Room Status Overview",
        heading: HeadingLevel.HEADING_3,
      }),
      new Paragraph({
        text: "The Room Management module provides real-time visibility into all rooms:",
      }),
      new Paragraph({
        text: "• Available - Clean and ready for guests",
      }),
      new Paragraph({
        text: "• Occupied - Currently has guests",
      }),
      new Paragraph({
        text: "• Dirty - Needs housekeeping",
      }),
      new Paragraph({
        text: "• Maintenance - Under repair or maintenance",
      }),
      new Paragraph({
        text: "• Out of Order - Temporarily unavailable",
      }),
      new Paragraph({
        text: "4.2 Booking Management Module",
        heading: HeadingLevel.HEADING_2,
      }),
      new Paragraph({
        text: "Handle all reservation activities including new bookings, modifications, and cancellations.",
      }),
      new Paragraph({
        text: "4.3 Point of Sale (POS) Module",
        heading: HeadingLevel.HEADING_2,
      }),
      new Paragraph({
        text: "Complete restaurant and bar management with menu items, table management, and payment processing.",
      }),
      new Paragraph({
        text: "4.4 Financial Management Module",
        heading: HeadingLevel.HEADING_2,
      }),
      new Paragraph({
        text: "Track all financial transactions, generate reports, and manage accounting entries.",
      }),
      new Paragraph({
        text: "4.5 Inventory Management Module",
        heading: HeadingLevel.HEADING_2,
      }),
      new Paragraph({
        text: "Monitor stock levels, track usage, and manage supplier relationships.",
      }),
      new Paragraph({
        text: "4.6 Human Resources Module",
        heading: HeadingLevel.HEADING_2,
      }),
      new Paragraph({
        text: "Manage staff information, payroll, leave requests, and performance tracking.",
      }),
      new Paragraph({
        text: "4.7 Guest Management Module",
        heading: HeadingLevel.HEADING_2,
      }),
      new Paragraph({
        text: "Maintain guest profiles, preferences, and booking history.",
      }),
      new Paragraph({
        text: "4.8 Housekeeping Module",
        heading: HeadingLevel.HEADING_2,
      }),
      new Paragraph({
        text: "Schedule cleaning tasks, track room status, and manage maintenance requests.",
      }),
      new Paragraph({
        text: "4.9 Analytics and Reporting Module",
        heading: HeadingLevel.HEADING_2,
      }),
      new Paragraph({
        text: "Generate comprehensive reports on occupancy, revenue, guest satisfaction, and operational efficiency.",
      }),
    ];
  }

  private createMobileGuide(): Paragraph[] {
    return [
      new Paragraph({
        text: "5. MOBILE APPLICATION GUIDE",
        heading: HeadingLevel.HEADING_1,
        pageBreakBefore: true,
      }),
      new Paragraph({
        text: "5.1 Mobile Staff Dashboard",
        heading: HeadingLevel.HEADING_2,
      }),
      new Paragraph({
        text: "The mobile application provides staff with on-the-go access to essential hotel management functions.",
      }),
      new Paragraph({
        text: "5.1.1 Quick Actions",
        heading: HeadingLevel.HEADING_3,
      }),
      new Paragraph({
        text: "• Room status updates",
      }),
      new Paragraph({
        text: "• Guest check-in/check-out",
      }),
      new Paragraph({
        text: "• Inventory updates",
      }),
      new Paragraph({
        text: "• Task management",
      }),
      new Paragraph({
        text: "• Emergency notifications",
      }),
      new Paragraph({
        text: "5.2 Offline Capabilities",
        heading: HeadingLevel.HEADING_2,
      }),
      new Paragraph({
        text: "The mobile app includes offline functionality for critical operations when internet connectivity is limited.",
      }),
      new Paragraph({
        text: "5.3 Push Notifications",
        heading: HeadingLevel.HEADING_2,
      }),
      new Paragraph({
        text: "Receive real-time alerts for:",
      }),
      new Paragraph({
        text: "• New bookings and cancellations",
      }),
      new Paragraph({
        text: "• Room status changes",
      }),
      new Paragraph({
        text: "• Maintenance requests",
      }),
      new Paragraph({
        text: "• Low inventory alerts",
      }),
      new Paragraph({
        text: "• Staff schedule changes",
      }),
    ];
  }

  private createTroubleshooting(): Paragraph[] {
    return [
      new Paragraph({
        text: "6. TROUBLESHOOTING GUIDE",
        heading: HeadingLevel.HEADING_1,
        pageBreakBefore: true,
      }),
      new Paragraph({
        text: "6.1 Common Issues and Solutions",
        heading: HeadingLevel.HEADING_2,
      }),
      new Paragraph({
        text: "6.1.1 Login Problems",
        heading: HeadingLevel.HEADING_3,
      }),
      new Paragraph({
        text: "Problem: Cannot log into the system",
      }),
      new Paragraph({
        text: "Solutions:",
      }),
      new Paragraph({
        text: "• Verify email address and password are correct",
      }),
      new Paragraph({
        text: "• Check internet connection",
      }),
      new Paragraph({
        text: "• Clear browser cache and cookies",
      }),
      new Paragraph({
        text: "• Contact administrator for password reset",
      }),
      new Paragraph({
        text: "6.1.2 Slow Performance",
        heading: HeadingLevel.HEADING_3,
      }),
      new Paragraph({
        text: "Problem: System running slowly",
      }),
      new Paragraph({
        text: "Solutions:",
      }),
      new Paragraph({
        text: "• Check internet connection speed",
      }),
      new Paragraph({
        text: "• Close unnecessary browser tabs",
      }),
      new Paragraph({
        text: "• Restart browser or device",
      }),
      new Paragraph({
        text: "• Update browser to latest version",
      }),
      new Paragraph({
        text: "6.1.3 Data Not Loading",
        heading: HeadingLevel.HEADING_3,
      }),
      new Paragraph({
        text: "Problem: Information not displaying properly",
      }),
      new Paragraph({
        text: "Solutions:",
      }),
      new Paragraph({
        text: "• Refresh the page (F5 or Ctrl+R)",
      }),
      new Paragraph({
        text: "• Check network connectivity",
      }),
      new Paragraph({
        text: "• Log out and log back in",
      }),
      new Paragraph({
        text: "• Contact IT support if problem persists",
      }),
      new Paragraph({
        text: "6.2 Emergency Procedures",
        heading: HeadingLevel.HEADING_2,
      }),
      new Paragraph({
        text: "In case of system downtime, follow your hotel's backup procedures for:",
      }),
      new Paragraph({
        text: "• Manual room assignment tracking",
      }),
      new Paragraph({
        text: "• Paper-based check-in/check-out",
      }),
      new Paragraph({
        text: "• Cash-only POS operations",
      }),
      new Paragraph({
        text: "• Emergency contact procedures",
      }),
    ];
  }

  private createAppendices(): Paragraph[] {
    return [
      new Paragraph({
        text: "7. APPENDICES",
        heading: HeadingLevel.HEADING_1,
        pageBreakBefore: true,
      }),
      new Paragraph({
        text: "7.1 Keyboard Shortcuts",
        heading: HeadingLevel.HEADING_2,
      }),
      new Paragraph({
        text: "• Ctrl+N - New booking",
      }),
      new Paragraph({
        text: "• Ctrl+F - Find/Search",
      }),
      new Paragraph({
        text: "• Ctrl+S - Save current form",
      }),
      new Paragraph({
        text: "• F5 - Refresh page",
      }),
      new Paragraph({
        text: "• Escape - Close current modal",
      }),
      new Paragraph({
        text: "7.2 System Status Codes",
        heading: HeadingLevel.HEADING_2,
      }),
      new Paragraph({
        text: "• 200 - Success",
      }),
      new Paragraph({
        text: "• 401 - Unauthorized access",
      }),
      new Paragraph({
        text: "• 404 - Resource not found",
      }),
      new Paragraph({
        text: "• 500 - Server error",
      }),
      new Paragraph({
        text: "7.3 Contact Information",
        heading: HeadingLevel.HEADING_2,
      }),
      new Paragraph({
        text: "Technical Support:",
      }),
      new Paragraph({
        text: "• Email: support@alokolodohotels.com",
      }),
      new Paragraph({
        text: "• Phone: +1-800-ALOKOLODO",
      }),
      new Paragraph({
        text: "• Hours: 24/7 Emergency Support",
      }),
      new Paragraph({
        text: "Training Support:",
      }),
      new Paragraph({
        text: "• Email: training@alokolodohotels.com",
      }),
      new Paragraph({
        text: "• Phone: +1-800-TRAINING",
      }),
      new Paragraph({
        text: "• Hours: Monday-Friday 8AM-6PM EST",
      }),
    ];
  }

  public async generateDocumentation(): Promise<ArrayBuffer> {
    try {
      console.log('Starting documentation generation...');
      
      const sections = [
        ...this.createTitlePage(),
        ...this.createTableOfContents(),
        ...this.createSystemOverview(),
        ...this.createInstallationGuide(),
        ...this.createUserTrainingManual(),
        ...this.createModuleGuides(),
        ...this.createMobileGuide(),
        ...this.createTroubleshooting(),
        ...this.createAppendices(),
      ];

      console.log('Sections created, building document...');

      const document = new Document({
        creator: "ALOKOLODO HOTELS Management System",
        title: "Hotel Management System - Complete Documentation",
        description: "Comprehensive installation, training, and user guides",
        sections: [
          {
            properties: {},
            children: sections,
          },
        ],
      });

      console.log('Document created, converting to buffer...');
      const buffer = await Packer.toBuffer(document);
      console.log('Documentation generated successfully');
      
      return buffer;
    } catch (error) {
      console.error('Error in generateDocumentation:', error);
      throw error;
    }
  }
}