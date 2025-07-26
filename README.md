# Nenapidu - Profile & Reminder Management System

Nenapidu is a modern web application built with Next.js that allows users to create and manage profiles along with associated reminders. The application features a clean, responsive interface with dark/light theme support and comprehensive reminder management capabilities.

## 🚀 Features

### Profile Management
- **Create Profiles**: Add new profiles with name, description, and profile images
- **Profile Images**: Upload and manage profile images stored in AWS S3
- **View All Profiles**: Browse all created profiles in a organized layout
- **Edit Profiles**: Update profile information and images
- **Delete Profiles**: Remove profiles with automatic cleanup of associated data and S3 images

### Reminder Management
- **Create Reminders**: Add reminders associated with specific profiles
- **Flexible Frequency**: Set reminders as one-time, monthly, or yearly
- **Rich Details**: Include titles, descriptions, and due dates
- **Reminder Tracking**: Mark reminders as completed or pending
- **Expiration Settings**: Configure reminders to expire automatically
- **Bulk Operations**: Manage multiple reminders efficiently

### User Experience
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Dark/Light Theme**: Toggle between light and dark modes with persistent settings
- **Interactive UI**: Modern interface with smooth animations and transitions
- **Accordion Views**: Expandable reminder details for better organization
- **Theme-Aware Alerts**: Custom SweetAlert2 integration with theme support

### Technical Features
- **Authentication**: Secure user authentication with Clerk
- **Database**: PostgreSQL with Drizzle ORM for efficient data management
- **File Storage**: AWS S3 integration for profile image storage
- **Type Safety**: Full TypeScript implementation
- **Modern UI**: Tailwind CSS for responsive and consistent styling

## 🛠️ Technology Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Clerk
- **Styling**: Tailwind CSS
- **File Storage**: AWS S3
- **State Management**: Zustand
- **Icons**: Lucide React
- **Alerts**: SweetAlert2
- **Image Handling**: Next.js Image Optimization

## 📁 Project Structure

```
nenapidu/
├── app/
│   ├── (pages)/
│   │   ├── dashboard/           # Main dashboard
│   │   ├── profile/
│   │   │   ├── add/            # Create new profile
│   │   │   └── [profileId]/    # View/edit specific profile
│   │   ├── profiles/           # View all profiles
│   │   └── reminder/
│   │       ├── add/            # Create new reminder
│   │       └── [reminderId]/   # Edit specific reminder
│   ├── api/
│   │   ├── profiles/           # Profile CRUD operations
│   │   └── reminders/          # Reminder CRUD operations
│   ├── components/
│   │   ├── Sidebar.tsx         # Navigation sidebar
│   │   ├── Header.tsx          # Application header
│   │   ├── ReminderAccordion.tsx # Reminder display component
│   │   └── ThemeToggle.tsx     # Theme switcher
│   ├── utils/
│   │   ├── profileHelpers.ts   # Profile database operations
│   │   ├── reminderHelpers.ts  # Reminder database operations
│   │   ├── s3.ts              # AWS S3 utilities
│   │   ├── swal.ts            # Custom SweetAlert2 wrapper
│   │   └── store.ts           # Zustand state management
│   └── types/
│       └── reminder.ts         # Type definitions
├── db/
│   └── schema/                 # Database schema definitions
└── public/                     # Static assets
```

## 🚦 Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL database
- AWS S3 bucket
- Clerk account for authentication

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd nenapidu
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Environment Setup**
   Create a `.env.local` file in the root directory:
   ```env
   # Database
   DATABASE_URL="postgresql://username:password@localhost:5432/nenapidu"
   
   # Clerk Authentication
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
   CLERK_SECRET_KEY="sk_test_..."
   NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
   NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"
   NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL="/dashboard"
   NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL="/dashboard"
   
   # AWS S3
   AWS_REGION="us-east-1"
   AWS_ACCESS_KEY_ID="your-access-key"
   AWS_SECRET_ACCESS_KEY="your-secret-key"
   S3_BUCKET_NAME="your-bucket-name"
   ```

4. **Database Setup**
   ```bash
   # Run database migrations
   npm run db:push
   # or
   npx drizzle-kit push:pg
   ```

5. **Start the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

6. **Open the application**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📱 Usage

### Creating Your First Profile
1. Sign in to the application
2. Click "Add Profile" in the sidebar
3. Fill in the profile name and description
4. Optionally upload a profile image
5. Save the profile

### Managing Reminders
1. Navigate to a profile or click "Add Reminder"
2. Fill in the reminder details:
   - Title and description
   - Due date
   - Frequency (one-time, monthly, yearly)
   - Expiration settings
3. Associate with a profile
4. Save the reminder

### Theme Customization
- Use the theme toggle in the header to switch between light and dark modes
- Theme preference is automatically saved and persists across sessions

## 🔧 API Endpoints

### Profiles
- `POST /api/profiles` - Create a new profile
- `PUT /api/profiles` - Update an existing profile
- `DELETE /api/profiles` - Delete a profile and associated data
- `GET /api/profiles/[userId]` - Get all profiles for a user
- `GET /api/profiles/profile/[profileId]` - Get a specific profile

### Reminders
- `POST /api/reminders` - Create a new reminder
- `PUT /api/reminders` - Update an existing reminder
- `DELETE /api/reminders` - Delete a reminder
- `GET /api/reminders/profile/[profileId]` - Get all reminders for a profile

## 🎨 Customization

### Themes
The application supports custom themes through Tailwind CSS. Theme switching is handled by the Zustand store and persists across sessions.

### Components
All components are modular and can be easily customized:
- Update styling in component files
- Modify behavior through props and state management
- Extend functionality with additional features

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Other Platforms
The application can be deployed on any platform that supports Next.js:
- Netlify
- Railway
- Digital Ocean
- AWS Amplify

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🐛 Issues & Support

If you encounter any issues or need support:
1. Check the existing issues on GitHub
2. Create a new issue with detailed description
3. Include steps to reproduce the problem

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Clerk for authentication services
- Tailwind CSS for the utility-first CSS framework
- All open-source contributors who made this project possible
