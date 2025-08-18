import { Link } from 'react-router-dom';

const Privacy: React.FC = () => {
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
                            Privacy Policy
                        </h1>
                        <p className="text-xl text-slate-600">
                            Last updated: {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>
                    </div>

                    <div className="prose prose-slate max-w-none">
                        <div className="space-y-8">
                            {/* Introduction */}
                            <section>
                                <h2 className="text-2xl font-bold text-slate-900 mb-4">Introduction</h2>
                                <p className="text-slate-700 leading-relaxed">
                                    Pebble ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our Customer Relationship Management (CRM) service.
                                </p>
                                <p className="text-slate-700 leading-relaxed mt-4">
                                    By using Pebble, you agree to the collection and use of information in accordance with this policy. If you do not agree with our policies and practices, please do not use our service.
                                </p>
                            </section>

                            {/* Information We Collect */}
                            <section>
                                <h2 className="text-2xl font-bold text-slate-900 mb-4">Information We Collect</h2>

                                <h3 className="text-xl font-semibold text-slate-800 mb-3">Personal Information</h3>
                                <ul className="list-disc list-inside text-slate-700 space-y-2 ml-4">
                                    <li><strong>Account Information:</strong> Email address, password, display name</li>
                                    <li><strong>Profile Information:</strong> Company name, phone number format preferences, currency preferences</li>
                                    <li><strong>Business Data:</strong> Contact information, interaction history, task details, pipeline opportunities</li>
                                </ul>

                                <h3 className="text-xl font-semibold text-slate-800 mb-3 mt-6">Automatically Collected Information</h3>
                                <ul className="list-disc list-inside text-slate-700 space-y-2 ml-4">
                                    <li><strong>Usage Data:</strong> How you interact with our service, features used, time spent</li>
                                    <li><strong>Device Information:</strong> Browser type, operating system, IP address</li>
                                    <li><strong>Cookies:</strong> Session cookies for authentication and preferences</li>
                                </ul>
                            </section>

                            {/* How We Use Your Information */}
                            <section>
                                <h2 className="text-2xl font-bold text-slate-900 mb-4">How We Use Your Information</h2>
                                <p className="text-slate-700 leading-relaxed mb-4">
                                    We use the collected information for the following purposes:
                                </p>
                                <ul className="list-disc list-inside text-slate-700 space-y-2 ml-4">
                                    <li>Provide, maintain, and improve our CRM service</li>
                                    <li>Process transactions and manage your account</li>
                                    <li>Send you service-related notices and updates</li>
                                    <li>Respond to your comments, questions, and support requests</li>
                                    <li>Monitor and analyze usage patterns and trends</li>
                                    <li>Detect, prevent, and address technical issues</li>
                                    <li>Comply with legal obligations</li>
                                </ul>
                            </section>

                            {/* Data Storage and Firebase */}
                            <section>
                                <h2 className="text-2xl font-bold text-slate-900 mb-4">Data Storage and Security</h2>

                                <h3 className="text-xl font-semibold text-slate-800 mb-3">Firebase Backend Services</h3>
                                <p className="text-slate-700 leading-relaxed mb-4">
                                    Pebble uses Google Firebase services for data storage and authentication. Your data is stored securely using the following Firebase services:
                                </p>
                                <ul className="list-disc list-inside text-slate-700 space-y-2 ml-4">
                                    <li><strong>Firebase Authentication:</strong> Secure user authentication with encrypted password storage</li>
                                    <li><strong>Cloud Firestore:</strong> NoSQL database with automatic encryption at rest and in transit</li>
                                    <li><strong>Firebase Security Rules:</strong> User-level data isolation ensuring your data is only accessible to you</li>
                                </ul>

                                <h3 className="text-xl font-semibold text-slate-800 mb-3 mt-6">Data Protection Measures</h3>
                                <ul className="list-disc list-inside text-slate-700 space-y-2 ml-4">
                                    <li><strong>Encryption:</strong> All data is encrypted using AES-256 encryption</li>
                                    <li><strong>Access Control:</strong> Firebase Security Rules ensure data isolation between users</li>
                                    <li><strong>Secure Connections:</strong> All data transmission uses HTTPS/TLS encryption</li>
                                    <li><strong>Regular Backups:</strong> Automated backup systems with geographic redundancy</li>
                                </ul>

                                <h3 className="text-xl font-semibold text-slate-800 mb-3 mt-6">Data Location</h3>
                                <p className="text-slate-700 leading-relaxed">
                                    Your data is stored in Google's secure data centers. While we strive to keep data in your preferred region, data may be processed in countries where Google operates data centers. All data processing complies with applicable data protection laws.
                                </p>
                            </section>

                            {/* Data Sharing */}
                            <section>
                                <h2 className="text-2xl font-bold text-slate-900 mb-4">Data Sharing and Disclosure</h2>
                                <p className="text-slate-700 leading-relaxed mb-4">
                                    We do not sell, trade, or otherwise transfer your personal information to third parties, except in the following circumstances:
                                </p>
                                <ul className="list-disc list-inside text-slate-700 space-y-2 ml-4">
                                    <li><strong>Service Providers:</strong> We use trusted third-party services (Firebase, hosting providers) to operate our service</li>
                                    <li><strong>Legal Requirements:</strong> We may disclose information if required by law or to protect our rights</li>
                                    <li><strong>Business Transfers:</strong> In the event of a merger or acquisition, user information may be transferred</li>
                                    <li><strong>Consent:</strong> We will only share your information with your explicit consent</li>
                                </ul>
                            </section>

                            {/* Your Rights */}
                            <section>
                                <h2 className="text-2xl font-bold text-slate-900 mb-4">Your Rights and Choices</h2>
                                <p className="text-slate-700 leading-relaxed mb-4">
                                    Depending on your location, you may have the following rights regarding your personal information:
                                </p>
                                <ul className="list-disc list-inside text-slate-700 space-y-2 ml-4">
                                    <li><strong>Access:</strong> Request a copy of your personal information</li>
                                    <li><strong>Correction:</strong> Update or correct inaccurate information</li>
                                    <li><strong>Deletion:</strong> Request deletion of your personal information</li>
                                    <li><strong>Portability:</strong> Export your data in a machine-readable format</li>
                                    <li><strong>Restriction:</strong> Limit how we process your information</li>
                                    <li><strong>Objection:</strong> Object to certain types of processing</li>
                                </ul>
                                <p className="text-slate-700 leading-relaxed mt-4">
                                    To exercise these rights, please contact us using the information provided below.
                                </p>
                            </section>

                            {/* Data Retention */}
                            <section>
                                <h2 className="text-2xl font-bold text-slate-900 mb-4">Data Retention</h2>
                                <p className="text-slate-700 leading-relaxed">
                                    We retain your personal information for as long as your account is active or as needed to provide services. If you delete your account, we will delete or anonymize your personal information within 30 days, except where we are required to retain certain information for legal, regulatory, or security purposes.
                                </p>
                            </section>

                            {/* Cookies */}
                            <section>
                                <h2 className="text-2xl font-bold text-slate-900 mb-4">Cookies and Tracking Technologies</h2>
                                <p className="text-slate-700 leading-relaxed mb-4">
                                    We use cookies and similar tracking technologies to:
                                </p>
                                <ul className="list-disc list-inside text-slate-700 space-y-2 ml-4">
                                    <li>Maintain your authentication session</li>
                                    <li>Remember your preferences and settings</li>
                                    <li>Analyze how you use our service</li>
                                    <li>Improve our service performance and user experience</li>
                                </ul>
                                <p className="text-slate-700 leading-relaxed mt-4">
                                    You can control cookie settings through your browser preferences. However, disabling certain cookies may affect the functionality of our service.
                                </p>
                            </section>

                            {/* Children's Privacy */}
                            <section>
                                <h2 className="text-2xl font-bold text-slate-900 mb-4">Children's Privacy</h2>
                                <p className="text-slate-700 leading-relaxed">
                                    Pebble is not intended for use by individuals under the age of 18. We do not knowingly collect personal information from children under 18. If you become aware that a child has provided us with personal information, please contact us immediately.
                                </p>
                            </section>

                            {/* International Transfers */}
                            <section>
                                <h2 className="text-2xl font-bold text-slate-900 mb-4">International Data Transfers</h2>
                                <p className="text-slate-700 leading-relaxed">
                                    Your information may be transferred to and processed in countries other than your own. We ensure that such transfers comply with applicable data protection laws and implement appropriate safeguards to protect your information.
                                </p>
                            </section>

                            {/* Changes to Policy */}
                            <section>
                                <h2 className="text-2xl font-bold text-slate-900 mb-4">Changes to This Privacy Policy</h2>
                                <p className="text-slate-700 leading-relaxed">
                                    We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date. We encourage you to review this Privacy Policy periodically for any changes.
                                </p>
                            </section>

                            {/* Contact Information */}
                            <section>
                                <h2 className="text-2xl font-bold text-slate-900 mb-4">Contact Us</h2>
                                <p className="text-slate-700 leading-relaxed mb-4">
                                    If you have any questions about this Privacy Policy or our data practices, please contact us:
                                </p>
                                <div className="bg-slate-50 rounded-lg p-4">
                                    <p className="text-slate-700">
                                        <strong>Email:</strong> <a href="mailto:support@pebblecrm.app" className="text-blue-600 hover:text-blue-800 underline">support@pebblecrm.app</a><br />
                                        <strong>Response Time:</strong> We aim to respond to all inquiries within 48 hours
                                    </p>
                                </div>
                            </section>

                            {/* Legal Basis */}
                            <section>
                                <h2 className="text-2xl font-bold text-slate-900 mb-4">Legal Basis for Processing (EU/UK Users)</h2>
                                <p className="text-slate-700 leading-relaxed mb-4">
                                    For users in the European Union and United Kingdom, we process your personal information based on the following legal grounds:
                                </p>
                                <ul className="list-disc list-inside text-slate-700 space-y-2 ml-4">
                                    <li><strong>Contract:</strong> Processing necessary to provide our CRM service</li>
                                    <li><strong>Legitimate Interest:</strong> Improving our service and preventing fraud</li>
                                    <li><strong>Consent:</strong> For optional features and communications</li>
                                    <li><strong>Legal Obligation:</strong> Compliance with applicable laws</li>
                                </ul>
                            </section>
                        </div>
                    </div>

                    {/* Removed the "Back to Home" button section entirely */}
                </div>
            </div>
        </div>
    );
};

export default Privacy;