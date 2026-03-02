import { useState, useEffect } from 'react';

export const useAuth = () => {
    const [user, setUser] = useState<any>(null);
    const [isAdmin, setIsAdmin] = useState(false);

    const updateAuthState = () => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                const parsedUser = JSON.parse(storedUser);
                setUser(parsedUser);
                // Check if Str is '2' (Admin)
                // Also allowing for potential type mismatches (number vs string) just in case
                setIsAdmin(parsedUser.Str === '2' || parsedUser.Str === 2);
            } catch (error) {
                console.error("Failed to parse user from localStorage", error);
                setUser(null);
                setIsAdmin(false);
            }
        } else {
            setUser(null);
            setIsAdmin(false);
        }
    };

    useEffect(() => {
        // Initial load
        updateAuthState();

        // Listen for custom storage event (for same-window updates)
        const handleStorageChange = () => {
            updateAuthState();
        };

        window.addEventListener('auth-storage-change', handleStorageChange);

        return () => {
            window.removeEventListener('auth-storage-change', handleStorageChange);
        };
    }, []);

    return { user, isAdmin };
};
