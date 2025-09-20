import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, BorderStyle, TableRow, Table, TableCell, WidthType } from 'docx';

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
      new Paragraph({
        text: "3.2 Navigation Training",
        heading: HeadingLevel.HEADING_2,
      }),
      new Paragraph({
        text: "3.2.1 Main Menu Structure",
        heading: HeadingLevel.HEADING_3,
      }),
      new Paragraph({
        text: "The main navigation is organized into logical sections:",
      }),
      new Paragraph({
        text: "Operations:",
      }),
      new Paragraph({
        text: "• Dashboard - Overview and quick access",
      }),
      new Paragraph({
        text: "• Rooms - Room management and status",
      }),
      new Paragraph({
        text: "• Bookings - Reservation management",
      }),
      new Paragraph({
        text: "• Guests - Customer information and history",
      }),
      new Paragraph({
        text: "Food & Beverage:",
      }),
      new Paragraph({
        text: "• POS System - Point of sale operations",
      }),
      new Paragraph({
        text: "• Menu - Menu item management",
      }),
      new Paragraph({
        text: "• Recipes - Recipe and ingredient tracking",
      }),
      new Paragraph({
        text: "Business Management:",
      }),
      new Paragraph({
        text: "• Accounting - Financial tracking and reporting",
      }),
      new Paragraph({
        text: "• Inventory - Stock management",
      }),
      new Paragraph({
        text: "• HR - Human resources and payroll",
      }),
      new Paragraph({
        text: "• Suppliers - Vendor management",
      }),
      new Paragraph({
        text: "Facilities:",
      }),
      new Paragraph({
        text: "• Gym - Fitness facility management",
      }),
      new Paragraph({
        text: "• Game Center - Entertainment facilities",
      }),
      new Paragraph({
        text: "• Halls - Event space management",
      }),
      new Paragraph({
        text: "• Housekeeping - Cleaning and maintenance",
      }),
      new Paragraph({
        text: "Administration:",
      }),
      new Paragraph({
        text: "• Analytics - Business intelligence and reports",
      }),
      new Paragraph({
        text: "• Settings - System configuration",
      }),
      new Paragraph({
        text: "• Users - Staff account management",
      }),
      new Paragraph({
        text: "3.2.2 Using the Interface",
        heading: HeadingLevel.HEADING_3,
      }),
      new Paragraph({
        text: "Interface Elements:",
      }),
      new Paragraph({
        text: "• Sidebar Navigation: Access all modules from the left sidebar",
      }),
      new Paragraph({
        text: "• Breadcrumbs: Track your location within the system",
      }),
      new Paragraph({
        text: "• Action Buttons: Clearly labeled buttons for common actions",
      }),
      new Paragraph({
        text: "• Search Functions: Quick search in lists and tables",
      }),
      new Paragraph({
        text: "• Filters: Narrow down information in data views",
      }),
      new Paragraph({
        text: "• Status Indicators: Visual cues for item status",
      }),
      new Paragraph({
        text: "Common Interactions:",
      }),
      new Paragraph({
        text: "• Click/Tap: Select items or activate buttons",
      }),
      new Paragraph({
        text: "• Double-click: Edit items in place (where available)",
      }),
      new Paragraph({
        text: "• Right-click: Access context menus (desktop)",
      }),
      new Paragraph({
        text: "• Drag and Drop: Reorder items (where applicable)",
      }),
      new Paragraph({
        text: "• Swipe: Navigate on mobile devices",
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
        text: "4.1.1 Overview",
        heading: HeadingLevel.HEADING_3,
      }),
      new Paragraph({
        text: "The Room Management module handles all aspects of room inventory, status tracking, and maintenance scheduling.",
      }),
      new Paragraph({
        text: "4.1.2 Key Functions",
        heading: HeadingLevel.HEADING_3,
      }),
      new Paragraph({
        text: "Adding New Rooms:",
      }),
      new Paragraph({
        text: "1. Navigate to Admin > Rooms",
      }),
      new Paragraph({
        text: "2. Click 'Add New Room' button",
      }),
      new Paragraph({
        text: "3. Enter room details:",
      }),
      new Paragraph({
        text: "   • Room number",
      }),
      new Paragraph({
        text: "   • Room type (Standard, Deluxe, Suite, etc.)",
      }),
      new Paragraph({
        text: "   • Floor number",
      }),
      new Paragraph({
        text: "   • Maximum occupancy",
      }),
      new Paragraph({
        text: "   • Base price per night",
      }),
      new Paragraph({
        text: "   • Amenities and features",
      }),
      new Paragraph({
        text: "4. Click 'Save Room' to add to inventory",
      }),
      new Paragraph({
        text: "Room Status Management:",
      }),
      new Paragraph({
        text: "• Available - Ready for new guests",
      }),
      new Paragraph({
        text: "• Occupied - Currently has guests",
      }),
      new Paragraph({
        text: "• Maintenance - Requires repair or deep cleaning",
      }),
      new Paragraph({
        text: "• Cleaning - Being prepared for next guest",
      }),
      new Paragraph({
        text: "• Out of Order - Temporarily unavailable",
      }),
      new Paragraph({
        text: "4.2 Booking Management Module",
        heading: HeadingLevel.HEADING_2,
      }),
      new Paragraph({
        text: "4.2.1 Creating New Bookings",
        heading: HeadingLevel.HEADING_3,
      }),
      new Paragraph({
        text: "1. Go to Admin > Bookings",
      }),
      new Paragraph({
        text: "2. Click 'New Booking'",
      }),
      new Paragraph({
        text: "3. Select dates and room type",
      }),
      new Paragraph({
        text: "4. Enter guest information",
      }),
      new Paragraph({
        text: "5. Apply rates and discounts",
      }),
      new Paragraph({
        text: "6. Confirm booking details",
      }),
      new Paragraph({
        text: "7. Process payment if required",
      }),
      new Paragraph({
        text: "4.2.2 Managing Existing Bookings",
        heading: HeadingLevel.HEADING_3,
      }),
      new Paragraph({
        text: "• View all bookings in calendar or list format",
      }),
      new Paragraph({
        text: "• Edit booking details (dates, rooms, guests)",
      }),
      new Paragraph({
        text: "• Process check-ins and check-outs",
      }),
      new Paragraph({
        text: "• Handle cancellations and refunds",
      }),
      new Paragraph({
        text: "• Generate booking confirmations and receipts",
      }),
      new Paragraph({
        text: "4.3 POS System Module",
        heading: HeadingLevel.HEADING_2,
      }),
      new Paragraph({
        text: "4.3.1 Restaurant POS Operations",
        heading: HeadingLevel.HEADING_3,
      }),
      new Paragraph({
        text: "Starting a New Order:",
      }),
      new Paragraph({
        text: "1. Access POS System from main menu",
      }),
      new Paragraph({
        text: "2. Select table or create new order",
      }),
      new Paragraph({
        text: "3. Browse menu categories",
      }),
      new Paragraph({
        text: "4. Add items to order",
      }),
      new Paragraph({
        text: "5. Modify quantities or add special instructions",
      }),
      new Paragraph({
        text: "6. Apply discounts if applicable",
      }),
      new Paragraph({
        text: "7. Process payment",
      }),
      new Paragraph({
        text: "8. Print receipt",
      }),
      new Paragraph({
        text: "4.3.2 Table Management",
        heading: HeadingLevel.HEADING_3,
      }),
      new Paragraph({
        text: "• Add new tables with capacity and location",
      }),
      new Paragraph({
        text: "• Track table status (Available, Occupied, Reserved)",
      }),
      new Paragraph({
        text: "• Assign servers to tables",
      }),
      new Paragraph({
        text: "• Split bills between multiple guests",
      }),
      new Paragraph({
        text: "• Handle table transfers and combinations",
      }),
      new Paragraph({
        text: "4.4 Inventory Management Module",
        heading: HeadingLevel.HEADING_2,
      }),
      new Paragraph({
        text: "4.4.1 Stock Tracking",
        heading: HeadingLevel.HEADING_3,
      }),
      new Paragraph({
        text: "Adding New Items:",
      }),
      new Paragraph({
        text: "1. Navigate to Admin > Inventory",
      }),
      new Paragraph({
        text: "2. Click 'Add New Item'",
      }),
      new Paragraph({
        text: "3. Enter item details:",
      }),
      new Paragraph({
        text: "   • Item name and description",
      }),
      new Paragraph({
        text: "   • Category (Food, Beverage, Supplies, etc.)",
      }),
      new Paragraph({
        text: "   • Unit of measurement",
      }),
      new Paragraph({
        text: "   • Current stock level",
      }),
      new Paragraph({
        text: "   • Minimum stock threshold",
      }),
      new Paragraph({
        text: "   • Supplier information",
      }),
      new Paragraph({
        text: "   • Cost per unit",
      }),
      new Paragraph({
        text: "4. Save item to inventory",
      }),
      new Paragraph({
        text: "4.4.2 Stock Movements",
      }),
      new Paragraph({
        text: "• Receive stock: Record incoming deliveries",
      }),
      new Paragraph({
        text: "• Issue stock: Track items used in operations",
      }),
      new Paragraph({
        text: "• Transfer stock: Move items between locations",
      }),
      new Paragraph({
        text: "• Adjust stock: Correct discrepancies",
      }),
      new Paragraph({
        text: "• Stock takes: Perform physical inventory counts",
      }),
      new Paragraph({
        text: "4.5 Guest Management Module",
        heading: HeadingLevel.HEADING_2,
      }),
      new Paragraph({
        text: "4.5.1 Guest Profiles",
        heading: HeadingLevel.HEADING_3,
      }),
      new Paragraph({
        text: "Creating Guest Profiles:",
      }),
      new Paragraph({
        text: "1. Go to Admin > Guests",
      }),
      new Paragraph({
        text: "2. Click 'Add New Guest'",
      }),
      new Paragraph({
        text: "3. Enter guest information:",
      }),
      new Paragraph({
        text: "   • Personal details (name, contact info)",
      }),
      new Paragraph({
        text: "   • Identification information",
      }),
      new Paragraph({
        text: "   • Preferences and special requirements",
      }),
      new Paragraph({
        text: "   • VIP status and loyalty program membership",
      }),
      new Paragraph({
        text: "4. Save guest profile",
      }),
      new Paragraph({
        text: "4.5.2 Guest History Tracking",
        heading: HeadingLevel.HEADING_3,
      }),
      new Paragraph({
        text: "• View complete stay history",
      }),
      new Paragraph({
        text: "• Track spending patterns",
      }),
      new Paragraph({
        text: "• Monitor preferences and feedback",
      }),
      new Paragraph({
        text: "• Manage loyalty points and rewards",
      }),
      new Paragraph({
        text: "• Generate personalized offers",
      }),
      new Paragraph({
        text: "4.6 Accounting Module",
        heading: HeadingLevel.HEADING_2,
      }),
      new Paragraph({
        text: "4.6.1 Financial Tracking",
        heading: HeadingLevel.HEADING_3,
      }),
      new Paragraph({
        text: "Recording Transactions:",
      }),
      new Paragraph({
        text: "1. Access Admin > Accounting",
      }),
      new Paragraph({
        text: "2. Click 'Add Entry'",
      }),
      new Paragraph({
        text: "3. Select transaction type (Income/Expense)",
      }),
      new Paragraph({
        text: "4. Choose category (Room Revenue, F&B, Marketing, etc.)",
      }),
      new Paragraph({
        text: "5. Enter amount and description",
      }),
      new Paragraph({
        text: "6. Attach receipts or supporting documents",
      }),
      new Paragraph({
        text: "7. Save entry",
      }),
      new Paragraph({
        text: "4.6.2 Financial Reporting",
        heading: HeadingLevel.HEADING_3,
      }),
      new Paragraph({
        text: "• Daily sales reports",
      }),
      new Paragraph({
        text: "• Monthly financial statements",
      }),
      new Paragraph({
        text: "• Budget vs. actual analysis",
      }),
      new Paragraph({
        text: "• Cash flow projections",
      }),
      new Paragraph({
        text: "• Tax reporting assistance",
      }),
      new Paragraph({
        text: "4.7 HR Management Module",
        heading: HeadingLevel.HEADING_2,
      }),
      new Paragraph({
        text: "4.7.1 Employee Management",
        heading: HeadingLevel.HEADING_3,
      }),
      new Paragraph({
        text: "Adding Staff Members:",
      }),
      new Paragraph({
        text: "1. Navigate to Admin > HR",
      }),
      new Paragraph({
        text: "2. Click 'Add Employee'",
      }),
      new Paragraph({
        text: "3. Enter employee details:",
      }),
      new Paragraph({
        text: "   • Personal information",
      }),
      new Paragraph({
        text: "   • Job title and department",
      }),
      new Paragraph({
        text: "   • Salary and benefits",
      }),
      new Paragraph({
        text: "   • Start date and contract terms",
      }),
      new Paragraph({
        text: "   • Emergency contacts",
      }),
      new Paragraph({
        text: "4. Set up system access and permissions",
      }),
      new Paragraph({
        text: "5. Save employee record",
      }),
      new Paragraph({
        text: "4.7.2 Payroll Processing",
        heading: HeadingLevel.HEADING_3,
      }),
      new Paragraph({
        text: "• Track working hours and overtime",
      }),
      new Paragraph({
        text: "• Calculate salaries and deductions",
      }),
      new Paragraph({
        text: "• Generate payslips",
      }),
      new Paragraph({
        text: "• Process leave requests",
      }),
      new Paragraph({
        text: "• Manage benefits and allowances",
      }),
    ];
  }

  private createMobileGuide(): Paragraph[] {
    return [
      new Paragraph({
        text: "5. MOBILE APP GUIDE",
        heading: HeadingLevel.HEADING_1,
        pageBreakBefore: true,
      }),
      new Paragraph({
        text: "5.1 Mobile Staff App Overview",
        heading: HeadingLevel.HEADING_2,
      }),
      new Paragraph({
        text: "The ALOKOLODO HOTELS Staff mobile app provides on-the-go access to essential hotel management functions, optimized for smartphones and tablets.",
      }),
      new Paragraph({
        text: "5.1.1 App Features",
        heading: HeadingLevel.HEADING_3,
      }),
      new Paragraph({
        text: "• Native iOS and Android applications",
      }),
      new Paragraph({
        text: "• Touch-optimized interface",
      }),
      new Paragraph({
        text: "• Offline capability for critical functions",
      }),
      new Paragraph({
        text: "• Push notifications for important alerts",
      }),
      new Paragraph({
        text: "• Quick action dashboard",
      }),
      new Paragraph({
        text: "• Real-time synchronization with main system",
      }),
      new Paragraph({
        text: "5.2 Mobile Login and Navigation",
        heading: HeadingLevel.HEADING_2,
      }),
      new Paragraph({
        text: "5.2.1 Accessing the Mobile App",
        heading: HeadingLevel.HEADING_3,
      }),
      new Paragraph({
        text: "Method 1 - Native App:",
      }),
      new Paragraph({
        text: "1. Download and install the app (when available)",
      }),
      new Paragraph({
        text: "2. Open ALOKOLODO HOTELS Staff app",
      }),
      new Paragraph({
        text: "3. Enter staff email and password",
      }),
      new Paragraph({
        text: "4. Tap 'Sign In'",
      }),
      new Paragraph({
        text: "Method 2 - Mobile Web:",
      }),
      new Paragraph({
        text: "1. Open mobile browser",
      }),
      new Paragraph({
        text: "2. Navigate to [hotel-domain]/mobile/staff-login",
      }),
      new Paragraph({
        text: "3. Enter credentials",
      }),
      new Paragraph({
        text: "4. Bookmark for quick future access",
      }),
      new Paragraph({
        text: "Method 3 - QR Code:",
      }),
      new Paragraph({
        text: "1. Scan QR code from staff area",
      }),
      new Paragraph({
        text: "2. This opens mobile login page",
      }),
      new Paragraph({
        text: "3. Enter credentials to access system",
      }),
      new Paragraph({
        text: "5.2.2 Mobile Dashboard",
        heading: HeadingLevel.HEADING_3,
      }),
      new Paragraph({
        text: "The mobile dashboard provides quick access to:",
      }),
      new Paragraph({
        text: "• Room status overview",
      }),
      new Paragraph({
        text: "• Recent notifications and alerts",
      }),
      new Paragraph({
        text: "• Quick action buttons for common tasks",
      }),
      new Paragraph({
        text: "• Connection status indicator",
      }),
      new Paragraph({
        text: "• Staff profile and department info",
      }),
      new Paragraph({
        text: "5.3 Mobile Module Access",
        heading: HeadingLevel.HEADING_2,
      }),
      new Paragraph({
        text: "5.3.1 Quick Actions Grid",
        heading: HeadingLevel.HEADING_3,
      }),
      new Paragraph({
        text: "The mobile interface organizes functions into quick-access cards:",
      }),
      new Paragraph({
        text: "• Rooms - Check room status, update housekeeping",
      }),
      new Paragraph({
        text: "• Guests - View guest info, manage check-ins",
      }),
      new Paragraph({
        text: "• POS - Process orders and payments",
      }),
      new Paragraph({
        text: "• Menu - Update items and prices",
      }),
      new Paragraph({
        text: "• Bookings - View and manage reservations",
      }),
      new Paragraph({
        text: "• Gym - Track member check-ins",
      }),
      new Paragraph({
        text: "5.3.2 Offline Functionality",
        heading: HeadingLevel.HEADING_3,
      }),
      new Paragraph({
        text: "When internet connection is unavailable:",
      }),
      new Paragraph({
        text: "• View cached data (room status, guest lists)",
      }),
      new Paragraph({
        text: "• Record critical updates for later sync",
      }),
      new Paragraph({
        text: "• Access emergency contact information",
      }),
      new Paragraph({
        text: "• Continue basic operations with local storage",
      }),
      new Paragraph({
        text: "• Automatic sync when connection resumes",
      }),
      new Paragraph({
        text: "5.4 Mobile-Specific Features",
        heading: HeadingLevel.HEADING_2,
      }),
      new Paragraph({
        text: "5.4.1 Push Notifications",
        heading: HeadingLevel.HEADING_3,
      }),
      new Paragraph({
        text: "Staff receive instant notifications for:",
      }),
      new Paragraph({
        text: "• New bookings requiring attention",
      }),
      new Paragraph({
        text: "• Maintenance requests",
      }),
      new Paragraph({
        text: "• Guest complaints or special requests",
      }),
      new Paragraph({
        text: "• Low inventory alerts",
      }),
      new Paragraph({
        text: "• Schedule changes or updates",
      }),
      new Paragraph({
        text: "• Emergency situations",
      }),
      new Paragraph({
        text: "5.4.2 Touch Gestures",
        heading: HeadingLevel.HEADING_3,
      }),
      new Paragraph({
        text: "• Tap - Select items or activate functions",
      }),
      new Paragraph({
        text: "• Swipe left/right - Navigate between screens",
      }),
      new Paragraph({
        text: "• Pull down - Refresh data",
      }),
      new Paragraph({
        text: "• Long press - Access additional options",
      }),
      new Paragraph({
        text: "• Pinch to zoom - Enlarge text or images",
      }),
      new Paragraph({
        text: "5.5 Mobile Troubleshooting",
        heading: HeadingLevel.HEADING_2,
      }),
      new Paragraph({
        text: "5.5.1 Common Issues",
        heading: HeadingLevel.HEADING_3,
      }),
      new Paragraph({
        text: "Login Problems:",
      }),
      new Paragraph({
        text: "• Verify internet connection",
      }),
      new Paragraph({
        text: "• Check credentials with supervisor",
      }),
      new Paragraph({
        text: "• Clear browser cache (mobile web)",
      }),
      new Paragraph({
        text: "• Restart app (native app)",
      }),
      new Paragraph({
        text: "Sync Issues:",
      }),
      new Paragraph({
        text: "• Ensure stable internet connection",
      }),
      new Paragraph({
        text: "• Force refresh by pulling down",
      }),
      new Paragraph({
        text: "• Log out and log back in",
      }),
      new Paragraph({
        text: "• Contact IT support if persistent",
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
        text: "6.1.1 Login and Authentication",
        heading: HeadingLevel.HEADING_3,
      }),
      new Paragraph({
        text: "Problem: Cannot log in to system",
      }),
      new Paragraph({
        text: "Solutions:",
      }),
      new Paragraph({
        text: "• Verify username and password are correct",
      }),
      new Paragraph({
        text: "• Check internet connection",
      }),
      new Paragraph({
        text: "• Clear browser cache and cookies",
      }),
      new Paragraph({
        text: "• Try different browser or device",
      }),
      new Paragraph({
        text: "• Contact administrator for password reset",
      }),
      new Paragraph({
        text: "Problem: Session keeps timing out",
      }),
      new Paragraph({
        text: "Solutions:",
      }),
      new Paragraph({
        text: "• Check for browser extensions blocking cookies",
      }),
      new Paragraph({
        text: "• Ensure stable internet connection",
      }),
      new Paragraph({
        text: "• Contact IT to adjust session timeout settings",
      }),
      new Paragraph({
        text: "6.1.2 Data Loading Issues",
        heading: HeadingLevel.HEADING_3,
      }),
      new Paragraph({
        text: "Problem: Pages load slowly or not at all",
      }),
      new Paragraph({
        text: "Solutions:",
      }),
      new Paragraph({
        text: "• Check internet speed (minimum 10 Mbps recommended)",
      }),
      new Paragraph({
        text: "• Close unnecessary browser tabs",
      }),
      new Paragraph({
        text: "• Restart browser or device",
      }),
      new Paragraph({
        text: "• Contact IT if problem persists",
      }),
      new Paragraph({
        text: "Problem: Data not updating in real-time",
      }),
      new Paragraph({
        text: "Solutions:",
      }),
      new Paragraph({
        text: "• Refresh page manually",
      }),
      new Paragraph({
        text: "• Check for browser notification blocks",
      }),
      new Paragraph({
        text: "• Verify system permissions with administrator",
      }),
      new Paragraph({
        text: "6.1.3 Mobile App Issues",
        heading: HeadingLevel.HEADING_3,
      }),
      new Paragraph({
        text: "Problem: Mobile app won't sync",
      }),
      new Paragraph({
        text: "Solutions:",
      }),
      new Paragraph({
        text: "• Check mobile data/WiFi connection",
      }),
      new Paragraph({
        text: "• Force close and restart app",
      }),
      new Paragraph({
        text: "• Log out and log back in",
      }),
      new Paragraph({
        text: "• Update app to latest version",
      }),
      new Paragraph({
        text: "Problem: Can't access certain features",
      }),
      new Paragraph({
        text: "Solutions:",
      }),
      new Paragraph({
        text: "• Verify user role permissions",
      }),
      new Paragraph({
        text: "• Check mobile app version compatibility",
      }),
      new Paragraph({
        text: "• Contact administrator for access rights",
      }),
      new Paragraph({
        text: "6.2 Performance Optimization",
        heading: HeadingLevel.HEADING_2,
      }),
      new Paragraph({
        text: "6.2.1 System Performance",
        heading: HeadingLevel.HEADING_3,
      }),
      new Paragraph({
        text: "To maintain optimal system performance:",
      }),
      new Paragraph({
        text: "• Regularly clear browser cache",
      }),
      new Paragraph({
        text: "• Keep browser updated to latest version",
      }),
      new Paragraph({
        text: "• Close unused browser tabs",
      }),
      new Paragraph({
        text: "• Restart browser daily",
      }),
      new Paragraph({
        text: "• Use recommended browsers (Chrome, Firefox, Safari, Edge)",
      }),
      new Paragraph({
        text: "6.2.2 Network Optimization",
        heading: HeadingLevel.HEADING_3,
      }),
      new Paragraph({
        text: "• Ensure stable internet connection (minimum 10 Mbps)",
      }),
      new Paragraph({
        text: "• Use wired connection when possible",
      }),
      new Paragraph({
        text: "• Position devices close to WiFi router",
      }),
      new Paragraph({
        text: "• Limit bandwidth-heavy activities during peak hours",
      }),
      new Paragraph({
        text: "6.3 Data Backup and Recovery",
        heading: HeadingLevel.HEADING_2,
      }),
      new Paragraph({
        text: "6.3.1 Automatic Backups",
        heading: HeadingLevel.HEADING_3,
      }),
      new Paragraph({
        text: "The system automatically backs up data:",
      }),
      new Paragraph({
        text: "• Real-time data replication to cloud servers",
      }),
      new Paragraph({
        text: "• Daily complete system backups",
      }),
      new Paragraph({
        text: "• Weekly archive backups for long-term storage",
      }),
      new Paragraph({
        text: "• Automatic disaster recovery protocols",
      }),
      new Paragraph({
        text: "6.3.2 Data Recovery Procedures",
        heading: HeadingLevel.HEADING_3,
      }),
      new Paragraph({
        text: "In case of data loss:",
      }),
      new Paragraph({
        text: "1. Contact system administrator immediately",
      }),
      new Paragraph({
        text: "2. Provide details about when data was last seen",
      }),
      new Paragraph({
        text: "3. Do not attempt to recreate lost data immediately",
      }),
      new Paragraph({
        text: "4. Administrator will initiate recovery from backups",
      }),
      new Paragraph({
        text: "5. Verify recovered data accuracy before resuming operations",
      }),
      new Paragraph({
        text: "6.4 Security Best Practices",
        heading: HeadingLevel.HEADING_2,
      }),
      new Paragraph({
        text: "6.4.1 Password Security",
        heading: HeadingLevel.HEADING_3,
      }),
      new Paragraph({
        text: "• Use strong, unique passwords for system access",
      }),
      new Paragraph({
        text: "• Change passwords every 90 days",
      }),
      new Paragraph({
        text: "• Never share login credentials",
      }),
      new Paragraph({
        text: "• Log out when leaving workstation",
      }),
      new Paragraph({
        text: "• Report suspected security breaches immediately",
      }),
      new Paragraph({
        text: "6.4.2 Data Protection",
        heading: HeadingLevel.HEADING_3,
      }),
      new Paragraph({
        text: "• Access only data necessary for your role",
      }),
      new Paragraph({
        text: "• Do not download or export data without authorization",
      }),
      new Paragraph({
        text: "• Keep guest information confidential",
      }),
      new Paragraph({
        text: "• Use system features rather than external tools",
      }),
      new Paragraph({
        text: "• Report data access violations",
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
        text: "7.1 System Shortcuts and Hotkeys",
        heading: HeadingLevel.HEADING_2,
      }),
      new Paragraph({
        text: "7.1.1 Universal Shortcuts",
        heading: HeadingLevel.HEADING_3,
      }),
      new Paragraph({
        text: "• Ctrl+S (Cmd+S on Mac) - Save current form",
      }),
      new Paragraph({
        text: "• Ctrl+F (Cmd+F on Mac) - Search/Find in page",
      }),
      new Paragraph({
        text: "• Ctrl+R (Cmd+R on Mac) - Refresh page",
      }),
      new Paragraph({
        text: "• Ctrl+N (Cmd+N on Mac) - New item (where applicable)",
      }),
      new Paragraph({
        text: "• Escape - Close modal dialogs",
      }),
      new Paragraph({
        text: "• Tab - Navigate between form fields",
      }),
      new Paragraph({
        text: "• Enter - Submit forms",
      }),
      new Paragraph({
        text: "7.1.2 Module-Specific Shortcuts",
        heading: HeadingLevel.HEADING_3,
      }),
      new Paragraph({
        text: "POS System:",
      }),
      new Paragraph({
        text: "• F1 - New order",
      }),
      new Paragraph({
        text: "• F2 - Process payment",
      }),
      new Paragraph({
        text: "• F3 - Print receipt",
      }),
      new Paragraph({
        text: "• F4 - Void item",
      }),
      new Paragraph({
        text: "Booking Management:",
      }),
      new Paragraph({
        text: "• Ctrl+B - New booking",
      }),
      new Paragraph({
        text: "• Ctrl+I - Check-in",
      }),
      new Paragraph({
        text: "• Ctrl+O - Check-out",
      }),
      new Paragraph({
        text: "7.2 Error Codes and Messages",
        heading: HeadingLevel.HEADING_2,
      }),
      new Paragraph({
        text: "7.2.1 Common Error Codes",
        heading: HeadingLevel.HEADING_3,
      }),
      new Paragraph({
        text: "AUTH001 - Invalid credentials",
      }),
      new Paragraph({
        text: "• Solution: Check username and password",
      }),
      new Paragraph({
        text: "CONN001 - Connection timeout",
      }),
      new Paragraph({
        text: "• Solution: Check internet connection",
      }),
      new Paragraph({
        text: "DATA001 - Data validation error",
      }),
      new Paragraph({
        text: "• Solution: Check required fields and data format",
      }),
      new Paragraph({
        text: "PERM001 - Insufficient permissions",
      }),
      new Paragraph({
        text: "• Solution: Contact administrator for access rights",
      }),
      new Paragraph({
        text: "SYNC001 - Data synchronization failed",
      }),
      new Paragraph({
        text: "• Solution: Retry operation or contact support",
      }),
      new Paragraph({
        text: "7.3 Contact Information",
        heading: HeadingLevel.HEADING_2,
      }),
      new Paragraph({
        text: "7.3.1 Technical Support",
        heading: HeadingLevel.HEADING_3,
      }),
      new Paragraph({
        text: "System Administrator: [Contact details to be filled]",
      }),
      new Paragraph({
        text: "IT Support: [Contact details to be filled]",
      }),
      new Paragraph({
        text: "Emergency Support: [24/7 contact details to be filled]",
      }),
      new Paragraph({
        text: "7.3.2 Training Support",
        heading: HeadingLevel.HEADING_3,
      }),
      new Paragraph({
        text: "Training Coordinator: [Contact details to be filled]",
      }),
      new Paragraph({
        text: "Department Supervisors: [Contact details to be filled]",
      }),
      new Paragraph({
        text: "7.4 System Specifications",
        heading: HeadingLevel.HEADING_2,
      }),
      new Paragraph({
        text: "7.4.1 Technical Architecture",
        heading: HeadingLevel.HEADING_3,
      }),
      new Paragraph({
        text: "Frontend Technology: React 18.3.1 with TypeScript",
      }),
      new Paragraph({
        text: "Backend Service: Supabase (PostgreSQL + Real-time APIs)",
      }),
      new Paragraph({
        text: "Mobile Framework: Capacitor for native iOS/Android",
      }),
      new Paragraph({
        text: "UI Framework: Tailwind CSS with shadcn/ui components",
      }),
      new Paragraph({
        text: "Authentication: Supabase Auth with role-based access control",
      }),
      new Paragraph({
        text: "File Storage: Supabase Storage for documents and media",
      }),
      new Paragraph({
        text: "7.4.2 Browser Compatibility",
        heading: HeadingLevel.HEADING_3,
      }),
      new Paragraph({
        text: "Supported Browsers:",
      }),
      new Paragraph({
        text: "• Chrome 90+ (Recommended)",
      }),
      new Paragraph({
        text: "• Firefox 88+",
      }),
      new Paragraph({
        text: "• Safari 14+",
      }),
      new Paragraph({
        text: "• Microsoft Edge 90+",
      }),
      new Paragraph({
        text: "7.5 Glossary",
        heading: HeadingLevel.HEADING_2,
      }),
      new Paragraph({
        text: "ADR - Average Daily Rate",
      }),
      new Paragraph({
        text: "API - Application Programming Interface",
      }),
      new Paragraph({
        text: "F&B - Food & Beverage",
      }),
      new Paragraph({
        text: "PMS - Property Management System",
      }),
      new Paragraph({
        text: "POS - Point of Sale",
      }),
      new Paragraph({
        text: "RevPAR - Revenue Per Available Room",
      }),
      new Paragraph({
        text: "RLS - Row Level Security",
      }),
      new Paragraph({
        text: "SaaS - Software as a Service",
      }),
      new Paragraph({
        text: "UI - User Interface",
      }),
      new Paragraph({
        text: "UX - User Experience",
      }),
    ];
  }

  public async generateDocumentation(): Promise<ArrayBuffer> {
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

    const document = new Document({
      creator: "ALOKOLODO HOTELS Management System",
      title: "Hotel Management System - Complete Documentation",
      description: "Comprehensive installation, training, and user guides",
      styles: {
        paragraphStyles: [
          {
            id: "Heading1",
            name: "Heading 1",
            basedOn: "Normal",
            next: "Normal",
            quickFormat: true,
            run: {
              size: 28,
              bold: true,
              color: "1F4E79",
            },
            paragraph: {
              spacing: {
                after: 300,
              },
            },
          },
          {
            id: "Heading2",
            name: "Heading 2",
            basedOn: "Normal",
            next: "Normal",
            quickFormat: true,
            run: {
              size: 24,
              bold: true,
              color: "2F5F8F",
            },
            paragraph: {
              spacing: {
                after: 200,
              },
            },
          },
          {
            id: "Heading3",
            name: "Heading 3",
            basedOn: "Normal",
            next: "Normal",
            quickFormat: true,
            run: {
              size: 20,
              bold: true,
              color: "4472C4",
            },
            paragraph: {
              spacing: {
                after: 100,
              },
            },
          },
        ],
      },
      sections: [
        {
          properties: {},
          children: sections,
        },
      ],
    });

    return await Packer.toBuffer(document);
  }
}