import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Landing from './pages/Landing'
import Dashboard from './pages/Dashboard'
import History from './pages/History'
import About from './pages/About'
import Navbar from './components/Navbar'

function AppContent() {
    const { visitorName, setVisitor } = useAuth()

    // If not verified (no name), show Landing page
    if (!visitorName) {
        return <Landing onVerified={setVisitor} />
    }

    return (
        <>
            <Navbar />
            <Routes>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/history" element={<History />} />
                <Route path="/about" element={<About />} />
                <Route path="*" element={<Navigate to="/dashboard" />} />
            </Routes>
        </>
    )
}

function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <AppContent />
            </AuthProvider>
        </BrowserRouter>
    )
}

export default App
