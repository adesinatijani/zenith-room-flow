# ALOKOLODO HOTELS - Complete User Guide

## Table of Contents
1. [Introduction](#introduction)
2. [Getting Started](#getting-started)
3. [Dashboard Overview](#dashboard-overview)
4. [Room Management](#room-management)
5. [Guest Management](#guest-management)
6. [Booking System](#booking-system)
7. [Restaurant & POS](#restaurant--pos)
8. [Menu Management](#menu-management)
9. [Inventory Management](#inventory-management)
10. [Gym Management](#gym-management)
11. [Game Center](#game-center)
12. [Hall Management](#hall-management)
13. [Payments & Accounting](#payments--accounting)
14. [HR Management](#hr-management)
15. [Housekeeping](#housekeeping)
16. [Supplier Management](#supplier-management)
17. [Reports & Analytics](#reports--analytics)
18. [Settings & Configuration](#settings--configuration)
19. [Mobile App Usage](#mobile-app-usage)
20. [Troubleshooting](#troubleshooting)

---

## Introduction

Welcome to ALOKOLODO HOTELS Management System - a comprehensive hotel management solution that handles everything from room bookings to staff management, inventory control, and guest services.

### Key Features
- Complete hotel operations management
- Integrated POS system for restaurant and bar
- Guest loyalty program with tier-based rewards
- Real-time inventory tracking
- Staff management and payroll
- Mobile app for staff on-the-go
- Advanced reporting and analytics

### System Requirements
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Internet connection
- For mobile: iOS 12+ or Android 8+

---

## Getting Started

### First Time Login

1. **Access the System**
   - Open your web browser
   - Navigate to your hotel's system URL
   - You'll see the login page

2. **Login Credentials**
   - Enter your email address
   - Enter your password
   - Click "Sign In"
   
3. **First Login Setup**
   - The first user to register becomes the Admin
   - Subsequent users are assigned Staff role by default
   - Admins can change user roles later

### User Roles

The system has multiple user roles with different permissions:

- **Admin**: Full system access, can manage all modules
- **Manager**: Can manage operations, staff, and view reports
- **Staff**: Limited access to daily operations
- **Front Desk**: Room bookings, guest check-in/check-out
- **Housekeeping**: Room cleaning tasks and status updates
- **Kitchen**: Restaurant orders and menu items
- **Bartender**: Bar orders and inventory
- **Procurement**: Inventory and supplier management
- **HR**: Employee management and payroll
- **Accounting**: Financial records and reports

---

## Dashboard Overview

The main dashboard provides a quick overview of your hotel operations.

### Key Metrics Displayed

1. **Occupancy Rate**
   - Shows percentage of occupied rooms
   - Color-coded indicators (Green: Good, Yellow: Average, Red: Low)

2. **Today's Revenue**
   - Total revenue for current day
   - Breakdown by source (Rooms, Restaurant, Services)

3. **Active Bookings**
   - Number of current guests
   - Check-ins and check-outs for today

4. **Pending Tasks**
   - Housekeeping tasks
   - Pending payments
   - Low inventory alerts

### Quick Actions

- **New Booking**: Create a new room reservation
- **Check-In**: Process guest arrival
- **Create Order**: Start a new restaurant order
- **View Reports**: Access detailed reports

### Navigation Sidebar

The left sidebar provides access to all modules:
- Click any module icon to navigate
- Hover to see module names
- Click the logo to return to dashboard

---

## Room Management

### Viewing Rooms

1. Navigate to **Admin → Rooms**
2. View all rooms with:
   - Room number
   - Room type (Single, Double, Suite, etc.)
   - Price per night
   - Current status (Available, Occupied, Maintenance, Reserved)
   - Amenities

### Adding a New Room

1. Click **"Add Room"** button
2. Fill in room details:
   - **Room Number**: Unique identifier (e.g., 101, 205)
   - **Room Type**: Select from dropdown
   - **Price**: Nightly rate
   - **Amenities**: Select available features (WiFi, TV, AC, Minibar, etc.)
   - **Description**: Optional room description
3. Click **"Add Room"** to save

### Editing Room Information

1. Find the room you want to edit
2. Click the **Edit** icon (pencil)
3. Modify any fields
4. Click **"Save Changes"**

### Room Status Management

Room statuses are automatically updated based on bookings:
- **Available**: Ready for new guests
- **Occupied**: Currently has guests
- **Reserved**: Booked for future date
- **Maintenance**: Under repair/cleaning
- **Out of Service**: Not available for booking

To manually change status:
1. Click on the room
2. Select new status from dropdown
3. Add notes if needed
4. Save changes

### Room Calendar

1. Click **"Room Calendar"** button
2. View monthly room availability
3. Color-coded status indicators:
   - Green: Available
   - Blue: Reserved
   - Red: Occupied
   - Yellow: Maintenance

---

## Guest Management

### Guest Database

The system maintains a complete database of all guests with:
- Contact information
- Booking history
- Total spending
- Loyalty tier status
- Special preferences

### Adding a New Guest

1. Navigate to **Admin → Guests**
2. Click **"Add Guest"** button
3. Enter guest information:
   - **Full Name**: First and last name
   - **Email**: Valid email address
   - **Phone**: Contact number
   - **ID/Passport**: For identification
   - **Address**: Optional
   - **Special Requests**: Dietary restrictions, preferences, etc.
4. Click **"Add Guest"**

### Viewing Guest Profile

1. Search for guest by name, email, or phone
2. Click on guest name
3. View complete profile showing:
   - Contact information
   - Booking history
   - Total bookings and spending
   - Loyalty tier
   - Notes and preferences

### Guest Loyalty Program

The system automatically assigns loyalty tiers based on spending:

#### Tier Levels
- **Bronze**: $0 - $1,999
- **Silver**: $2,000 - $4,999
- **Gold**: $5,000 - $9,999
- **Platinum**: $10,000+

#### Benefits by Tier
- **Bronze**: Welcome tier, standard service
- **Silver**: 5% discount, priority check-in
- **Gold**: 10% discount, room upgrades, late checkout
- **Platinum**: 15% discount, complimentary services, VIP treatment

### Guest Status

- **Active**: Current or recent guests
- **Inactive**: Haven't visited recently
- **VIP**: Special designation for important guests
- **Blacklisted**: Banned from property

### Editing Guest Information

1. Open guest profile
2. Click **"Edit"** button
3. Update any fields
4. Save changes

### Guest History

View complete booking history:
1. Open guest profile
2. Click **"View History"** tab
3. See all past bookings with:
   - Check-in/check-out dates
   - Room number
   - Amount paid
   - Special requests

---

## Booking System

### Creating a New Booking

#### Method 1: Quick Booking
1. Click **"New Booking"** from dashboard
2. Select or create guest
3. Choose room
4. Select dates
5. Enter payment information
6. Confirm booking

#### Method 2: Detailed Booking
1. Navigate to **Admin → Bookings**
2. Click **"Create Booking"**
3. **Guest Information**:
   - Search existing guest or create new
   - Verify contact details
4. **Room Selection**:
   - View available rooms for dates
   - Filter by type, price, amenities
   - Select room
5. **Date Selection**:
   - Check-in date
   - Check-out date
   - System calculates nights and total
6. **Additional Services**:
   - Add breakfast
   - Airport pickup
   - Extra amenities
7. **Payment**:
   - Choose payment method
   - Process payment or mark as pending
8. **Special Requests**:
   - Add any special requirements
   - Room preferences
9. Click **"Confirm Booking"**

### Managing Bookings

#### Viewing All Bookings
1. Navigate to **Admin → Bookings**
2. View list of all bookings
3. Filter by:
   - Status (Active, Completed, Cancelled)
   - Date range
   - Guest name
   - Room number

#### Booking Statuses
- **Confirmed**: Payment received, reservation confirmed
- **Pending**: Awaiting payment confirmation
- **Active**: Guest currently checked in
- **Completed**: Stay finished, guest checked out
- **Cancelled**: Booking cancelled

### Check-In Process

1. Open booking from list
2. Click **"Check In"** button
3. Verify:
   - Guest identification
   - Payment status
   - Room assignment
4. Collect:
   - Deposit (if applicable)
   - Credit card imprint
   - Signed registration card
5. Issue room key
6. Explain hotel facilities
7. Click **"Complete Check-In"**

### Check-Out Process

1. Open active booking
2. Click **"Check Out"** button
3. Review:
   - Room charges
   - Restaurant/bar charges
   - Additional services
4. Process final payment
5. Collect room key
6. Request feedback
7. Click **"Complete Check-Out"**

### Modifying Bookings

#### Changing Dates
1. Open booking
2. Click **"Modify"**
3. Select new dates
4. System checks availability
5. Recalculates charges
6. Process payment difference
7. Save changes

#### Changing Room
1. Open booking
2. Click **"Change Room"**
3. View available rooms
4. Select new room
5. Update charges if different rate
6. Confirm change

### Cancelling Bookings

1. Open booking
2. Click **"Cancel"** button
3. Select cancellation reason
4. Process refund according to policy
5. Confirm cancellation
6. Send cancellation confirmation to guest

---

## Restaurant & POS

### POS System Overview

The Point of Sale system handles all restaurant and bar orders.

### Starting a New Order

1. Navigate to **POS System**
2. Click **"New Order"**
3. **Select Table or Guest**:
   - Choose table number for dine-in
   - Select room number for room service
   - Enter walk-in customer
4. **Add Items**:
   - Browse menu categories
   - Click items to add
   - Adjust quantities
   - Add special instructions
5. **Review Order**:
   - Check items and prices
   - Add discounts if applicable
   - Apply guest loyalty discount
6. **Submit to Kitchen**:
   - Click **"Submit Order"**
   - Order appears in kitchen display

### Table Management

#### Adding Tables
1. Go to **POS → Admin Settings**
2. Click **"Add Table"**
3. Enter:
   - Table number
   - Seating capacity
   - Location (if multiple sections)
4. Save table

#### Table Status
- **Available**: Ready for guests
- **Occupied**: Currently serving
- **Reserved**: Booked for specific time
- **Cleaning**: Being prepared

### Processing Orders

#### Kitchen Display
1. Kitchen staff sees orders in real-time
2. Each order shows:
   - Table/room number
   - Items ordered
   - Special instructions
   - Time ordered
3. Staff marks items as:
   - **Received**: Order acknowledged
   - **Preparing**: Being cooked
   - **Ready**: Ready to serve
   - **Served**: Delivered to guest

### Payment Processing

1. **Open Order**:
   - Click on table/order
2. **Review Bill**:
   - Verify all items
   - Check totals
3. **Apply Adjustments**:
   - Add tips
   - Apply discounts
   - Split bill if needed
4. **Select Payment Method**:
   - Cash
   - Credit/Debit Card
   - Room Charge
   - Mobile Payment
5. **Process Payment**:
   - Enter amount received
   - Calculate change
   - Print receipt
6. **Close Order**

### Split Bills

1. Open order
2. Click **"Split Bill"**
3. Choose split method:
   - By items (each person pays for their items)
   - By percentage
   - Custom amounts
4. Process each payment separately

### Room Service Orders

1. Create order as normal
2. Select **"Room Service"**
3. Enter room number
4. Charges automatically added to room bill
5. Guest signs at check-out

---

## Menu Management

### Viewing Menu Items

1. Navigate to **Admin → Menu**
2. View all menu items organized by category
3. See:
   - Item name
   - Category
   - Price
   - Cost price (for profit calculation)
   - Availability status

### Adding Menu Items

1. Click **"Add Menu Item"**
2. Enter details:
   - **Item Name**: Dish/drink name
   - **Category**: Main Course, Appetizer, Dessert, Drinks, etc.
   - **Description**: Brief description
   - **Price**: Selling price
   - **Cost Price**: Your cost (for profit tracking)
   - **Preparation Time**: Estimated minutes
3. **Set Availability**:
   - Available/Not Available
   - Schedule (breakfast, lunch, dinner, all-day)
4. **Track Inventory** (optional):
   - Link to inventory items
   - Auto-deduct from stock when sold
5. **Upload Image** (optional)
6. Click **"Add Item"**

### Editing Menu Items

1. Find item in list
2. Click **Edit** icon
3. Modify any fields
4. Save changes

### Menu Categories

Standard categories include:
- **Appetizers**: Starters and small plates
- **Main Course**: Entrees and main dishes
- **Desserts**: Sweet dishes
- **Beverages**: Soft drinks, juices
- **Alcoholic Drinks**: Beer, wine, spirits
- **Hot Beverages**: Coffee, tea
- **Breakfast Items**: Morning menu
- **Special Dietary**: Vegan, gluten-free, etc.

### Menu Pricing Strategy

1. **Set Cost Price**: What you pay for ingredients
2. **Set Selling Price**: What guests pay
3. **View Profit Margin**: System calculates automatically
4. **Adjust for Events**: Create special pricing for promotions

### Seasonal Menus

1. Create seasonal items
2. Set availability dates
3. Items auto-activate/deactivate
4. Archive old seasonal items

### Menu Templates

1. Save current menu as template
2. Use templates to:
   - Quickly switch between menus
   - Create special event menus
   - A/B test menu changes

---

## Inventory Management

### Inventory Overview

Track all consumables and supplies:
- Food ingredients
- Beverages
- Cleaning supplies
- Toiletries
- Linens
- Office supplies

### Viewing Inventory

1. Navigate to **Admin → Inventory**
2. View all items with:
   - Item name
   - Category
   - Current quantity
   - Unit of measure
   - Cost per unit
   - Total value
   - Reorder level
   - Status (In Stock, Low Stock, Out of Stock)

### Adding Inventory Items

1. Click **"Add Item"**
2. Enter details:
   - **Item Name**: Descriptive name
   - **Category**: Food, Beverage, Supplies, etc.
   - **Unit**: Kg, Liters, Pieces, Boxes, etc.
   - **Current Quantity**: Starting amount
   - **Cost Per Unit**: Purchase price
   - **Supplier**: Default supplier
   - **Min Threshold**: Low stock alert level
   - **Max Threshold**: Maximum stock level
3. Click **"Add Item"**

### Restocking Items

1. Find item needing restock
2. Click **"Restock"** button
3. Enter:
   - **Quantity Added**: Amount received
   - **Cost Per Unit**: Price paid
   - **Supplier**: Who supplied it
   - **Invoice Number**: For records
   - **Date Received**: When delivered
4. System updates:
   - Current quantity
   - Average cost
   - Stock value
5. Save restock record

### Issuing Inventory

When items are used:
1. Click **"Issue Inventory"**
2. Select item
3. Enter:
   - **Quantity Issued**: Amount used
   - **Issued To**: Department/person
   - **Purpose**: What it's for
   - **Room Number**: If applicable
4. System deducts from current stock
5. Tracks usage by department

### Low Stock Alerts

System automatically alerts when:
- Item quantity falls below minimum threshold
- Shows red indicator
- Appears in dashboard notifications
- Can trigger auto-ordering (if configured)

### Inventory Reports

1. **Stock Levels Report**:
   - Current quantities of all items
   - Value of inventory
   - Items needing reorder

2. **Usage Report**:
   - Items used over period
   - Usage by department
   - Cost analysis

3. **Waste Report**:
   - Expired items
   - Damaged items
   - Disposal records

### Physical Inventory Count

Periodic manual verification:
1. Click **"Physical Count"**
2. Enter actual counted quantity for each item
3. System compares to recorded quantity
4. Shows discrepancies
5. Adjust inventory to match count
6. Save count record with notes

---

## Gym Management

### Gym Overview

Manage gym facilities, equipment, members, and trainers.

### Adding Equipment

1. Navigate to **Admin → Gym**
2. Click **"Equipment"** tab
3. Click **"Add Equipment"**
4. Enter details:
   - **Equipment Name**: Treadmill, Weights, etc.
   - **Category**: Cardio, Strength, Free Weights
   - **Serial Number**: For tracking
   - **Purchase Date**: When acquired
   - **Warranty Expiration**: Coverage end date
   - **Location**: Where in gym
5. Save equipment

### Equipment Maintenance

1. View equipment list
2. Click **"Maintenance"** icon
3. Log maintenance:
   - **Type**: Routine, Repair, Inspection
   - **Date Performed**: When done
   - **Technician**: Who did it
   - **Notes**: Details of work
   - **Cost**: If applicable
4. Save record

### Equipment Status

- **Available**: Working and ready
- **In Use**: Currently being used
- **Maintenance**: Under repair
- **Out of Service**: Not functional

### Managing Gym Members

#### Adding Members
1. Click **"Members"** tab
2. Click **"Add Member"**
3. Enter:
   - **Member Name**: Full name
   - **Email**: Contact email
   - **Phone**: Phone number
   - **Membership Type**: Daily, Monthly, Yearly
   - **Start Date**: Membership begins
   - **End Date**: Membership expires
   - **Emergency Contact**: Name and phone
4. Save member

#### Member Check-In
1. Member arrives at gym
2. Search by name or ID
3. Click **"Check In"**
4. System logs:
   - Date and time
   - Duration
5. Track usage statistics

### Trainer Management

#### Adding Trainers
1. Click **"Trainers"** tab
2. Click **"Add Trainer"**
3. Enter:
   - **Name**: Trainer's name
   - **Specialization**: Yoga, HIIT, Personal Training
   - **Availability**: Days and hours
   - **Hourly Rate**: Cost per session
   - **Contact**: Email and phone
4. Save trainer

#### Booking Trainer Sessions
1. Click **"Book Trainer"**
2. Select:
   - Member
   - Trainer
   - Date and time
   - Duration (30 min, 60 min, etc.)
   - Type of session
3. Confirm booking
4. Send confirmation to member

### Gym Classes Schedule

1. Click **"Classes"** tab
2. Add class:
   - **Class Name**: Yoga, Spinning, Aerobics
   - **Instructor**: Assigned trainer
   - **Day and Time**: Schedule
   - **Duration**: Length of class
   - **Max Participants**: Capacity
3. Members can book spots
4. View attendance records

---

## Game Center

Manage gaming stations and sessions.

### Gaming Stations

#### Adding Stations
1. Navigate to **Admin → Game Center**
2. Click **"Add Station"**
3. Enter:
   - **Station Name**: PS5 Station 1, PC Gaming 2
   - **Type**: Console, PC, VR
   - **Hourly Rate**: Cost per hour
   - **Status**: Available, Occupied, Maintenance
4. Save station

### Starting Gaming Sessions

1. Click **"New Session"**
2. Select station
3. Enter:
   - **Player Name**: Guest name
   - **Player Phone**: Contact
   - **Start Time**: When beginning
   - **Estimated Duration**: Hours planned
4. Session starts
5. Clock begins running

### Ending Sessions

1. Open active session
2. Click **"End Session"**
3. System calculates:
   - Actual time played
   - Total charges
   - Payment due
4. Process payment
5. Close session

### Tournament Management

#### Creating Tournaments
1. Click **"Tournaments"** tab
2. Click **"Create Tournament"**
3. Enter:
   - **Tournament Name**: Event title
   - **Game**: Which game
   - **Date**: When held
   - **Entry Fee**: Cost to join
   - **Prize Pool**: Total prizes
   - **Max Participants**: Capacity
4. Save tournament

#### Managing Tournament
1. Register participants
2. Generate brackets
3. Update match results
4. Track leaderboard
5. Award prizes

---

## Hall Management

### Managing Event Halls

#### Adding Halls
1. Navigate to **Admin → Halls**
2. Click **"Add Hall"**
3. Enter:
   - **Hall Name**: Grand Ballroom, Conference Room A
   - **Capacity**: Maximum occupancy
   - **Location**: Floor/area
   - **Hourly Rate**: Rental cost
   - **Amenities**: Projector, Sound System, Catering, etc.
4. Save hall

### Hall Bookings

#### Creating Booking
1. Click **"New Booking"**
2. Select hall
3. Enter:
   - **Client Name**: Who's booking
   - **Contact Info**: Phone and email
   - **Event Type**: Wedding, Conference, Party
   - **Date**: Event date
   - **Start Time**: When begins
   - **End Time**: When ends
   - **Guest Count**: Expected attendance
   - **Special Requests**: Catering, decoration, etc.
4. Calculate charges
5. Collect deposit
6. Confirm booking

### Hall Calendar

1. View monthly calendar
2. See all hall bookings
3. Color-coded by hall
4. Check availability at a glance

---

## Payments & Accounting

### Payment Methods

Supported payment types:
- Cash
- Credit/Debit Cards
- Mobile Money
- Bank Transfer
- Room Charge
- Online Payment Gateways

### Processing Payments

#### Cash Payments
1. Select **Cash** as payment method
2. Enter amount received
3. System calculates change
4. Print receipt
5. Log in cash drawer

#### Card Payments
1. Select **Card** as payment method
2. Enter card details or swipe
3. Process transaction
4. Print receipt
5. Guest signs (if required)

#### Room Charges
1. Verify guest's room number
2. Select **Room Charge**
3. Add to room bill
4. Guest settles at checkout

### Payment Gateway Configuration

#### Setting Up Payment Gateways
1. Navigate to **Admin → Settings → Payments**
2. Available gateways:
   - **Stripe**: International cards
   - **PayPal**: Online payments
   - **Paystack**: African payments
   - **Flutterwave**: Multi-currency
   - **Mobile Money**: Local services
3. Enable desired gateway
4. Enter API keys
5. Test connection
6. Save configuration

### Accounting Module

#### Dashboard
View financial overview:
- Today's revenue
- This month's revenue
- Expenses
- Profit/Loss
- Outstanding payments

#### Recording Expenses
1. Navigate to **Admin → Accounting**
2. Click **"Add Expense"**
3. Enter:
   - **Category**: Salary, Utilities, Supplies, etc.
   - **Amount**: Cost
   - **Description**: What it's for
   - **Date**: When incurred
   - **Payment Method**: How paid
   - **Receipt Number**: For tracking
4. Save expense

#### Account Categories
- **Revenue**: Income sources
- **Expenses**: Costs incurred
- **Assets**: Things owned
- **Liabilities**: Money owed

#### Financial Reports
1. **Income Statement**:
   - Revenue by source
   - Expenses by category
   - Net profit/loss

2. **Balance Sheet**:
   - Assets
   - Liabilities
   - Equity

3. **Cash Flow Statement**:
   - Cash in
   - Cash out
   - Net cash flow

4. **Budget vs Actual**:
   - Planned budget
   - Actual spending
   - Variances

### Bank Reconciliation
1. Upload bank statement
2. Match transactions
3. Mark as reconciled
4. Identify discrepancies
5. Adjust records

---

## HR Management

### Employee Management

#### Adding Employees
1. Navigate to **Admin → HR**
2. Click **"Add Employee"**
3. Enter personal information:
   - **Employee ID**: Unique identifier
   - **First Name**: Given name
   - **Last Name**: Surname
   - **Email**: Work email
   - **Phone**: Contact number
   - **Date of Birth**: Birth date
   - **National ID**: ID number
   - **Address**: Residential address
4. Employment details:
   - **Department**: Which department
   - **Position**: Job title
   - **Hire Date**: Start date
   - **Employment Type**: Full-time, Part-time, Contract
   - **Salary**: Monthly/hourly rate
   - **Bank Account**: For salary payment
5. Emergency contact:
   - **Contact Name**: Emergency person
   - **Contact Phone**: Their number
6. Save employee

#### Employee Profiles
View complete employee information:
- Personal details
- Employment history
- Salary information
- Leave balance
- Performance reviews
- Training records
- Disciplinary records

### Leave Management

#### Leave Types
- Annual Leave
- Sick Leave
- Maternity/Paternity Leave
- Unpaid Leave
- Compassionate Leave

#### Requesting Leave
1. Click **"Request Leave"**
2. Enter:
   - **Leave Type**: Which type
   - **Start Date**: When begins
   - **End Date**: When ends
   - **Reason**: Brief explanation
3. Submit request
4. Awaits approval

#### Approving Leave
1. Manager reviews request
2. Checks:
   - Leave balance
   - Department coverage
   - Company policy
3. Approves or rejects
4. Employee notified
5. If approved, leave deducted from balance

### Payroll Processing

#### Monthly Payroll
1. Click **"Process Payroll"**
2. Select pay period
3. System calculates for each employee:
   - **Base Salary**: Regular pay
   - **Overtime**: Extra hours worked
   - **Bonuses**: Performance bonuses
   - **Deductions**:
     - Tax
     - Loan repayments
     - Other deductions
   - **Net Pay**: Final amount
4. Review calculations
5. Approve payroll
6. Generate payment file
7. Process bank transfers
8. Generate payslips

### Employee Loans

#### Requesting Loan
1. Employee clicks **"Request Loan"**
2. Enter:
   - **Loan Amount**: Requested sum
   - **Purpose**: What it's for
   - **Repayment Period**: Months
   - **Monthly Deduction**: Amount per month
3. Submit request

#### Approving Loans
1. HR/Manager reviews request
2. Checks:
   - Employment duration
   - Current salary
   - Existing loans
3. Approves or rejects with reason
4. If approved:
   - Loan disbursed
   - Monthly deductions start
   - Track remaining balance

### Performance Reviews

#### Creating Reviews
1. Click **"New Review"**
2. Select employee
3. Set review period
4. Rate on criteria:
   - Work Quality
   - Punctuality
   - Teamwork
   - Communication
   - Goal Achievement
5. Write comments:
   - Strengths
   - Areas for improvement
   - Development goals
6. Submit review
7. Schedule feedback meeting

### Staff Recognition

#### Monthly Recognition
1. Nominate staff for recognition
2. Others vote
3. Winner announced
4. Award presented
5. Record in employee profile

---

## Housekeeping

### Task Management

#### Creating Tasks
1. Navigate to **Admin → Housekeeping**
2. Click **"New Task"**
3. Enter:
   - **Task Type**: 
     - Room Cleaning
     - Maintenance Request
     - Inspection
     - Laundry
   - **Room Number**: Which room
   - **Priority**: Low, Medium, High, Urgent
   - **Assigned To**: Housekeeping staff
   - **Due Date**: When needed
   - **Description**: Details
4. Save task

#### Task Status
- **Pending**: Not started
- **In Progress**: Being worked on
- **Completed**: Finished
- **Verified**: Checked and approved

### Room Cleaning Workflow

1. **Task Assignment**:
   - System assigns rooms to staff
   - Based on workload and area

2. **Start Cleaning**:
   - Staff opens task
   - Marks as "In Progress"
   - Notes start time

3. **Cleaning Checklist**:
   - Make beds
   - Clean bathroom
   - Vacuum/mop floors
   - Dust surfaces
   - Replenish amenities
   - Check all equipment
   - Empty trash

4. **Complete Task**:
   - Mark all checklist items
   - Upload photo (optional)
   - Note any issues
   - Mark as "Completed"

5. **Supervisor Verification**:
   - Supervisor inspects
   - Approves or requests corrections
   - Changes room status to "Available"

### Maintenance Requests

#### Creating Maintenance Request
1. Click **"Maintenance Request"**
2. Enter:
   - **Issue Type**: Plumbing, Electrical, etc.
   - **Room/Location**: Where problem is
   - **Priority**: How urgent
   - **Description**: What's wrong
   - **Photos**: Visual evidence
3. Submit request

#### Handling Requests
1. Maintenance staff receives alert
2. Assesses issue
3. Updates status
4. Completes repair
5. Marks as resolved
6. Room returns to service

### Laundry Management

Track linens and laundry:
1. **Soiled Items**:
   - Count items sent to laundry
   - By room and type
   
2. **Clean Items**:
   - Count items returned
   - Verify quality
   
3. **Inventory**:
   - Track linen quantities
   - Alert when low
   - Order replacements

---

## Supplier Management

### Managing Suppliers

#### Adding Suppliers
1. Navigate to **Admin → Suppliers**
2. Click **"Add Supplier"**
3. Enter:
   - **Company Name**: Supplier name
   - **Contact Person**: Main contact
   - **Email**: Contact email
   - **Phone**: Phone number
   - **Address**: Location
   - **Category**: What they supply
   - **Payment Terms**: Net 30, Cash, etc.
   - **Tax ID**: Tax identification
4. Save supplier

### Purchase Orders

#### Creating Purchase Order
1. Click **"New Order"**
2. Select supplier
3. Add items:
   - **Item Name**: What you're ordering
   - **Quantity**: Amount needed
   - **Unit Price**: Price per unit
   - **Total**: Auto-calculated
4. Add multiple items
5. Review order total
6. Add notes
7. Submit order

#### Order Status
- **Pending**: Awaiting confirmation
- **Confirmed**: Supplier confirmed
- **In Transit**: Being delivered
- **Delivered**: Received
- **Cancelled**: Order cancelled

#### Receiving Orders
1. Order arrives
2. Open order in system
3. Verify items:
   - Check quantities
   - Inspect quality
   - Note any issues
4. Mark items as received
5. Update inventory
6. Process supplier payment

### Supplier Payments

1. View outstanding invoices
2. Select invoice to pay
3. Enter:
   - **Payment Date**: When paid
   - **Payment Method**: How paid
   - **Reference Number**: Transaction ID
   - **Amount**: Payment amount
4. Save payment
5. Update supplier balance

### Supplier Performance

System tracks:
- Total orders placed
- Total amount spent
- On-time delivery rate
- Quality rating
- Response time

---

## Reports & Analytics

### Available Reports

#### Occupancy Reports
- Daily occupancy percentage
- By room type
- Trends over time
- Comparison to previous periods

#### Revenue Reports
1. **By Department**:
   - Rooms
   - Restaurant
   - Bar
   - Gym
   - Other services

2. **By Payment Method**:
   - Cash
   - Card
   - Room Charge
   - Mobile Money

3. **By Time Period**:
   - Daily
   - Weekly
   - Monthly
   - Yearly

#### Guest Reports
- New guests vs returning
- Guest demographics
- Booking sources
- Average spend per guest
- Loyalty tier distribution

#### Inventory Reports
- Current stock levels
- Low stock items
- Inventory value
- Usage by department
- Waste and loss

#### HR Reports
- Employee roster
- Attendance records
- Leave balances
- Payroll summary
- Training records

### Generating Reports

1. Navigate to **Admin → Reports**
2. Select report type
3. Set parameters:
   - Date range
   - Department
   - Category
   - Other filters
4. Click **"Generate Report"**
5. View on screen
6. Export options:
   - PDF
   - Excel
   - CSV
7. Schedule for automatic generation

### Analytics Dashboard

View key metrics:
- Revenue trends
- Occupancy rates
- Guest satisfaction
- Expense tracking
- Staff performance
- Inventory turnover

---

## Settings & Configuration

### Hotel Information

1. Navigate to **Admin → Settings**
2. **Basic Information**:
   - **Hotel Name**: Your hotel name
   - **Address**: Physical location
   - **Phone**: Contact number
   - **WhatsApp**: WhatsApp number
   - **Email**: Contact email
   - **Website**: Hotel website
   - **Description**: About your hotel

### Display Settings

#### Logo and Branding
1. **Upload Logo**: Your hotel logo
2. **Upload Favicon**: Browser icon
3. **Site Title**: Browser tab title
4. **Hotel Icon**: Display icon

#### Color Scheme
1. **Primary Color**: Main brand color
2. **Accent Color**: Secondary color
3. **Background Color**: Page background
4. **Text Color**: Default text color
5. **Card Color**: Card backgrounds
6. **Border Color**: Border colors

Preview changes in real-time

### Tax Configuration

1. Set tax rate (e.g., 7.5%)
2. Applied automatically to:
   - Room bookings
   - Restaurant orders
   - Services

### Currency Settings

1. Select currency (USD, EUR, GBP, etc.)
2. Set symbol position
3. Decimal places
4. Thousand separator

### Notification Settings

Enable/disable notifications for:
- **Email Notifications**: System emails
- **SMS Notifications**: Text messages
- **Desktop Notifications**: Browser alerts
- **Sound Notifications**: Audio alerts

### Payment Gateway Settings

Configure each gateway:
1. Enable/disable
2. Enter credentials:
   - API keys
   - Secret keys
   - Merchant IDs
3. Test connection
4. Set as default (optional)

### Loyalty Program Settings

Set tier thresholds:
- **Bronze**: $0 minimum
- **Silver**: $2,000 minimum
- **Gold**: $5,000 minimum
- **Platinum**: $10,000 minimum

### User Management

#### Adding Users
1. Click **"Users"** tab
2. Click **"Add User"**
3. Enter:
   - Email
   - Name
   - Role
4. User receives invitation email
5. Sets own password

#### Managing Roles
1. View all users
2. Click user to edit
3. Change role
4. Adjust permissions
5. Save changes

#### User Permissions by Role

**Admin**:
- Full system access
- All modules
- Settings configuration
- User management

**Manager**:
- Operations management
- Staff oversight
- Reports access
- Limited settings

**Staff**:
- Daily operations
- Limited reporting
- No settings access

**Department-Specific**:
- Access only to relevant modules
- Cannot modify settings
- Limited reporting

---

## Mobile App Usage

### Installing the App

#### iOS (iPhone/iPad)
1. Open App Store
2. Search "ALOKOLODO HOTELS"
3. Tap "Get"
4. Install app
5. Open app

#### Android
1. Open Google Play Store
2. Search "ALOKOLODO HOTELS"
3. Tap "Install"
4. Open app

### Mobile Staff Login

1. Open app
2. Enter credentials:
   - Email
   - Password
3. Tap "Login"

### Mobile Features

#### For Front Desk Staff
- Quick check-in/check-out
- View room availability
- Create bookings
- Process payments
- Guest lookup

#### For Housekeeping
- View assigned tasks
- Update task status
- Report issues
- Upload photos
- Check room status

#### For Restaurant Staff
- Take orders
- View table status
- Process payments
- Kitchen orders
- Split bills

#### For Management
- View dashboard
- Check reports
- Approve requests
- Monitor operations

### Mobile Dashboard

View key information:
- Today's occupancy
- Active bookings
- Pending tasks
- Revenue summary
- Quick actions

### Offline Mode

Some features work offline:
- View assigned tasks
- Update task status
- Take notes
- Data syncs when online

---

## Troubleshooting

### Common Issues and Solutions

#### Cannot Login
**Problem**: Login fails
**Solutions**:
1. Verify email and password
2. Check CAPS LOCK is off
3. Try "Forgot Password"
4. Clear browser cache
5. Contact admin to verify account status

#### Booking Not Saving
**Problem**: Booking won't save
**Solutions**:
1. Check all required fields are filled
2. Verify room is available for dates
3. Check internet connection
4. Try refreshing page
5. Log out and back in

#### Payment Processing Error
**Problem**: Payment won't process
**Solutions**:
1. Verify payment gateway is configured
2. Check internet connection
3. Verify card/payment details
4. Try different payment method
5. Contact payment provider

#### Inventory Not Updating
**Problem**: Stock levels not changing
**Solutions**:
1. Verify you have permissions
2. Check restock/issue was saved
3. Refresh page
4. Check for error messages
5. Contact admin

#### Reports Not Generating
**Problem**: Report shows no data
**Solutions**:
1. Verify date range is correct
2. Check filters aren't too restrictive
3. Ensure data exists for period
4. Try broader date range
5. Clear filters and retry

#### Mobile App Not Syncing
**Problem**: Changes not appearing
**Solutions**:
1. Check internet connection
2. Pull down to refresh
3. Log out and back in
4. Close and reopen app
5. Reinstall app

### Getting Help

#### In-App Support
1. Click **Help** icon (?)
2. View knowledge base
3. Submit support ticket
4. Live chat (if available)

#### Contact Support
- **Email**: support@alokolodo.com
- **Phone**: [Support Number]
- **Hours**: 24/7 for critical issues

#### Training Resources
- Video tutorials
- User guides
- Quick reference cards
- Training sessions

### Best Practices

#### Data Security
- Use strong passwords
- Log out when done
- Don't share credentials
- Report suspicious activity

#### System Performance
- Keep browser updated
- Clear cache regularly
- Close unused tabs
- Use stable internet

#### Data Accuracy
- Double-check entries
- Review before saving
- Regular reconciliation
- Audit logs periodically

---

## Appendix

### Keyboard Shortcuts

- **Ctrl + N**: New booking
- **Ctrl + F**: Search/Find
- **Ctrl + S**: Save
- **Ctrl + P**: Print
- **Esc**: Close modal/dialog

### Glossary

- **ADR**: Average Daily Rate
- **RevPAR**: Revenue Per Available Room
- **POS**: Point of Sale
- **RLS**: Row Level Security
- **Check-in**: Guest arrival process
- **Check-out**: Guest departure process
- **Occupancy**: Percentage of filled rooms
- **No-show**: Guest who doesn't arrive
- **Walk-in**: Guest without reservation

### System Limits

- Maximum file upload size: 10MB
- Maximum bulk import: 1000 records
- Session timeout: 30 minutes
- Password expiry: 90 days

---

## Conclusion

This guide covers all major features of the ALOKOLODO HOTELS Management System. For additional assistance, contact your system administrator or support team.

**System Version**: 1.0  
**Last Updated**: January 2025  
**Document Version**: 1.0
