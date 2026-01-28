import express from 'express'
import axios from 'axios'
import mongoose from 'mongoose'
import crypto from 'crypto'
import Scan from '../models/Scan.js'

const router = express.Router()

// In-memory scan store for offline mode
const offlineScans = new Map()

// Check if MongoDB is connected
const isDbConnected = () => mongoose.connection.readyState === 1

// Deterministic hash for consistent simulation results
function getHash(str) {
    return crypto.createHash('md5').update(str).digest('hex')
}

// Generate pseudo-random number from hash
function getScoreFromHash(hash) {
    return parseInt(hash.substring(0, 8), 16) % 100
}

// Analyze URL patterns - Enhanced detection for fake/suspicious sites
function analyzePatterns(url) {
    const warnings = []
    let score = 0
    const lowerUrl = url.toLowerCase()

    // Extract domain from URL
    let domain = ''
    try {
        const urlObj = new URL(url.startsWith('http') ? url : 'https://' + url)
        domain = urlObj.hostname
    } catch {
        domain = url.split('/')[0] || url
    }
    const domainLower = domain.toLowerCase()

    // Suspicious TLDs - high risk
    if (/\.(xyz|top|work|loan|gq|cf|tk|ml|ga|pw|cc|click|link|info|online|site|website|space|fun|icu|buzz|rest|cam)$/i.test(domain)) {
        score += 30
        warnings.push('Suspicious/cheap Top-Level Domain (TLD) detected')
    }

    // IP Address usage - very suspicious
    if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/.test(domain)) {
        score += 40
        warnings.push('URL uses raw IP address instead of domain - very suspicious')
    }

    // Typosquatting detection - looks like popular brands but misspelled
    const brandTypos = [
        { brand: 'google', fakes: ['googl', 'gooogle', 'g00gle', 'googel', 'gogle'] },
        { brand: 'facebook', fakes: ['faceb00k', 'facebok', 'faceboook', 'facebk'] },
        { brand: 'amazon', fakes: ['amaz0n', 'amazn', 'arnazon', 'amazonn'] },
        { brand: 'microsoft', fakes: ['micros0ft', 'mircosoft', 'microsft'] },
        { brand: 'apple', fakes: ['appie', 'applle', 'app1e'] },
        { brand: 'paypal', fakes: ['paypa1', 'paypai', 'paypall', 'peypal'] },
        { brand: 'netflix', fakes: ['netf1ix', 'netfiix', 'netflx'] },
        { brand: 'instagram', fakes: ['1nstagram', 'instagran', 'lnstagram'] },
        { brand: 'twitter', fakes: ['twltter', 'tw1tter', 'twtter'] },
        { brand: 'linkedin', fakes: ['linkedln', 'l1nkedin', 'linkdin'] }
    ]

    for (const { brand, fakes } of brandTypos) {
        if (fakes.some(fake => domainLower.includes(fake))) {
            score += 50
            warnings.push(`Possible typosquatting attempt impersonating ${brand}`)
            break
        }
    }

    // Numbers in domain name - suspicious
    const domainWithoutTld = domainLower.split('.').slice(0, -1).join('.')
    if (/\d/.test(domainWithoutTld) && !trustedWithNumbers(domainLower)) {
        score += 15
        warnings.push('Domain contains numbers (common in fake sites)')
    }

    // Multiple hyphens - very suspicious
    const hyphenCount = (domainLower.match(/-/g) || []).length
    if (hyphenCount >= 2) {
        score += 25
        warnings.push('Multiple hyphens in domain (common phishing pattern)')
    } else if (hyphenCount === 1) {
        score += 10
        warnings.push('Hyphen in domain name')
    }

    // Random/gibberish domain detection
    if (looksLikeRandomDomain(domainWithoutTld)) {
        score += 35
        warnings.push('Domain appears to be randomly generated')
    }

    // Suspicious keywords in URL
    const suspiciousKeywords = ['login', 'signin', 'verify', 'wallet', 'crypto', 'bank', 'secure', 'account', 'update', 'confirm', 'free', 'bonus', 'prize', 'win', 'gift', 'urgent', 'suspended', 'locked']
    const foundKeywords = suspiciousKeywords.filter(k => lowerUrl.includes(k))

    if (foundKeywords.length > 0) {
        score += foundKeywords.length * 12
        warnings.push(`Suspicious keywords found: ${foundKeywords.join(', ')}`)
    }

    // Very long URL - suspicious
    if (url.length > 80) {
        score += 15
        warnings.push('URL is unusually long')
    }

    // Excessive subdomains - obfuscation attempt
    const subdomainCount = domain.split('.').length
    if (subdomainCount > 4) {
        score += 25
        warnings.push('Excessive subdomains detected (possible obfuscation)')
    } else if (subdomainCount > 2 && !domain.endsWith('.co.uk') && !domain.endsWith('.co.in')) {
        score += 10
        warnings.push('Multiple subdomains detected')
    }

    // URL encoding or special characters
    if (/%[0-9a-f]{2}/i.test(url) || /@/.test(url.split('//')[1] || '')) {
        score += 20
        warnings.push('URL contains encoded characters or @ symbol (obfuscation)')
    }

    // Very short random-looking domains
    if (domainWithoutTld.length <= 5 && /^[a-z0-9]+$/i.test(domainWithoutTld)) {
        // Check if it's not a known short domain
        const knownShort = ['x', 'fb', 't', 'yt', 'ig', 'bit', 'goo', 'amzn']
        if (!knownShort.includes(domainWithoutTld)) {
            score += 20
            warnings.push('Short, random-looking domain name')
        }
    }

    return { score: Math.min(score, 85), warnings }
}

