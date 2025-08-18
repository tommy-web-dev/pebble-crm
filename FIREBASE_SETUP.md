# Firebase Setup Guide for Pebble.io

This guide will help you set up Firebase for your Pebble.io CRM application.

## 🚀 Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or "Add project"
3. Enter project name: `pebble-io` (or your preferred name)
4. Choose whether to enable Google Analytics (optional)
5. Click "Create project"

## 🔐 Step 2: Enable Authentication

1. In your Firebase project, go to **Authentication** in the left sidebar
2. Click **Get started**
3. Go to **Sign-in method** tab
4. Enable **Email/Password** provider:
   - Click on "Email/Password"
   - Toggle "Enable" to ON
   - Toggle "Email link (passwordless sign-in)" to OFF
   - Click **Save**

## 🗄️ Step 3: Set up Firestore Database

1. Go to **Firestore Database** in the left sidebar
2. Click **Create database**
3. Choose **Start in test mode** (we'll secure it later)
4. Select a location close to your users
5. Click **Done**

## 🔒 Step 4: Configure Security Rules

1. In Firestore Database, go to **Rules** tab
2. Replace the default rules with the contents of `firestore.rules`
3. Click **Publish**

## ⚙️ Step 5: Get Configuration

1. Click the gear icon ⚙️ next to "Project Overview"
2. Select **Project settings**
3. Scroll down to **Your apps** section
4. Click the web icon (</>)
5. Register app with nickname: `pebble-io-web`
6. Copy the configuration object

## 🔧 Step 6: Environment Variables

1. Create `.env.local` file in your project root
2. Add your Firebase configuration:

```env
REACT_APP_FIREBASE_API_KEY=your_api_key_here
REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
```

## 📧 Step 7: Email Templates (Optional)

1. In Authentication, go to **Templates** tab
2. Customize **Verification email** template:
   - Subject: "Verify your Pebble.io account"
   - Message: "Click the link below to verify your account:"
3. Customize **Password reset** template:
   - Subject: "Reset your Pebble.io password"
   - Message: "Click the link below to reset your password:"

## 🚀 Step 8: Test Your Setup

1. Start your development server: `npm start`
2. Try to create a new account
3. Check your email for verification
4. Try logging in
5. Test password reset functionality

## 🔒 Security Best Practices

### Firestore Rules
- Users can only access their own data
- All operations require authentication
- Data is isolated by `userId` field

### Authentication
- Email verification is required
- Password minimum length: 6 characters
- Rate limiting on auth attempts

### Environment Variables
- Never commit `.env.local` to version control
- Use different Firebase projects for dev/staging/prod
- Regularly rotate API keys

## 🐛 Troubleshooting

### Common Issues

**"Firebase: Error (auth/user-not-found)"**
- User doesn't exist in Firebase
- Check if user was created successfully

**"Firebase: Error (auth/wrong-password)"**
- Incorrect password
- User might need to reset password

**"Firebase: Error (auth/invalid-email)"**
- Email format is invalid
- Check email validation

**"Firebase: Error (auth/weak-password)"**
- Password is too short
- Minimum 6 characters required

**"Firebase: Error (auth/email-already-in-use)"**
- Email already registered
- User should sign in instead

### Debug Mode

Enable Firebase debug mode in browser console:
```javascript
localStorage.setItem('debug', 'firebase:*');
```

## 📱 Production Deployment

1. **Environment Variables**: Set production Firebase config
2. **Security Rules**: Review and test Firestore rules
3. **Authentication**: Configure authorized domains
4. **Monitoring**: Enable Firebase Analytics and Crashlytics
5. **Backup**: Set up Firestore backup strategy

## 🔗 Additional Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firebase Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Firebase Authentication](https://firebase.google.com/docs/auth)
- [Firestore Data Modeling](https://firebase.google.com/docs/firestore/data-modeling)

---

Your Firebase setup is now complete! 🎉
The authentication system will handle user registration, login, password reset, and email verification automatically. 