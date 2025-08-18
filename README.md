# Pebble - Modern CRM for Professionals

A lightweight, modern web-based CRM designed specifically for solo professionals and freelancers. Pebble focuses on simplicity, usability, and responsive design to help you manage your business relationships effectively.

## ✨ Features

- **Contacts Management**: Add, edit, and organize contacts with tags and notes
- **Pipeline Tracking**: Kanban board for managing deals and opportunities
- **Task Management**: Organize tasks with reminders and priority levels
- **Dashboard**: Key metrics and upcoming activities at a glance
- **Modern UI**: Clean, responsive design that works on all devices
- **Real-time Updates**: Firebase-powered real-time data synchronization

## 🛠️ Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Firebase project

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd pebble-io
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Firebase**
   - Create a new Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Enable Authentication (Email/Password)
   - Enable Firestore Database
   - Get your Firebase configuration

4. **Configure environment variables**
   ```bash
   cp env.example .env.local
   ```
   
   Edit `.env.local` with your Firebase configuration:
   ```env
   REACT_APP_FIREBASE_API_KEY=your_api_key_here
   REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   REACT_APP_FIREBASE_PROJECT_ID=your_project_id
   REACT_APP_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   REACT_APP_FIREBASE_APP_ID=your_app_id
   ```

5. **Start the development server**
   ```bash
   npm start
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Header.tsx      # Top navigation header
│   ├── Layout.tsx      # Main layout wrapper
│   ├── PrivateRoute.tsx # Authentication guard
│   └── Sidebar.tsx     # Navigation sidebar
├── contexts/           # React Context providers
│   ├── AuthContext.tsx # Authentication state
│   └── AppContext.tsx  # Application state (Zustand)
├── pages/              # Page components
│   ├── Dashboard.tsx   # Main dashboard
│   ├── Contacts.tsx    # Contacts management
│   ├── Pipeline.tsx    # Sales pipeline
│   ├── Tasks.tsx       # Task management
│   └── Login.tsx       # Authentication
├── types/              # TypeScript type definitions
│   └── index.ts        # Main type interfaces
├── config/             # Configuration files
│   └── firebase.ts     # Firebase initialization
├── App.tsx             # Main app component
└── index.tsx           # Entry point
```

## 🔧 Available Scripts

- `npm start` - Start development server
- `npm build` - Build for production
- `npm test` - Run tests
- `npm eject` - Eject from Create React App

## 🎨 Design System

### Colors
- **Primary**: Blue (#0ea5e9) - Main brand color
- **Gray Scale**: Full range from 50-900 for UI elements
- **Semantic Colors**: Red, yellow, green for status indicators

### Components
- **Buttons**: Primary and secondary variants with hover states
- **Cards**: Clean white cards with subtle shadows
- **Inputs**: Consistent form inputs with focus states
- **Typography**: Inter font family for clean readability

## 📱 Responsive Design

- **Mobile-first** approach
- **Breakpoints**: TailwindCSS responsive utilities
- **Sidebar**: Collapsible on mobile, fixed on desktop
- **Tables**: Horizontal scroll on small screens

## 🔐 Authentication

- **Email/Password** authentication via Firebase
- **Protected Routes** for authenticated users
- **User Context** for managing authentication state
- **Automatic Redirects** based on auth status

## 🗄️ Data Models

### Contact
- Basic info (name, email, phone)
- Company and position
- Tags for categorization
- Notes and timestamps

### Deal
- Sales opportunity tracking
- Pipeline stages (lead → closed)
- Value and probability
- Expected close dates

### Task
- To-do items with priorities
- Due dates and completion status
- Related entities (contacts, deals)
- Priority levels (low, medium, high)

## 🚧 Future Enhancements

- Email integration
- Calendar sync
- Advanced reporting
- Mobile app
- Team collaboration
- API integrations

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions, please open an issue in the repository.

---

Built with ❤️ for solo professionals and freelancers who need a simple, powerful CRM. 