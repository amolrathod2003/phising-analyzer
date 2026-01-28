const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

// API request helper
async function apiRequest(endpoint, options = {}) {
    const config = {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
    }

    const response = await fetch(`${API_URL}${endpoint}`, config)
    const data = await response.json()

    if (!response.ok) {
        throw new Error(data.error || 'Request failed')
    }

    return data
}

// Scan API
export const scanApi = {
    async analyzeUrl(url, visitorName) {
        return await apiRequest('/scan/analyze', {
            method: 'POST',
            body: JSON.stringify({ url, visitorName }),
        })
    },

    async analyzeEmail(email) {
        return await apiRequest('/scan/email', {
            method: 'POST',
            body: JSON.stringify({ email }),
        })
    },

    async getHistory(visitorName) {
        return await apiRequest(`/scan/history?visitorName=${encodeURIComponent(visitorName)}`)
    },

    async getStats(visitorName) {
        return await apiRequest(`/scan/stats?visitorName=${encodeURIComponent(visitorName)}`)
    },
}
