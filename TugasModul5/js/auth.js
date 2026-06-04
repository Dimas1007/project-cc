const auth = {
    setSession(token, user) {
        localStorage.setItem('accessToken', token);
        localStorage.setItem('user', JSON.stringify(user));
    },

    logout() {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        const isRoot = !window.location.pathname.includes('/pages/');
        window.location.href = isRoot ? 'index.html' : '../index.html';
    },

    getUser() {
        const user = localStorage.getItem('user');
        try {
            return user ? JSON.parse(user) : null;
        } catch (e) {
            return null;
        }
    },

    getToken() {
        return localStorage.getItem('accessToken');
    },

    isLoggedIn() {
        return !!this.getToken();
    },

    isAdmin() {
        const user = this.getUser();
        return user && user.role === 'admin';
    },

    isMember() {
        const user = this.getUser();
        return user && user.role === 'member';
    },

    checkAuth() {
        const page = this.getCurrentPage();
        const isPublicPage = ['index.html', 'register.html', 'login.html'].includes(page) || page === '';
        
        if (!this.isLoggedIn() && !isPublicPage) {
            const isRoot = !window.location.pathname.includes('/pages/');
            window.location.href = isRoot ? 'pages/login.html' : 'login.html';
        }
    },

    getCurrentPage() {
        const path = window.location.pathname;
        return path.split('/').pop();
    }
};

window.auth = auth;
auth.checkAuth();
