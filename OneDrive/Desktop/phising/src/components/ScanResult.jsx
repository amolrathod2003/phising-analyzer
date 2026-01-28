import { ShieldCheck, ShieldAlert, ShieldX, ExternalLink, Globe, AlertTriangle, CheckCircle, XCircle } from 'lucide-react'
import RiskGauge from './RiskGauge'

function ScanResult({ result }) {
    if (!result) return null

    const getClassificationStyles = () => {
        switch (result.classification) {
            case 'Safe':
                return { badge: 'badge-safe', icon: <ShieldCheck className="w-6 h-6" /> }
            case 'Suspicious':
                return { badge: 'badge-suspicious', icon: <ShieldAlert className="w-6 h-6" /> }
            case 'Phishing':
                return { badge: 'badge-phishing', icon: <ShieldX className="w-6 h-6" /> }
            default:
                return { badge: 'badge-safe', icon: <ShieldCheck className="w-6 h-6" /> }
        }
    }

    const styles = getClassificationStyles()

    return (
        <div className="glass-card p-6 animate-fade-in">
            <div className="flex flex-col lg:flex-row gap-8">
                {/* Left: Risk Gauge */}
                <div className="flex flex-col items-center">
                    <RiskGauge score={result.risk_score} />
                    <div className={`${styles.badge} mt-4 flex items-center gap-2`}>
                        {styles.icon}
                        <span>{result.classification}</span>
                    </div>
                </div>

                {/* Right: Details */}
                <div className="flex-1 space-y-6">
                    {/* URL */}
                    <div>
                        <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
                            <Globe className="w-4 h-4" />
                            Scanned URL
                        </div>
                        <div className="flex items-center gap-2 p-3 bg-dark-900/50 rounded-lg">
                            <code className="text-primary-300 flex-1 truncate">{result.url}</code>
                            <a
                                href={result.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-gray-500 hover:text-gray-300"
                            >
                                <ExternalLink className="w-4 h-4" />
                            </a>
                        </div>
                    </div>

                    {/* Analysis Sources */}
                    <div className="grid md:grid-cols-2 gap-4">
                        {/* VirusTotal */}
                        <div className="p-4 bg-dark-900/30 rounded-xl border border-primary-500/10">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-sm font-medium text-gray-300">VirusTotal</span>
                                {result.virustotal_result?.detected ? (
                                    <span className="badge-phishing text-xs">Detected</span>
                                ) : (
                                    <span className="badge-safe text-xs">Clean</span>
                                )}
                            </div>
                            <div className="text-2xl font-bold text-white">
                                {result.virustotal_result?.positives || 0}
                                <span className="text-gray-500 text-sm font-normal">
                                    /{result.virustotal_result?.total || 0} engines
                                </span>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                                Security vendors flagged this URL
                            </p>
                        </div>

                        {/* PhishTank */}
                        <div className="p-4 bg-dark-900/30 rounded-xl border border-primary-500/10">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-sm font-medium text-gray-300">PhishTank</span>
                                {result.phishtank_result?.in_database ? (
                                    <span className="badge-phishing text-xs">In Database</span>
                                ) : (
                                    <span className="badge-safe text-xs">Not Found</span>
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                                {result.phishtank_result?.in_database ? (
                                    <XCircle className="w-6 h-6 text-danger-500" />
                                ) : (
                                    <CheckCircle className="w-6 h-6 text-success-500" />
                                )}
                                <span className="text-lg font-medium text-white">
                                    {result.phishtank_result?.in_database ? 'Known Phishing Site' : 'Not in Phishing Database'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Warnings */}
                    {result.warnings && result.warnings.length > 0 && (
                        <div className="p-4 bg-warning-500/10 border border-warning-500/30 rounded-xl">
                            <div className="flex items-center gap-2 text-warning-400 mb-2">
                                <AlertTriangle className="w-5 h-5" />
                                <span className="font-medium">Warnings</span>
                            </div>
                            <ul className="space-y-1">
                                {result.warnings.map((warning, index) => (
                                    <li key={index} className="text-sm text-warning-300 flex items-start gap-2">
                                        <span>•</span>
                                        <span>{warning}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default ScanResult
