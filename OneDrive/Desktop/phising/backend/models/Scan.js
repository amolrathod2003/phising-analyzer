import mongoose from 'mongoose'

const scanSchema = new mongoose.Schema({
    visitorName: {
        type: String,
        required: true,
        index: true
    },
    url: {
        type: String,
        required: true
    },
    riskScore: {
        type: Number,
        required: true,
        min: 0,
        max: 100
    },
    classification: {
        type: String,
        required: true,
        enum: ['Safe', 'Suspicious', 'Phishing']
    },
    virustotalResult: {
        positives: { type: Number, default: 0 },
        total: { type: Number, default: 0 },
        detected: { type: Boolean, default: false }
    },
    phishtankResult: {
        inDatabase: { type: Boolean, default: false }
    },
    warnings: [{
        type: String
    }],
    scanCount: {
        type: Number,
        default: 1
    },
    createdAt: {
        type: Date,
        default: Date.now,
        index: true
    }
})

// Index for efficient queries
scanSchema.index({ visitorName: 1, createdAt: -1 })
scanSchema.index({ url: 1 })

export default mongoose.model('Scan', scanSchema)
