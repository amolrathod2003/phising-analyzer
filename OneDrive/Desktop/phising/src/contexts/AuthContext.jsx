import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext({})

export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }) {
    const [visitorName, setVisitorName] = useState(() => {
        return sessionStorage.getItem('visitorName') || null
    })

    // Simple "login" by setting name
    const setVisitor = (name) => {
        sessionStorage.setItem('verified', 'true')
        sessionStorage.setItem('visitorName', name)
        setVisitorName(name)
    }

    const logout = () => {
        sessionStorage.removeItem('verified')
        sessionStorage.removeItem('visitorName')
        setVisitorName(null)
    }

    const value = {
        visitorName,
        setVisitor,
        logout
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}