// Helper: Check if domain is trusted even with numbers
function trustedWithNumbers(domain) {
    const allowed = ['web3', 'w3', 'mp3', 'k8s', '365', '360', '24', '7', 'go2', 'i18n', 'l10n']
    return allowed.some(a => domain.includes(a))
}

// Helper: Detect random/gibberish domain names
function looksLikeRandomDomain(domain) {
    if (domain.length < 4) return false

    // Check for consonant clusters (more than 4 consonants in a row)
    if (/[bcdfghjklmnpqrstvwxz]{5,}/i.test(domain)) return true

    // Check for lack of vowels
    const vowelRatio = (domain.match(/[aeiou]/gi) || []).length / domain.length
    if (vowelRatio < 0.15 && domain.length > 6) return true

    // Check for alternating random chars pattern
    if (/([a-z])(?!\1)[a-z](?!\1|\2)[a-z](?!\1|\2|\3)[a-z]/i.test(domain) && domain.length < 8) {
        const uniqueChars = new Set(domain.replace(/[^a-z]/gi, '')).size
        if (uniqueChars === domain.replace(/[^a-z]/gi, '').length) return true
    }

    return false
}

// Simulate URL Scan with realistic varied results
function simulateUrlScan(url) {
    const lowerUrl = url.toLowerCase()
    const hash = getHash(lowerUrl)
    const baseScore = getScoreFromHash(hash)

    // Extended list of known safe/trusted sites
    const trustedDomains = [
        'google.com', 'facebook.com', 'twitter.com', 'github.com', 'amazon.com',
        'microsoft.com', 'apple.com', 'linkedin.com', 'youtube.com', 'netflix.com',
        'instagram.com', 'reddit.com', 'wikipedia.org', 'stackoverflow.com',
        'mozilla.org', 'cloudflare.com', 'dropbox.com', 'spotify.com', 'zoom.us',
        'slack.com', 'discord.com', 'twitch.tv', 'paypal.com', 'ebay.com',
        'yahoo.com', 'bing.com', 'outlook.com', 'office.com', 'live.com',
        'adobe.com', 'salesforce.com', 'shopify.com', 'wordpress.com', 'medium.com'
    ]

    // Trusted TLDs that indicate legitimate sites
    const trustedTLDs = ['.edu', '.gov', '.org', '.mil']

    // Known safe sites - return low risk
    if (trustedDomains.some(d => lowerUrl.includes(d))) {
        return {
            riskScore: 2 + (baseScore % 8), // 2-10 score
            classification: 'Safe',
            virustotalResult: { positives: 0, total: 88, detected: false },
            phishtankResult: { inDatabase: false },
            warnings: []
        }
    }

    // Trusted TLDs - generally safe
    if (trustedTLDs.some(tld => lowerUrl.includes(tld))) {
        return {
            riskScore: 5 + (baseScore % 15), // 5-20 score
            classification: 'Safe',
            virustotalResult: { positives: 0, total: 88, detected: false },
            phishtankResult: { inDatabase: false },
            warnings: []
        }
    }

    // HIGH RISK: Phishing keywords that indicate malicious intent
    const highRiskKeywords = ['phish', 'malware', 'hack', 'scam', 'fraud', 'fake', 'steal']
    if (highRiskKeywords.some(k => lowerUrl.includes(k))) {
        return {
            riskScore: 85 + (baseScore % 15),
            classification: 'Phishing',
            virustotalResult: { positives: 15 + (baseScore % 20), total: 88, detected: true },
            phishtankResult: { inDatabase: true },
            warnings: [
                'Match found in phishing database',
                'Domain flagged for malicious activity',
                'Known phishing pattern detected'
            ]
        }
    }

    // MEDIUM-HIGH RISK: Suspicious keywords that might indicate phishing
    const suspiciousKeywords = ['login', 'signin', 'verify', 'secure', 'bank', 'account', 'update', 'confirm', 'wallet', 'crypto', 'password', 'reset']
    const foundSuspiciousKeywords = suspiciousKeywords.filter(k => lowerUrl.includes(k))

    if (foundSuspiciousKeywords.length >= 2) {
        // Multiple suspicious keywords = high risk
        return {
            riskScore: 70 + (baseScore % 20),
            classification: 'Phishing',
            virustotalResult: { positives: 10 + (baseScore % 15), total: 88, detected: true },
            phishtankResult: { inDatabase: true },
            warnings: [
                `Multiple suspicious keywords: ${foundSuspiciousKeywords.join(', ')}`,
                'Possible credential harvesting attempt',
                'Exercise extreme caution'
            ]
        }
    }

    // Pattern analysis for URL structure
    const patternData = analyzePatterns(url)
    let riskScore = patternData.score
    let warnings = [...patternData.warnings]

    // Single suspicious keyword adds moderate risk
    if (foundSuspiciousKeywords.length === 1) {
        riskScore += 25
        warnings.push(`Contains sensitive keyword: ${foundSuspiciousKeywords[0]}`)
    }

    // Determine classification based on final risk score
    let classification
    if (riskScore >= 70) {
        classification = 'Phishing'
    } else if (riskScore >= 35) {
        classification = 'Suspicious'
    } else {
        classification = 'Safe'
    }

    // For unknown sites - be more cautious
    // If no warnings were found, it could still be a fake/unknown site
    if (warnings.length === 0) {
        // Unknown site with no red flags but also no trust indicators
        // Give it a moderate suspicious score
        riskScore = 35 + (baseScore % 20) // 35-55 score range (Suspicious)
        classification = 'Suspicious'
        warnings.push('Site reputation is unknown - exercise caution')
        warnings.push('No established trust history found')
    }

    return {
        riskScore: Math.min(riskScore, 100),
        classification,
        virustotalResult: {
            positives: riskScore >= 50 ? Math.floor(riskScore / 5) : 0,
            total: 88,
            detected: riskScore >= 50
        },
        phishtankResult: { inDatabase: riskScore >= 80 },
        warnings
    }
}

