import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'
import dotenv from 'dotenv'

import scanRoutes from './routes/scan.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    credentials: true
}))
app.use(express.json())

// Routes
// app.use('/api/auth', authRoutes) // Auth disabled
app.use('/api/scan', scanRoutes)

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'PhishGuard API is running' })
})

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack)
    res.status(500).json({ error: 'Something went wrong!' })
})

// Connect to MongoDB and start server
const startServer = async () => {
    try {
        const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/phishguard'

        await mongoose.connect(mongoUri)
        console.log('✅ Connected to MongoDB')

        app.listen(PORT, () => {
            console.log(`🚀 Server running on http://localhost:${PORT}`)
        })
    } catch (error) {
        console.error('❌ MongoDB connection error:', error.message)
        console.log('⚠️  Running in offline mode (no database)')

        // Start server anyway for demo mode
        app.listen(PORT, () => {
            console.log(`🚀 Server running on http://localhost:${PORT} (offline mode)`)
        })
    }
}

startServer()
