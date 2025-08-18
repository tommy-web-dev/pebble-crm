import { Link } from 'react-router-dom';

const Terms: React.FC = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
            {/* Navigation Header */}
            <nav className="bg-white/95 backdrop-blur-md border-b border-slate-200/50 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <Link to="/" className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-slate-600 to-blue-500 rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold text-lg">P</span>
                            </div>
                            <span className="text-2xl font-bold text-slate-900">Pebble</span>
                        </Link>
                        <Link
                            to="/login"
                            className="px-6 py-2 bg-gradient-to-r from-slate-600 to-blue-600 text-white text-sm font-semibold rounded-lg hover:from-slate-700 hover:to-blue-700 focus:ring-4 focus:ring-blue-500/20 focus:ring-offset-2 transition-all duration-200"
                        >
                            Sign In
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-8 md:p-12">
                    <div className="text-center mb-12">
                        <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
                            Terms & Conditions
                        </h1>
                    </div>

                    <div className="prose prose-slate max-w-none">
                        <div className="space-y-8">
                            {/* Introduction */}
                            <section>
                                <h2 className="text-2xl font-bold text-slate-900 mb-4">Introduction</h2>
                                <p className="text-slate-700 leading-relaxed">
                                    These Terms and Conditions ("Terms") govern your use of Pebble CRM ("Service") operated by Pebble ("we," "our," or "us"). By accessing or using our Service, you agree to be bound by these Terms.
                                </p>
                                <p className="text-slate-700 leading-relaxed mt-4">
                                    If you disagree with any part of these terms, then you may not access the Service. These Terms apply to all visitors, users, and others who access or use the Service.
                                </p>
                            </section>

                            {/* Service Description */}
                            <section>
                                <h2 className="text-2xl font-bold text-slate-900 mb-4">Service Description</h2>
                                <p className="text-slate-700 leading-relaxed mb-4">
                                    Pebble CRM is a Customer Relationship Management service designed for solo professionals and freelancers. Our Service includes:
                                </p>
                                <ul className="list-disc list-inside text-slate-700 space-y-2 ml-4">
                                    <li>Contact management and organization</li>
                                    <li>Pipeline and opportunity tracking</li>
                                    <li>Task and follow-up management</li>
                                    <li>Dashboard analytics and reporting</li>
                                    <li>Mobile-responsive web application</li>
                                </ul>
                            </section>

                            {/* Subscription and Payment */}
                            <section>
                                <h2 className="text-2xl font-bold text-slate-900 mb-4">Subscription and Payment Terms</h2>
                                
                                <h3 className="text-xl font-semibold text-slate-800 mb-3">Free Trial</h3>
                                <p className="text-slate-700 leading-relaxed mb-4">
                                    We offer a 7-day free trial for new users. During the trial period, you have full access to all features of the Professional Plan.
                                </p>

                                <h3 className="text-xl font-semibold text-slate-800 mb-3">Subscription Plans</h3>
                                <p className="text-slate-700 leading-relaxed mb-4">
                                    After the trial period, you will be automatically charged for the Professional Plan at £19/month unless you cancel before the trial ends.
                                </p>

                                <h3 className="text-xl font-semibold text-slate-800 mb-3">Payment Processing</h3>
                                <p className="text-slate-700 leading-relaxed mb-4">
                                    All payments are processed securely through Stripe. By subscribing, you authorize us to charge your payment method for the applicable fees.
                                </p>

                                <h3 className="text-xl font-semibold text-slate-800 mb-3">Billing and Renewal</h3>
                                <p className="text-slate-700 leading-relaxed mb-4">
                                    Subscriptions automatically renew monthly unless cancelled. You will be charged the subscription fee on the same day of each month.
                                </p>
                            </section>

                            {/* User Responsibilities */}
                            <section>
                                <h2 className="text-2xl font-bold text-slate-900 mb-4">User Responsibilities</h2>
                                <p className="text-slate-700 leading-relaxed mb-4">
                                    As a user of our Service, you agree to:
                                </p>
                                <ul className="list-disc list-inside text-slate-700 space-y-2 ml-4">
                                    <li>Provide accurate and complete information when creating your account</li>
                                    <li>Maintain the security of your account credentials</li>
                                    <li>Use the Service only for lawful purposes</li>
                                    <li>Not attempt to gain unauthorized access to our systems</li>
                                    <li>Not interfere with or disrupt the Service</li>
                                    <li>Comply with all applicable laws and regulations</li>
                                </ul>
                            </section>

                            {/* Acceptable Use */}
                            <section>
                                <h2 className="text-2xl font-bold text-slate-900 mb-4">Acceptable Use Policy</h2>
                                <p className="text-slate-700 leading-relaxed mb-4">
                                    You may not use our Service to:
                                </p>
                                <ul className="list-disc list-inside text-slate-700 space-y-2 ml-4">
                                    <li>Store or transmit malicious code, viruses, or harmful content</li>
                                    <li>Violate any intellectual property rights</li>
                                    <li>Harass, abuse, or harm others</li>
                                    <li>Engage in spam or unsolicited communications</li>
                                    <li>Attempt to reverse engineer or copy our software</li>
                                    <li>Use the Service for any illegal activities</li>
                                </ul>
                            </section>

                            {/* Data and Privacy */}
                            <section>
                                <h2 className="text-2xl font-bold text-slate-900 mb-4">Data and Privacy</h2>
                                <p className="text-slate-700 leading-relaxed mb-4">
                                    Your privacy is important to us. Our collection and use of personal information is governed by our Privacy Policy, which is incorporated into these Terms by reference.
                                </p>
                                <p className="text-slate-700 leading-relaxed mb-4">
                                    You are responsible for the data you input into our Service and must ensure you have the right to use and store such information.
                                </p>
                            </section>

                            {/* Intellectual Property */}
                            <section>
                                <h2 className="text-2xl font-bold text-slate-900 mb-4">Intellectual Property</h2>
                                <p className="text-slate-700 leading-relaxed mb-4">
                                    The Service and its original content, features, and functionality are owned by Pebble and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.
                                </p>
                                <p className="text-slate-700 leading-relaxed mb-4">
                                    You retain ownership of any data you input into our Service. We do not claim ownership of your business data.
                                </p>
                            </section>

                            {/* Limitation of Liability */}
                            <section>
                                <h2 className="text-2xl font-bold text-slate-900 mb-4">Limitation of Liability</h2>
                                <p className="text-slate-700 leading-relaxed mb-4">
                                    In no event shall Pebble, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your use of the Service.
                                </p>
                                <p className="text-slate-700 leading-relaxed mb-4">
                                    Our total liability to you for any claims arising from these Terms or your use of the Service shall not exceed the amount you paid us in the 12 months preceding the claim.
                                </p>
                            </section>

                            {/* Termination */}
                            <section>
                                <h2 className="text-2xl font-bold text-slate-900 mb-4">Termination</h2>
                                <p className="text-slate-700 leading-relaxed mb-4">
                                    You may cancel your subscription at any time through your account settings or by contacting us. Upon cancellation:
                                </p>
                                <ul className="list-disc list-inside text-slate-700 space-y-2 ml-4">
                                    <li>Your access to the Service will continue until the end of your current billing period</li>
                                    <li>No further charges will be made to your account</li>
                                    <li>Your data will be retained for 30 days after cancellation</li>
                                    <li>After 30 days, your data will be permanently deleted</li>
                                </ul>
                            </section>

                            {/* Changes to Terms */}
                            <section>
                                <h2 className="text-2xl font-bold text-slate-900 mb-4">Changes to These Terms</h2>
                                <p className="text-slate-700 leading-relaxed">
                                    We reserve the right to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.
                                </p>
                            </section>

                            {/* Governing Law */}
                            <section>
                                <h2 className="text-2xl font-bold text-slate-900 mb-4">Governing Law</h2>
                                <p className="text-slate-700 leading-relaxed">
                                    These Terms shall be interpreted and governed by the laws of the United Kingdom, without regard to its conflict of law provisions. Any disputes arising from these Terms or your use of the Service shall be resolved in the courts of the United Kingdom.
                                </p>
                            </section>

                            {/* Contact Information */}
                            <section>
                                <h2 className="text-2xl font-bold text-slate-900 mb-4">Contact Us</h2>
                                <p className="text-slate-700 leading-relaxed mb-4">
                                    If you have any questions about these Terms & Conditions, please contact us:
                                </p>
                                <div className="bg-slate-50 rounded-lg p-4">
                                    <p className="text-slate-700">
                                        <strong>Email:</strong> <a href="mailto:support@pebblecrm.app" className="text-blue-600 hover:text-blue-800 underline">support@pebblecrm.app</a><br />
                                        <strong>Response Time:</strong> We aim to respond to all inquiries within 48 hours
                                    </p>
                                </div>
                            </section>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Terms; 