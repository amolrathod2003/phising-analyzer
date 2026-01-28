import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts'

const COLORS = {
    safe: '#22c55e',
    suspicious: '#f59e0b',
    phishing: '#ef4444',
    primary: '#6366f1',
}

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="glass-card p-3 text-sm">
                <p className="text-gray-300">{label}</p>
                {payload.map((entry, index) => (
                    <p key={index} style={{ color: entry.color }}>
                        {entry.name}: {entry.value}
                    </p>
                ))}
            </div>
        )
    }
    return null
}

export function RiskDistributionChart({ data }) {
    const chartData = [
        { name: 'Safe', value: data.safe, color: COLORS.safe },
        { name: 'Suspicious', value: data.suspicious, color: COLORS.suspicious },
        { name: 'Phishing', value: data.phishing, color: COLORS.phishing },
    ]

    const total = chartData.reduce((sum, item) => sum + item.value, 0)

    return (
        <div className="glass-card p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Risk Distribution</h3>
            <div className="flex items-center justify-center">
                <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                        <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                        >
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-6 mt-4">
                {chartData.map((item) => (
                    <div key={item.name} className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="text-sm text-gray-400">
                            {item.name}: {total > 0 ? Math.round((item.value / total) * 100) : 0}%
                        </span>
                    </div>
                ))}
            </div>
        </div>
    )
}

export function ScansOverTimeChart({ data }) {
    return (
        <div className="glass-card p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Scans Over Time</h3>
            <ResponsiveContainer width="100%" height={200}>
                <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(99, 102, 241, 0.1)" />
                    <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
                    <YAxis stroke="#64748b" fontSize={12} />
                    <Tooltip content={<CustomTooltip />} />
                    <Line
                        type="monotone"
                        dataKey="scans"
                        stroke={COLORS.primary}
                        strokeWidth={2}
                        dot={{ fill: COLORS.primary, strokeWidth: 2 }}
                        activeDot={{ r: 6, fill: COLORS.primary }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    )
}

export function ClassificationBarChart({ data }) {
    return (
        <div className="glass-card p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Classification Breakdown</h3>
            <ResponsiveContainer width="100%" height={200}>
                <BarChart data={data} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(99, 102, 241, 0.1)" />
                    <XAxis type="number" stroke="#64748b" fontSize={12} />
                    <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={12} width={80} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    )
}

export function StatCard({ title, value, icon: Icon, trend, color = 'primary' }) {
    const colorClasses = {
        primary: 'from-primary-500 to-primary-700',
        success: 'from-success-500 to-success-700',
        warning: 'from-warning-500 to-warning-700',
        danger: 'from-danger-500 to-danger-700',
    }

    return (
        <div className="glass-card glass-card-hover p-6">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm text-gray-400">{title}</p>
                    <p className="text-3xl font-bold text-white mt-1">{value}</p>
                    {trend && (
                        <p className={`text-sm mt-2 ${trend > 0 ? 'text-success-400' : 'text-danger-400'}`}>
                            {trend > 0 ? '+' : ''}{trend}% from last week
                        </p>
                    )}
                </div>
                <div className={`p-3 rounded-xl bg-gradient-to-br ${colorClasses[color]}`}>
                    <Icon className="w-6 h-6 text-white" />
                </div>
            </div>
        </div>
    )
}
