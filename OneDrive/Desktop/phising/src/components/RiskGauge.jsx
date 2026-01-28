import { ShieldCheck, ShieldAlert, ShieldX } from 'lucide-react'

function RiskGauge({ score, size = 200 }) {
    const radius = (size - 20) / 2
    const circumference = radius * Math.PI // Half circle
    const offset = circumference - (score / 100) * circumference

    const getColor = () => {
        if (score <= 30) return { stroke: '#22c55e', bg: 'rgba(34, 197, 94, 0.1)' }
        if (score <= 70) return { stroke: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)' }
        return { stroke: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)' }
    }

    const getIcon = () => {
        if (score <= 30) return <ShieldCheck className="w-12 h-12 text-success-500" />
        if (score <= 70) return <ShieldAlert className="w-12 h-12 text-warning-500" />
        return <ShieldX className="w-12 h-12 text-danger-500" />
    }

    const getLabel = () => {
        if (score <= 30) return 'Low Risk'
        if (score <= 70) return 'Medium Risk'
        return 'High Risk'
    }

    const color = getColor()

    return (
        <div className="relative flex flex-col items-center">
            <svg width={size} height={size / 2 + 30} className="transform -rotate-0">
                {/* Background arc */}
                <path
                    d={`M ${10} ${size / 2} A ${radius} ${radius} 0 0 1 ${size - 10} ${size / 2}`}
                    fill="none"
                    stroke="rgba(99, 102, 241, 0.1)"
                    strokeWidth="12"
                    strokeLinecap="round"
                />
                {/* Progress arc */}
                <path
                    d={`M ${10} ${size / 2} A ${radius} ${radius} 0 0 1 ${size - 10} ${size / 2}`}
                    fill="none"
                    stroke={color.stroke}
                    strokeWidth="12"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    className="transition-all duration-1000 ease-out"
                    style={{ filter: `drop-shadow(0 0 8px ${color.stroke}50)` }}
                />
            </svg>

            <div className="absolute bottom-0 flex flex-col items-center">
                {getIcon()}
                <div className="text-4xl font-bold text-white mt-2">{score}</div>
                <div className="text-sm text-gray-400">{getLabel()}</div>
            </div>
        </div>
    )
}

export default RiskGauge