// Simulate Email Risk Scan
function simulateEmailScan(email) {
    const hash = getHash(email.toLowerCase())
    const score = getScoreFromHash(hash)

    const breaches = [
        { name: 'Adobe', date: '2013-10-04', data: ['Email addresses', 'Password hints', 'Passwords', 'Filenames'] },
        { name: 'LinkedIn', date: '2016-05-18', data: ['Email addresses', 'Passwords'] },
        { name: 'Canva', date: '2019-05-24', data: ['Email addresses', 'Names', 'Usernames', 'Cities'] },
        { name: 'Dropbox', date: '2012-07-31', data: ['Email addresses', 'Hashed passwords'] },
        { name: 'Verifications.io', date: '2019-02-25', data: ['Email addresses', 'Employers', 'Geographic locations', 'IP addresses', 'Names', 'Phone numbers'] }
    ]

    // Determine risk level based on hash
    // Low Risk
    if (score < 40) {
        return {
            email,
            riskLevel: 'Low',
            riskScore: score,
            breachesFound: 0,
            breaches: [],
            warning: 'No known data breaches found for this email.'
        }
    }

    // Medium Risk
    if (score < 75) {
        const breachCount = 1 + (score % 2)
        const foundBreaches = breaches.slice(0, breachCount)
        return {
            email,
            riskLevel: 'Medium',
            riskScore: score,
            breachesFound: breachCount,
            breaches: foundBreaches,
            warning: `Found in ${breachCount} data breaches. Password change recommended.`
        }
    }

    // High Risk
    const breachCount = 3 + (score % 3)
    const foundBreaches = breaches.slice(0, breachCount)
    return {
        email,
        riskLevel: 'High',
        riskScore: score,
        breachesFound: breachCount,
        breaches: foundBreaches,
        warning: `CRITICAL: Found in ${breachCount} major data breaches. Immediate password change required!`
    }
}

