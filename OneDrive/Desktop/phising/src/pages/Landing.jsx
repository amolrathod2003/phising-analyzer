import { useState, useEffect } from 'react'
import { Shield, ArrowRight, User, Clock } from 'lucide-react'

function Landing({ onVerified }) {
    const [name, setName] = useState('')
    const [error, setError] = useState('')
    const [currentTime, setCurrentTime] = useState(new Date())

    // Update time every second
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000)
        return () => clearInterval(timer)
    }, [])

    const getGreeting = () => {
        const hour = currentTime.getHours()
        if (hour < 12) return 'Good Morning'
        if (hour < 17) return 'Good Afternoon'
        if (hour < 21) return 'Good Evening'
        return 'Good Night'
    }

    const formatTime = () => {
        return currentTime.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        })
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        setError('')

        if (!name.trim()) {
            setError('Please enter your name')
            return
        }

        if (name.trim().length < 2) {
            setError('Name must be at least 2 characters')
            return
        }

        // Direct access without CAPTCHA
        onVerified(name.trim())
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="w-full max-w-md animate-fade-in">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="inline-flex p-4 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl mb-4 shadow-lg shadow-primary-500/30">
                        <Shield className="w-12 h-12 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold gradient-text">PhishGuard</h1>
                    <p className="text-gray-400 mt-2">Phishing Detection & Website Safety Analyzer</p>
                </div>

                {/* Entry Card */}
                <div className="glass-card p-8">
                    <div className="text-center mb-6">
                        {/* Time-based Greeting */}
                        <div className="flex items-center justify-center gap-2 text-primary-400 mb-3">
                            <Clock className="w-4 h-4" />
                            <span className="text-sm font-medium">{formatTime()}</span>
                        </div>
                        <h2 className="text-2xl font-semibold text-white">{getGreeting()}!</h2>
                        <p className="text-gray-400 mt-2 text-sm">
                            Please enter your name to continue
                        </p>
                    </div>

                    {error && (
                        <div className="flex items-center gap-2 p-4 mb-6 bg-danger-500/10 border border-danger-500/30 rounded-lg text-danger-400 text-sm">
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="input-field pl-12"
                                    placeholder="Your Name"
                                    autoComplete="name"
                                    autoFocus
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="btn-primary w-full flex items-center justify-center gap-2"
                        >
                            Continue to Dashboard
                            <ArrowRight className="w-4 h-4 ml-1" />
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default Landing
