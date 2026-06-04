const API_BASE_URL = 'https://library-api-lime.vercel.app/api';

const api = {
    getHeaders() {
        const token = localStorage.getItem('accessToken');
        return {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        };
    },

    async request(endpoint, options = {}) {
        const url = `${API_BASE_URL}${endpoint}`;
        try {
            const response = await fetch(url, {
                ...options,
                headers: {
                    ...this.getHeaders(),
                    ...options.headers
                }
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || data.error || 'Something went wrong');
            }
            return data;
        } catch (err) {
            console.error(`API Error (${endpoint}):`, err);
            throw err;
        }
    },

    auth: {
        login: (email, password) => api.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        }),
        register: (userData) => api.request('/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData)
        }),
        me: () => api.request('/auth/me')
    },

    books: {
        getAll: (params = '') => api.request(`/books${params}`),
        getById: (id) => api.request(`/books/${id}`),
        create: (bookData) => api.request('/books', {
            method: 'POST',
            body: JSON.stringify(bookData)
        }),
        update: (id, bookData) => api.request(`/books/${id}`, {
            method: 'PUT',
            body: JSON.stringify(bookData)
        }),
        delete: (id) => api.request(`/books/${id}`, {
            method: 'DELETE'
        }),
        getCategories: () => api.request('/books/categories')
    },

    loans: {
        borrow: (bookId, memberId, notes = 'Borrowed via Web App') => api.request('/loans/borrow', {
            method: 'POST',
            body: JSON.stringify({ bookId, memberId, notes })
        }),
        return: (loanId) => api.request(`/loans/${loanId}/return`, {
            method: 'PUT'
        }),
        getAll: () => api.request('/loans')
    },

    fines: {
        getAll: (status = '') => api.request(`/fines${status ? `?status=${status}` : ''}`),
        pay: (id, paymentMethod = 'Cash', notes = 'Payment from website') => api.request(`/fines/${id}/pay`, {
            method: 'PUT',
            body: JSON.stringify({ paymentMethod, notes })
        }),
        getStats: () => api.request('/fines/stats')
    },

    members: {
        getAll: () => api.request('/members'),
        getDashboard: () => api.request('/members/dashboard'),
        updateProfile: (profileData) => api.request('/members/profile', {
            method: 'PUT',
            body: JSON.stringify(profileData)
        })
    }
};

window.api = api;