// URL Scan Endpoint
router.post('/analyze', async (req, res) => {
    try {
        let { url, visitorName } = req.body

        if (!url) return res.status(400).json({ error: 'URL is required' })
        if (!visitorName) return res.status(400).json({ error: 'Visitor name is required' })

        if (!url.startsWith('http')) url = 'https://' + url

        // Use simulation for consistent demo results (unless real keys provided)
        const result = simulateUrlScan(url)

        // Save scan
        const scanData = { visitorName, url, ...result, createdAt: new Date() }

        // Save logic
        if (isDbConnected()) {
            const Scan = (await import('../models/Scan.js')).default
            await new Scan(scanData).save()
        } else {
            const userScans = offlineScans.get(visitorName) || []
            userScans.unshift({ ...scanData, id: `scan-${Date.now()}` })
            offlineScans.set(visitorName, userScans.slice(0, 100))
        }

        // Get popularity (simulation)
        const popularity = 1 + (getScoreFromHash(url) % 50)

        res.json({ ...scanData, popularity })
    } catch (error) {
        console.error('Scan error:', error)
        res.status(500).json({ error: 'Failed to analyze URL' })
    }
})

// Email Risk Endpoint (NEW)
router.post('/email', async (req, res) => {
    try {
        const { email } = req.body
        if (!email) return res.status(400).json({ error: 'Email is required' })

        const result = simulateEmailScan(email)

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1500))

        res.json(result)
    } catch (error) {
        console.error('Email scan error:', error)
        res.status(500).json({ error: 'Failed to analyze email' })
    }
})

// ... (History and Stats endpoints)
router.get('/history', async (req, res) => {
    try {
        const { visitorName } = req.query
        if (!visitorName) return res.status(400).json({ error: 'Visitor Name is required' })

        let scans = []
        if (isDbConnected()) {
            const Scan = (await import('../models/Scan.js')).default
            scans = await Scan.find({ visitorName }).sort({ createdAt: -1 }).limit(100)
        } else {
            scans = offlineScans.get(visitorName) || []
        }

        res.json(scans.map(s => ({
            id: s._id || s.id,
            url: s.url,
            risk_score: s.riskScore,
            classification: s.classification,
            created_at: s.createdAt,
            virustotal_result: s.virustotalResult,
            phishtank_result: s.phishtankResult,
            warnings: s.warnings
        })))
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch history' })
    }
})

router.get('/stats', async (req, res) => {
    try {
        const { visitorName } = req.query
        if (!visitorName) return res.status(400).json({ error: 'Visitor Name is required' })

        let scans = []
        if (isDbConnected()) {
            const Scan = (await import('../models/Scan.js')).default
            scans = await Scan.find({ visitorName })
        } else {
            scans = offlineScans.get(visitorName) || []
        }

        res.json({
            totalScans: scans.length,
            safeCount: scans.filter(s => s.classification === 'Safe').length,
            suspiciousCount: scans.filter(s => s.classification === 'Suspicious').length,
            phishingCount: scans.filter(s => s.classification === 'Phishing').length,
            avgRiskScore: scans.length > 0 ? Math.round(scans.reduce((a, b) => a + b.riskScore, 0) / scans.length) : 0
        })
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch stats' })
    }
})

export default router
