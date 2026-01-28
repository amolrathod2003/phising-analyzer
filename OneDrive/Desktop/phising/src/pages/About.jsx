import { Shield, Info, Globe, Mail, CheckCircle } from 'lucide-react'

function About() {
    return (
        <div className="px-4 pb-8 max-w-5xl mx-auto">
            {/* Header */}
            <div className="mb-8 pt-8">
                <h1 className="text-4xl font-bold gradient-text mb-2 flex items-center gap-3">
                    <Info className="w-10 h-10 text-primary-400" />
                    About PhishGuard
                </h1>
                <p className="text-gray-400">Protecting your digital life from threats</p>
            </div>

            <div className="grid gap-8">
                {/* Main Introduction */}
                <div className="glass-card p-8">
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-primary-500/10 rounded-xl">
                            <Shield className="w-8 h-8 text-primary-400" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-white mb-4">Our Mission</h2>
                            <p className="text-gray-300 leading-relaxed text-lg">
                                This application helps users identify phishing and malicious threats in both websites and emails.
                                Users can scan a website URL or an email message to check whether it is Safe, Suspicious, or Phishing.
                                The goal of this project is to protect users from online fraud, fake websites, and phishing emails
                                by providing fast, intelligent, and easy-to-understand security analysis.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Features Grid */}
                <div className="grid md:grid-cols-2 gap-8">
                    {/* Website Scanning */}
                    <div className="glass-card p-8 relative overflow-hidden group hover:bg-dark-800/80 transition-all">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />

                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-blue-500/10 rounded-lg">
                                <Globe className="w-6 h-6 text-blue-400" />
                            </div>
                            <h3 className="text-xl font-bold text-white">Website Scanning</h3>
                        </div>

                        <p className="text-gray-400 mb-6">
                            For website scanning, the system analyzes multiple security factors to generate a comprehensive risk score and security status.
                        </p>

                        <ul className="space-y-3">
                            {[
                                'Domain reputation analysis',
                                'SSL certificate verification',
                                'Threat intelligence sources',
                                'Real-time phishing database checks'
                            ].map((item, i) => (
                                <li key={i} className="flex items-center gap-2 text-gray-300 text-sm">
                                    <CheckCircle className="w-4 h-4 text-primary-400 flex-shrink-0" />
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Email Scanning */}
                    <div className="glass-card p-8 relative overflow-hidden group hover:bg-dark-800/80 transition-all">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />

                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-purple-500/10 rounded-lg">
                                <Mail className="w-6 h-6 text-purple-400" />
                            </div>
                            <h3 className="text-xl font-bold text-white">Email Scanning</h3>
                        </div>

                        <p className="text-gray-400 mb-6">
                            For email scanning, it examines critical message components to detect possible scams and fraudulent messages.
                        </p>

                        <ul className="space-y-3">
                            {[
                                'Sender details verification',
                                'Suspicious link detection',
                                'Common phishing patterns',
                                'Data breach cross-referencing'
                            ].map((item, i) => (
                                <li key={i} className="flex items-center gap-2 text-gray-300 text-sm">
                                    <CheckCircle className="w-4 h-4 text-primary-400 flex-shrink-0" />
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Closing Value Prop */}
                <div className="glass-card p-8 text-center bg-gradient-to-br from-dark-800 to-dark-900 border-primary-500/20">
                    <p className="text-xl text-primary-100 font-medium">
                        "Providing fast, intelligent, and easy-to-understand security analysis."
                    </p>
                </div>
            </div>
        </div>
    )
}

export default About
