import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Shield, LayoutDashboard, History, LogOut, User, Info } from 'lucide-react'

function Navbar() {
    const { visitorName, logout } = useAuth()
    const location = useLocation()

    const handleSignOut = () => {
        logout()
    }

    const isActive = (path) => location.pathname === path

    return (
        <nav className="glass-card mx-4 mt-4 mb-6 px-6 py-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-8">
                    <Link to="/dashboard" className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl">
                            <Shield className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-xl font-bold gradient-text">PhishGuard</span>
                    </Link>

                    <div className="hidden md:flex items-center gap-2">
                        <Link
                            to="/dashboard"
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${isActive('/dashboard')
                                    ? 'bg-primary-600/20 text-primary-400'
                                    : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
                                }`}
                        >
                            <LayoutDashboard className="w-4 h-4" />
                            <span>Dashboard</span>
                        </Link>
                        <Link
                            to="/history"
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${isActive('/history')
                                    ? 'bg-primary-600/20 text-primary-400'
                                    : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
                                }`}
                        >
                            <History className="w-4 h-4" />
                            <span>History</span>
                        </Link>
                        <Link
                            to="/about"
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${isActive('/about')
                                    ? 'bg-primary-600/20 text-primary-400'
                                    : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
                                }`}
                        >
                            <Info className="w-4 h-4" />
                            <span>About</span>
                        </Link>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-sm text-primary-300 bg-primary-500/10 px-3 py-1.5 rounded-full border border-primary-500/20">
                        <User className="w-4 h-4" />
                        <span>{visitorName}</span>
                    </div>
                    <button
                        onClick={handleSignOut}
                        className="flex items-center gap-2 p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                        title="Sign Out"
                    >
                        <LogOut className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </nav>
    )
}

export default Navbar
