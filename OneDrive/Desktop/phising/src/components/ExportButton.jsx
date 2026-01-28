import { useState } from 'react'
import { Download, FileText, FileSpreadsheet, Loader } from 'lucide-react'
import jsPDF from 'jspdf'
import 'jspdf-autotable'

function ExportButton({ data, filename = 'phishguard-report' }) {
    const [exporting, setExporting] = useState(null)

    const exportToCSV = () => {
        setExporting('csv')

        try {
            const headers = ['URL', 'Risk Score', 'Classification', 'Date', 'VirusTotal Positives', 'PhishTank Status']
            const rows = data.map(item => [
                item.url,
                item.risk_score,
                item.classification,
                new Date(item.created_at).toLocaleString(),
                item.virustotal_result?.positives || 0,
                item.phishtank_result?.in_database ? 'Found' : 'Not Found'
            ])

            const csvContent = [
                headers.join(','),
                ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
            ].join('\n')

            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
            const link = document.createElement('a')
            link.href = URL.createObjectURL(blob)
            link.download = `${filename}.csv`
            link.click()
        } finally {
            setExporting(null)
        }
    }

    const exportToPDF = () => {
        setExporting('pdf')

        try {
            const doc = new jsPDF()

            // Header
            doc.setFillColor(99, 102, 241)
            doc.rect(0, 0, 220, 40, 'F')

            doc.setTextColor(255, 255, 255)
            doc.setFontSize(24)
            doc.text('PhishGuard Report', 14, 25)

            doc.setFontSize(10)
            doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 35)

            // Summary
            doc.setTextColor(0, 0, 0)
            doc.setFontSize(14)
            doc.text('Scan Summary', 14, 55)

            const safeCount = data.filter(d => d.classification === 'Safe').length
            const suspiciousCount = data.filter(d => d.classification === 'Suspicious').length
            const phishingCount = data.filter(d => d.classification === 'Phishing').length

            doc.setFontSize(10)
            doc.setTextColor(100, 100, 100)
            doc.text(`Total Scans: ${data.length}`, 14, 65)
            doc.text(`Safe: ${safeCount}  |  Suspicious: ${suspiciousCount}  |  Phishing: ${phishingCount}`, 14, 72)

            // Table
            const tableData = data.map(item => [
                item.url.length > 40 ? item.url.substring(0, 40) + '...' : item.url,
                item.risk_score.toString(),
                item.classification,
                new Date(item.created_at).toLocaleDateString(),
            ])

            doc.autoTable({
                startY: 85,
                head: [['URL', 'Risk Score', 'Classification', 'Date']],
                body: tableData,
                theme: 'striped',
                headStyles: {
                    fillColor: [99, 102, 241],
                    textColor: [255, 255, 255],
                },
                styles: {
                    fontSize: 8,
                    cellPadding: 3,
                },
                columnStyles: {
                    0: { cellWidth: 80 },
                    1: { cellWidth: 25, halign: 'center' },
                    2: { cellWidth: 30, halign: 'center' },
                    3: { cellWidth: 30, halign: 'center' },
                },
            })

            // Footer
            const pageCount = doc.internal.getNumberOfPages()
            for (let i = 1; i <= pageCount; i++) {
                doc.setPage(i)
                doc.setFontSize(8)
                doc.setTextColor(150, 150, 150)
                doc.text(
                    `Page ${i} of ${pageCount} - PhishGuard Security Report`,
                    doc.internal.pageSize.width / 2,
                    doc.internal.pageSize.height - 10,
                    { align: 'center' }
                )
            }

            doc.save(`${filename}.pdf`)
        } finally {
            setExporting(null)
        }
    }

    return (
        <div className="flex items-center gap-2">
            <button
                onClick={exportToCSV}
                disabled={exporting || data.length === 0}
                className="btn-secondary flex items-center gap-2"
            >
                {exporting === 'csv' ? (
                    <Loader className="w-4 h-4 animate-spin" />
                ) : (
                    <FileSpreadsheet className="w-4 h-4" />
                )}
                <span>Export CSV</span>
            </button>

            <button
                onClick={exportToPDF}
                disabled={exporting || data.length === 0}
                className="btn-secondary flex items-center gap-2"
            >
                {exporting === 'pdf' ? (
                    <Loader className="w-4 h-4 animate-spin" />
                ) : (
                    <FileText className="w-4 h-4" />
                )}
                <span>Export PDF</span>
            </button>
        </div>
    )
}

export default ExportButton
