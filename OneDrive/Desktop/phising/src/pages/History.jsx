import { useState, useEffect } from 'react'
import { scanApi } from '../lib/api'
import { useAuth } from '../contexts/AuthContext'
import ExportButton from '../components/ExportButton'
import { History as HistoryIcon, Search, Filter, ExternalLink, X, Globe, ShieldCheck, ShieldAlert, ShieldX } from 'lucide-react'

function History() {
    const { visitorName } = useAuth()
    const [scans, setScans] = useState([])
    const [filteredScans, setFilteredScans] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [classificationFilter, setClassificationFilter] = useState('all')
    const [selectedScan, setSelectedScan] = useState(null)

    useEffect(() => {
        if (visitorName) {
            loadHistory()
        }
    }, [visitorName])

    useEffect(() => {
        filterScans()
    }, [scans, searchQuery, classificationFilter])

    const loadHistory = async () => {
        setLoading(true)
        try {
            const data = await scanApi.getHistory(visitorName)
            setScans(data)
        } catch (err) {
            console.error('Failed to load history:', err)
        } finally {
            setLoading(false)
        }
    }

    const filterScans = () => {
        let result = scans

        if (searchQuery) {
            result = result.filter(scan =>
                scan.url.toLowerCase().includes(searchQuery.toLowerCase())
            )
        }

        if (classificationFilter !== 'all') {
            result = result.filter(scan => scan.classification === classificationFilter)
        }

        setFilteredScans(result)
    }

    const getClassificationIcon = (classification) => {
        switch (classification) {
            case 'Safe': return <ShieldCheck className="w-5 h-5 text-success-400" />
            case 'Suspicious': return <ShieldAlert className="w-5 h-5 text-warning-400" />
            case 'Phishing': return <ShieldX className="w-5 h-5 text-danger-400" />
            default: return null
        }
    }

    return (
        <div className="px-4 pb-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                            <HistoryIcon className="w-8 h-8 text-primary-400" />
                            Scan History
                        </h1>
                        <p className="text-gray-400 mt-1">View your past URL scans</p>
                    </div>
                    <ExportButton data={filteredScans} filename="phishguard-history" />
                </div>

                {/* Filters and Results */}
                {/* ... (Existing table code remains functionally same, just re-verified context usage) */}

                <div className="glass-card p-4 mb-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="input-field pl-12"
                                placeholder="Search URLs..."
                            />
                        </div>

                        <div className="flex items-center gap-2">
                            <Filter className="w-5 h-5 text-gray-500" />
                            <select
                                value={classificationFilter}
                                onChange={(e) => setClassificationFilter(e.target.value)}
                                className="input-field w-auto bg-dark-900"
                            >
                                <option value="all">All Classifications</option>
                                <option value="Safe">Safe</option>
                                <option value="Suspicious">Suspicious</option>
                                <option value="Phishing">Phishing</option>
                            </select>
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="loader" />
                    </div>
                ) : filteredScans.length === 0 ? (
                    <div className="glass-card p-12 text-center">
                        <HistoryIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-white mb-2">No scans found</h3>
                        <p className="text-gray-400">
                            Start scanning URLs to build your history.
                        </p>
                    </div>
                ) : (
                    <div className="glass-card overflow-hidden">
                        <div className="table-container">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>URL</th>
                                        <th className="text-center">Risk Score</th>
                                        <th className="text-center">Classification</th>
                                        <th>Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredScans.map(scan => (
                                        <tr key={scan.id} className="cursor-pointer" onClick={() => setSelectedScan(scan)}>
                                            <td className="max-w-xs">
                                                <div className="flex items-center gap-2">
                                                    <Globe className="w-4 h-4 text-gray-500 flex-shrink-0" />
                                                    <span className="text-primary-300 font-mono text-sm truncate">
                                                        {scan.url}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="text-center">
                                                <span className={`inline-flex items-center justify-center w-10 h-10 rounded-full font-bold ${scan.risk_score <= 30 ? 'bg-success-500/20 text-success-400' :
                                                        scan.risk_score <= 70 ? 'bg-warning-500/20 text-warning-400' : 'bg-danger-500/20 text-danger-400'
                                                    }`}>
                                                    {scan.risk_score}
                                                </span>
                                            </td>
                                            <td className="text-center">
                                                <span className={`badge ${scan.classification === 'Safe' ? 'badge-safe' :
                                                        scan.classification === 'Suspicious' ? 'badge-suspicious' : 'badge-phishing'
                                                    }`}>
                                                    {scan.classification}
                                                </span>
                                            </td>
                                            <td className="text-gray-400 text-sm whitespace-nowrap">
                                                {new Date(scan.created_at).toLocaleString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Detail Modal */}
                {selectedScan && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setSelectedScan(null)}>
                        <div className="glass-card w-full max-w-2xl" onClick={(e) => e.stopPropagation()}>
                            <div className="p-6">
                                <div className="flex items-start justify-between mb-6">
                                    <div className="flex items-center gap-3">
                                        {getClassificationIcon(selectedScan.classification)}
                                        <div>
                                            <h3 className="text-xl font-semibold text-white">Scan Details</h3>
                                            <p className="text-sm text-gray-400">{new Date(selectedScan.created_at).toLocaleString()}</p>
                                        </div>
                                    </div>
                                    <button onClick={() => setSelectedScan(null)} className="text-gray-500 hover:text-white p-1">
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    <div className="p-4 bg-dark-900/50 rounded-lg">
                                        <div className="text-sm text-gray-400 mb-1">URL</div>
                                        <code className="text-primary-300 break-all">{selectedScan.url}</code>
                                    </div>

                                    {/* ... (Rest of modal content similar to before) */}
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="p-4 bg-dark-900/50 rounded-lg text-center">
                                            <div className={`text-3xl font-bold ${selectedScan.risk_score <= 30 ? 'text-success-400' :
                                                    selectedScan.risk_score <= 70 ? 'text-warning-400' : 'text-danger-400'
                                                }`}>
                                                {selectedScan.risk_score}
                                            </div>
                                            <div className="text-sm text-gray-400">Risk Score</div>
                                        </div>
                                        <div className="p-4 bg-dark-900/50 rounded-lg text-center">
                                            <span className={`badge ${selectedScan.classification === 'Safe' ? 'badge-safe' :
                                                    selectedScan.classification === 'Suspicious' ? 'badge-suspicious' : 'badge-phishing'
                                                }`}>
                                                {selectedScan.classification}
                                            </span>
                                            <div className="text-sm text-gray-400 mt-2">Classification</div>
                                        </div>
                                        <div className="p-4 bg-dark-900/50 rounded-lg text-center">
                                            <div className="text-xl font-bold text-white">
                                                {
                                                    (selectedScan.virustotal_result?.positives || 0) +
                                                    (selectedScan.phishtank_result?.in_database ? 1 : 0)
                                                }
                                            </div>
                                            <div className="text-sm text-gray-400">Total Detections</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default History
