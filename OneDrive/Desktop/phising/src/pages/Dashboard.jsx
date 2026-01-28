import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { scanApi } from '../lib/api'
import ScanResult from '../components/ScanResult'
import { Search, Shield, ShieldAlert, ShieldX, Activity, AlertCircle, Users, Mail, Lock, Clock } from 'lucide-react'

function Dashboard() {
    const { visitorName } = useAuth()
    const [activeTab, setActiveTab] = useState('url') // 'url' or 'email'
    const [currentTime, setCurrentTime] = useState(new Date())

    // URL Scan State
    const [url, setUrl] = useState('')
    const [scanningUrl, setScanningUrl] = useState(false)
    const [urlResult, setUrlResult] = useState(null)

    // Email Scan State
    const [email, setEmail] = useState('')
    const [scanningEmail, setScanningEmail] = useState(false)
    const [emailResult, setEmailResult] = useState(null)

    const [error, setError] = useState('')
    const [stats, setStats] = useState(null)
    const [recentScans, setRecentScans] = useState([])
    const [loadingStats, setLoadingStats] = useState(true)

    // Update time every second
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000)
        return () => clearInterval(timer)
    }, [])

    useEffect(() => {
        if (visitorName) {
            loadDashboardData()
        }
    }, [visitorName])

    const loadDashboardData = async () => {
        setLoadingStats(true)
        try {
            const [historyData, statsData] = await Promise.all([
                scanApi.getHistory(visitorName),
                scanApi.getStats(visitorName)
            ])
            setStats(statsData)
            setRecentScans(historyData.slice(0, 5))
        } catch (err) {
            console.error('Failed to load dashboard data:', err)
        } finally {
            setLoadingStats(false)
        }
    }

    const handleUrlScan = async (e) => {
        e.preventDefault()
        if (!url.trim()) return

        setError('')
        setScanningUrl(true)
        setUrlResult(null)

        try {
            const result = await scanApi.analyzeUrl(url.trim(), visitorName)
            setUrlResult(result)
            loadDashboardData()
        } catch (err) {
            setError(err.message || 'Failed to analyze URL')
        } finally {
            setScanningUrl(false)
        }
    }

    const handleEmailScan = async (e) => {
        e.preventDefault()
        if (!email.trim()) return

        setError('')
        setScanningEmail(true)
        setEmailResult(null)

        try {
            const result = await scanApi.analyzeEmail(email.trim())
            setEmailResult(result)
        } catch (err) {
            setError(err.message || 'Failed to analyze email')
        } finally {
            setScanningEmail(false)
        }
    }

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
            second: '2-digit',
            hour12: true
        })
    }

    return (
        <div className="px-4 pb-8 max-w-5xl mx-auto">
            {/* Greeting with Time */}
            <div className="mb-8 pt-8">
                <div className="flex items-center gap-2 text-primary-400 mb-2">
                    <Clock className="w-5 h-5" />
                    <span className="text-lg font-medium">{formatTime()}</span>
                </div>
                <h1 className="text-4xl font-bold gradient-text mb-2">
                    {getGreeting()}, {visitorName}!
                </h1>
                <p className="text-gray-400">Check URLs or scan your email for breaches</p>
            </div>

            {/* Mode Switcher */}
            <div className="flex gap-4 mb-6">
                <button
                    onClick={() => setActiveTab('url')}
                    className={`px-6 py-3 rounded-xl font-medium flex items-center gap-2 transition-all ${activeTab === 'url'
                        ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/25'
                        : 'bg-dark-800 text-gray-400 hover:bg-dark-700'
                        }`}
                >
                    <Search className="w-5 h-5" />
                    URL Scanner
                </button>
                <button
                    onClick={() => setActiveTab('email')}
                    className={`px-6 py-3 rounded-xl font-medium flex items-center gap-2 transition-all ${activeTab === 'email'
                        ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/25'
                        : 'bg-dark-800 text-gray-400 hover:bg-dark-700'
                        }`}
                >
                    <Mail className="w-5 h-5" />
                    Email Risk Check
                </button>
            </div>

            {/* Main Scanner Card */}
            <div className="glass-card p-8 mb-8 relative overflow-hidden transition-all duration-300">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

                {activeTab === 'url' ? (
                    <>
                        <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                            <Shield className="w-6 h-6 text-primary-400" />
                            Analyze Website Safety
                        </h2>
                        <form onSubmit={handleUrlScan} className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1 relative">
                                <input
                                    type="text"
                                    value={url}
                                    onChange={(e) => setUrl(e.target.value)}
                                    className="input-field pr-12 text-lg py-4"
                                    placeholder="Paste URL (e.g., example.com)"
                                />
                                {scanningUrl && (
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                        <div className="w-5 h-5 border-2 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
                                    </div>
                                )}
                            </div>
                            <button
                                type="submit"
                                disabled={scanningUrl || !url.trim()}
                                className="btn-primary flex items-center justify-center gap-2 px-8 py-4 text-lg font-medium min-w-[160px]"
                            >
                                {scanningUrl ? 'Scanning...' : 'Check URL'}
                            </button>
                        </form>
                    </>
                ) : (
                    <>
                        <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                            <Lock className="w-6 h-6 text-primary-400" />
                            Check Email Breach Status
                        </h2>
                        <form onSubmit={handleEmailScan} className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1 relative">
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="input-field pr-12 text-lg py-4"
                                    placeholder="Enter email address"
                                />
                                {scanningEmail && (
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                        <div className="w-5 h-5 border-2 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
                                    </div>
                                )}
                            </div>
                            <button
                                type="submit"
                                disabled={scanningEmail || !email.trim()}
                                className="btn-primary flex items-center justify-center gap-2 px-8 py-4 text-lg font-medium min-w-[160px]"
                            >
                                {scanningEmail ? 'Checking...' : 'Check Risk'}
                            </button>
                        </form>
                    </>
                )}

                {error && (
                    <div className="flex items-center gap-2 mt-4 p-4 bg-danger-500/10 border border-danger-500/30 rounded-lg text-danger-400">
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        <span>{error}</span>
                    </div>
                )}
            </div>

            {/* URL Results */}
            {activeTab === 'url' && urlResult && (
                <div className="mb-8 animate-fade-in">
                    <ScanResult result={urlResult} />
                    <div className="mt-4 flex justify-center">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-dark-800/50 rounded-full border border-primary-500/20 text-primary-300">
                            <Users className="w-4 h-4" />
                            <span>{urlResult.popularity > 1 ? `${urlResult.popularity} users have checked this URL` : 'You are the first to check this URL!'}</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Email Results */}
            {activeTab === 'email' && emailResult && (
                <div className="mb-8 animate-fade-in glass-card p-8">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-semibold text-white">Risk Analysis Report</h3>
                        <span className={`px-4 py-1 rounded-full text-sm font-bold ${emailResult.riskLevel === 'Low' ? 'bg-success-500/20 text-success-400' :
                            emailResult.riskLevel === 'Medium' ? 'bg-warning-500/20 text-warning-400' : 'bg-danger-500/20 text-danger-400'
                            }`}>
                            {emailResult.riskLevel} Risk
                        </span>
                    </div>

                    <div className="bg-dark-900/50 rounded-xl p-6 mb-6">
                        <div className="flex items-start gap-4">
                            <div className={`p-3 rounded-lg ${emailResult.riskLevel === 'Low' ? 'bg-success-500/10' :
                                emailResult.riskLevel === 'Medium' ? 'bg-warning-500/10' : 'bg-danger-500/10'
                                }`}>
                                <AlertCircle className={`w-6 h-6 ${emailResult.riskLevel === 'Low' ? 'text-success-400' :
                                    emailResult.riskLevel === 'Medium' ? 'text-warning-400' : 'text-danger-400'
                                    }`} />
                            </div>
                            <div>
                                <p className="text-white font-medium text-lg mb-1">{emailResult.warning}</p>
                                <p className="text-gray-400">Target: {emailResult.email}</p>
                            </div>
                        </div>
                    </div>

                    {emailResult.breaches.length > 0 && (
                        <div>
                            <h4 className="text-gray-300 font-medium mb-4">Known Data Breaches</h4>
                            <div className="grid gap-3">
                                {emailResult.breaches.map((breach, i) => (
                                    <div key={i} className="p-4 rounded-lg bg-dark-800/50 border border-white/5">
                                        <div className="flex justify-between items-start mb-2">
                                            <h5 className="text-white font-medium">{breach.name}</h5>
                                            <span className="text-xs text-gray-500">{breach.date}</span>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {breach.data.map((d, j) => (
                                                <span key={j} className="text-xs px-2 py-1 rounded bg-white/5 text-gray-400 border border-white/5">
                                                    {d}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Stats Cards */}
            {loadingStats ? (
                <div className="flex justify-center py-12"><div className="loader" /></div>
            ) : stats && stats.totalScans > 0 && (
                <div className="grid md:grid-cols-3 gap-4 mb-4">
                    <div className="glass-card p-6 flex items-center justify-between">
                        <div><p className="text-gray-400 text-sm">Total Scans</p><p className="text-2xl font-bold text-white">{stats.totalScans}</p></div>
                        <Activity className="w-8 h-8 text-primary-500/50" />
                    </div>
                    <div className="glass-card p-6 flex items-center justify-between">
                        <div><p className="text-gray-400 text-sm">Safe Sites</p><p className="text-2xl font-bold text-success-400">{stats.safeCount}</p></div>
                        <Shield className="w-8 h-8 text-success-500/50" />
                    </div>
                    <div className="glass-card p-6 flex items-center justify-between">
                        <div><p className="text-gray-400 text-sm">Threats</p><p className="text-2xl font-bold text-danger-400">{stats.suspiciousCount + stats.phishingCount}</p></div>
                        <ShieldAlert className="w-8 h-8 text-danger-500/50" />
                    </div>
                </div>
            )}
        </div>
    )
}

export default Dashboard
