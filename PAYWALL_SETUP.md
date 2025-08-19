# 🔒 Pebble CRM Paywall System Setup

## 🎯 **What We've Implemented**

Your CRM now has a **complete paywall system** that prevents users from accessing CRM features without an active subscription. Here's how it works:

## 🛡️ **How the Paywall Works**

### **1. SubscriptionGuard Component**
- **Wraps all protected routes** (Dashboard, Contacts, Pipeline, Tasks, Settings)
- **Checks subscription status** when users try to access CRM features
- **Redirects to `/upgrade`** if no active subscription found
- **Allows access** only with `active` or `trialing` subscription status

### **2. Upgrade Page (`/upgrade`)**
- **Shows when users don't have subscription**
- **Displays current user info** (if logged in)
- **Presents pricing** with "Start Free Trial" button
- **Links directly to Stripe checkout**

### **3. Subscription Status Display**
- **Header shows subscription status** (Free Trial/Active)
- **Dashboard banner** displays trial end date or plan details
- **Visual indicators** throughout the interface

## 🔄 **User Flow**

### **New User Journey:**
1. **Landing Page** → User sees pricing and "Start Free Trial"
2. **Stripe Checkout** → User completes payment/trial signup
3. **CRM Access** → User can now access all features

### **Existing User Journey:**
1. **Login** → User authenticates with Firebase
2. **Subscription Check** → System verifies subscription status
3. **Access Control** → 
   - ✅ **Active Subscription** → Full CRM access
   - ❌ **No Subscription** → Redirected to `/upgrade`
   - ⏰ **Trial Expired** → Redirected to `/upgrade`

## 🚀 **How to Test the Paywall**

### **Test Scenario 1: No Subscription**
1. Create a new Firebase user account
2. Try to access `/dashboard` directly
3. **Expected Result**: Redirected to `/upgrade` page

### **Test Scenario 2: With Subscription**
1. Complete Stripe checkout (free trial)
2. Access any CRM page
3. **Expected Result**: Full access to CRM features

### **Test Scenario 3: Trial Expired**
1. Wait for trial to expire (or manually update in Stripe)
2. Try to access CRM
3. **Expected Result**: Redirected to `/upgrade` page

## ⚙️ **Configuration Options**

### **Subscription Statuses Allowed:**
```typescript
// These statuses grant CRM access:
['active', 'trialing']

// These statuses block access:
['canceled', 'incomplete', 'incomplete_expired', 'past_due', 'unpaid']
```

### **Customize Redirect Behavior:**
```typescript
// In SubscriptionGuard.tsx, line 32:
if (!sub || !['active', 'trialing'].includes(sub.status)) {
    navigate('/upgrade', { replace: true }); // Change this URL if needed
    return;
}
```

### **Modify Allowed Plans:**
```typescript
// Add additional plan checks if needed:
if (!sub || !['active', 'trialing'].includes(sub.status) || sub.planName !== 'Professional Plan') {
    navigate('/upgrade', { replace: true });
    return;
}
```

## 🔧 **Files Modified**

### **New Files Created:**
- `src/components/SubscriptionGuard.tsx` - Main paywall logic
- `src/pages/Upgrade.tsx` - Upgrade/payment page
- `PAYWALL_SETUP.md` - This documentation

### **Files Modified:**
- `src/App.tsx` - Added upgrade route and wrapped protected routes
- `src/components/Header.tsx` - Added subscription status display
- `src/pages/Dashboard.tsx` - Added subscription banner

## 🎨 **Customization Options**

### **Change Upgrade Page Design:**
- Modify `src/pages/Upgrade.tsx` for different styling
- Add more pricing tiers if needed
- Customize messaging and branding

### **Modify Subscription Requirements:**
- Edit `SubscriptionGuard.tsx` for different access rules
- Add plan-specific restrictions
- Implement usage-based limits

### **Add Subscription Management:**
- Create subscription settings page
- Add plan upgrade/downgrade options
- Implement billing history

## 🚨 **Important Notes**

### **Firebase Authentication Still Required:**
- Users must still sign up/login with Firebase
- Paywall only controls CRM feature access
- Landing page remains publicly accessible

### **Stripe Integration Required:**
- Backend server must be running
- Webhooks must be configured
- Environment variables must be set

### **Testing Considerations:**
- Test with both new and existing users
- Verify redirects work correctly
- Check subscription status updates

## ✅ **Next Steps**

1. **Test the paywall** with a new user account
2. **Verify Stripe integration** is working
3. **Customize messaging** if needed
4. **Deploy changes** to production

## 🆘 **Troubleshooting**

### **Users Still Accessing CRM:**
- Check if `SubscriptionGuard` is properly wrapping routes
- Verify subscription status in Firebase
- Check browser console for errors

### **Infinite Redirects:**
- Ensure upgrade page doesn't require subscription
- Check subscription check logic
- Verify route configuration

### **Subscription Status Not Updating:**
- Check Stripe webhook configuration
- Verify backend server is running
- Check Firebase rules and permissions

---

**Your CRM now has enterprise-grade access control! 🎉**

Users must complete payment before accessing any CRM features, ensuring you only provide value to paying customers. 