document.addEventListener('DOMContentLoaded', async () => {
    const navLinks = document.getElementById('nav-links');
    const booksGrid = document.getElementById('books-grid');
    const categoryFilter = document.getElementById('category-filter');
    const searchInput = document.getElementById('search-input');
    const searchBtn = document.getElementById('search-btn');

    // Update Navigation
    if (auth.isLoggedIn()) {
        const user = auth.getUser();
        navLinks.innerHTML = `
            <div style="text-align: right; margin-right: 1rem;">
                <div style="font-weight: 600; font-size: 0.875rem;">${user.name}</div>
                <div style="font-size: 0.75rem; color: var(--text-muted)">${user.role.toUpperCase()}</div>
            </div>
            <a href="pages/dashboard.html" class="btn btn-outline">Dashboard</a>
            <button onclick="auth.logout()" class="btn btn-primary">Logout</button>
        `;
    }

    // Load Categories
    try {
        const catRes = await api.books.getCategories();
        if (catRes.data) {
            catRes.data.forEach(cat => {
                const option = document.createElement('option');
                option.value = cat.category;
                option.textContent = cat.category;
                categoryFilter.appendChild(option);
            });
        }
    } catch (err) { console.error('Failed to load categories:', err); }

    // Load Books
    async function loadBooks(params = '') {
        booksGrid.innerHTML = '<div class="glass book-card" style="height: 400px; opacity: 0.3;"></div>'.repeat(3);
        
        try {
            const response = await api.books.getAll(params);
            const books = response.data && response.data.books ? response.data.books : response.data;
            
            booksGrid.innerHTML = '';
            if (!books || books.length === 0) {
                booksGrid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 4rem;"><h3>No books found. Try a different search.</h3></div>';
                return;
            }

            books.forEach(book => {
                const stock = book.availableCopies !== undefined ? book.availableCopies : (book.stock || 0);
                const card = document.createElement('div');
                card.className = 'glass book-card animate-fade';
                card.innerHTML = `
                    <span class="book-badge ${stock > 0 ? 'badge-available' : 'badge-unavailable'}">
                        ${stock > 0 ? 'Available (' + stock + ')' : 'Out of Stock'}
                    </span>
                    <h3 style="margin-bottom: 0.5rem; font-size: 1.25rem;">${book.title}</h3>
                    <p style="color: var(--text-muted); font-size: 0.875rem; margin-bottom: 1.5rem;">by ${book.author}</p>
                    
                    <div style="margin-bottom: 2rem; font-size: 0.875rem; color: var(--text-muted); display: flex; flex-direction: column; gap: 0.5rem;">
                        <span><i class="fa-solid fa-tag" style="width: 20px; color: var(--primary);"></i> ${book.category}</span>
                        <span><i class="fa-solid fa-barcode" style="width: 20px; color: var(--primary);"></i> ${book.isbn}</span>
                        <span><i class="fa-solid fa-map-location-dot" style="width: 20px; color: var(--primary);"></i> ${book.location || 'N/A'}</span>
                    </div>

                    <button class="btn btn-primary" style="width: 100%; margin-top: auto;" 
                            onclick="borrowBook('${book._id || book.id}')" ${stock === 0 ? 'disabled' : ''}>
                        ${stock > 0 ? 'Borrow Now' : 'Check Later'}
                    </button>
                `;
                booksGrid.appendChild(card);
            });
        } catch (err) {
            booksGrid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; color: var(--danger);">Error: ${err.message}</div>`;
        }
    }

    // Search Logic
    searchBtn.onclick = () => {
        const q = searchInput.value;
        const cat = categoryFilter.value;
        let params = '?';
        if (q) params += `search=${encodeURIComponent(q)}&`;
        if (cat) params += `category=${encodeURIComponent(cat)}&`;
        loadBooks(params);
    };

    categoryFilter.onchange = searchBtn.onclick;
    
    // Initial Load
    loadBooks();
});
