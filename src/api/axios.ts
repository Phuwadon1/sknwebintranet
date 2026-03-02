import axios from 'axios';
import Swal from 'sweetalert2';

// Create a custom instance
const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || '/api', // Use environment variable or default
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request Interceptor: Attach Token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response Interceptor: Handle Global Errors (401/403)
api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response) {
            // If 401 Unauthorized or 403 Forbidden
            if (error.response.status === 401 || error.response.status === 403) {
                // Optional: Alert user
                /* Swal.fire({
                   title: 'Session Expired',
                   text: 'Please login again.',
                   icon: 'warning',
                   timer: 2000,
                   showConfirmButton: false
               }); */

                // Optional: Redirect to login or clear token? 
                // Let's keep it simple for now and just reject, allowing components to handle specific UI if needed, 
                // or we can adding a global redirect here if we had a way to access router.
                console.warn('Unauthorized access (401/403).');
            }
        }
        return Promise.reject(error);
    }
);

export default api;
