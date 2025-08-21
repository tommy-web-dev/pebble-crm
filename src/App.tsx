import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { AppProvider } from './contexts/AppContext';
import { SettingsProvider } from './contexts/SettingsContext';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Landing from './pages/Landing';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import Upgrade from './pages/Upgrade';
import PaymentSuccess from './pages/PaymentSuccess';
import Dashboard from './pages/Dashboard';
import Contacts from './pages/Contacts';
import Pipeline from './pages/Pipeline';
import Candidates from './pages/Candidates';
import Tasks from './pages/Tasks';
import Settings from './pages/Settings';
import Layout from './components/Layout';
import PrivateRoute from './components/PrivateRoute';
import SubscriptionGuard from './components/SubscriptionGuard';

function App() {
    return (
        <Router>
            <AuthProvider>
                <AppProvider>
                    <SettingsProvider>
                        <Routes>
                            {/* Public routes */}
                            <Route path="/" element={<Landing />} />
                            <Route path="/signup" element={<Signup />} />
                            <Route path="/privacy" element={<Privacy />} />
                            <Route path="/terms" element={<Terms />} />
                            <Route path="/upgrade" element={<Upgrade />} />
                            <Route path="/payment-success" element={<PaymentSuccess />} />
                            <Route path="/login" element={<Login />} />

                            {/* Protected routes with Layout */}
                            <Route path="/dashboard" element={<PrivateRoute><SubscriptionGuard><Layout /></SubscriptionGuard></PrivateRoute>}>
                                <Route index element={<Dashboard />} />
                            </Route>
                            <Route path="/contacts" element={<PrivateRoute><SubscriptionGuard><Layout /></SubscriptionGuard></PrivateRoute>}>
                                <Route index element={<Contacts />} />
                            </Route>
                            <Route path="/jobs" element={<PrivateRoute><SubscriptionGuard><Layout /></SubscriptionGuard></PrivateRoute>}>
                                <Route index element={<Pipeline />} />
                            </Route>
                            <Route path="/candidates" element={<PrivateRoute><SubscriptionGuard><Layout /></SubscriptionGuard></PrivateRoute>}>
                                <Route index element={<Candidates />} />
                            </Route>
                            <Route path="/tasks" element={<PrivateRoute><SubscriptionGuard><Layout /></SubscriptionGuard></PrivateRoute>}>
                                <Route index element={<Tasks />} />
                            </Route>
                            <Route path="/settings" element={<PrivateRoute><SubscriptionGuard><Layout /></SubscriptionGuard></PrivateRoute>}>
                                <Route index element={<Settings />} />
                            </Route>
                        </Routes>
                    </SettingsProvider>
                </AppProvider>
            </AuthProvider>
        </Router>
    );
}

export default App; 