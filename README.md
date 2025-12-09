# Printing Production Management System

## System Overview
A comprehensive web-based management system for printing production companies, featuring DTF printing calculations, client management, order processing, document generation, and multi-user collaboration.

## Key Features

### Authentication & Security
- Multi-factor authentication with 5-attempt lockout
- Password reset via email
- Admin panel access control
- Session management and security logs
- Role-based access control (RBAC)

### Main Dashboard
- Clean white interface with burger menu
- Real-time notifications and chat
- Personal employee dashboard
- Browser push notifications
- Quick action buttons

### DTF Calculator (Core Feature)
- Dynamic pricing based on print meters
- Format calculations (A1-A7 support)
- Complexity handling (easy/difficult)
- Single/double-sided printing
- Automatic margin calculation with celebration animation
- Contractor request system

### Modular Multi-Calculator System
- Extensible technology tabs (UV, Sublimation, Screen Printing, etc.)
- Custom field creation
- Formula management
- Price table integration
- Technology-specific document templates

### Document Management
- Automatic document generation (quotes, invoices, contracts)
- GOST standard compliance
- Multiple export formats (PDF, Word, Excel)
- Template management
- Document preview system

### Communication System
- 24/7 online chat with file sharing (75MB per file, 20 files max)
- Message persistence
- Employee identification (name, position, timestamp)
- System integration for order/client notifications
- Telegram bot integration

### Client Management
- Status tracking (new, in progress, closed, rejected, waiting)
- Employee assignment system
- Client history tracking
- Protection against duplicate processing

### Order Management
- Status workflow (processing, in work, ready, canceled, waiting)
- History tracking
- File attachments
- Automatic notifications
- Calculator integration

### Production Management
- Multi-production facility support
- Task management
- Notification system
- Contact management
- File attachments

### Employee Portal
- Profile management (photo, contacts, interface preferences)
- Theme selection (dark, light, corporate)
- Performance statistics
- Activity tracking

### Admin Panel
- Comprehensive analytics dashboard
- Employee management (roles, permissions, activity logs)
- Calculator management
- Document template management
- Product and material management
- System notifications

### System Architecture
- Centralized logging system
- Role-based access control
- Multi-format notification system
- Customizable interface templates
- Data deletion capabilities (employees, clients, orders)

## Technology Stack
- Frontend: HTML5, CSS3, JavaScript (ES6+)
- Styling: Tailwind CSS with white theme
- Database: JSON-based local storage with export/import
- Notifications: Browser API + WebSocket simulation
- File Handling: Base64 encoding with size limits
- Authentication: Session-based with security measures

## File Structure
```
/
├── index.html              # Main dashboard
├── login.html              # Authentication page
├── register.html           # Registration page
├── calculator.html         # DTF Calculator
├── clients.html           # Client management
├── orders.html            # Order management
├── chat.html              # Communication system
├── admin.html             # Admin panel
├── profile.html           # Employee profile
├── documents.html         # Document management
├── main.js                # Core JavaScript functionality
├── resources/             # Assets folder
│   ├── icons/            # System icons
│   ├── templates/        # Document templates
│   └── data/            # Sample data files
└── README.md            # This file
```

## Getting Started
1. Open `login.html` in a web browser
2. Register a new account or use demo credentials
3. Navigate through the system using the burger menu
4. Explore different modules and features

## Security Notes
- All authentication attempts are logged
- Passwords are stored with encryption
- Session timeout after inactivity
- Admin approval required for new accounts
- System logs all critical operations