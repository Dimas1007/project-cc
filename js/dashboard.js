let dataCache = {
    books: null,
    members: null,
    lastUpdate: 0
};

// --- Utilities ---
async function fetchData(force = false) {
    const now = Date.now();
    if (!force && dataCache.books && dataCache.members && (now - dataCache.lastUpdate < 60000)) {
        return { books: dataCache.books, members: dataCache.members };
    }
    
    try {
        const [booksRes, membersRes] = await Promise.all([
            api.books.getAll(),
            api.members.getAll()
        ]);
        
        dataCache.books = booksRes.data?.books || booksRes.data || [];
        dataCache.members = membersRes.data?.members || membersRes.data || [];
        dataCache.lastUpdate = now;
        
        return { books: dataCache.books, members: dataCache.members };
    } catch (err) {
        console.error('Data fetch failed:', err);
        return { books: dataCache.books || [], members: dataCache.members || [] };
    }
}

function formatDate(dateStr) {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('en-GB', {
        day: '2-digit', month: 'short', year: 'numeric'
    });
}

// --- Views ---
const views = {
    overview: async () => {
        const user = auth.getUser();
        document.getElementById('view-title').textContent = `Welcome, ${user.name.split(' ')[0]}!`;
        document.getElementById('view-subtitle').textContent = "Here's what's happening in the library today.";
        
        const container = document.getElementById('dashboard-view-container');
        container.innerHTML = '<div style="text-align: center; padding: 3rem;"><i class="fa-solid fa-circle-notch fa-spin fa-2x"></i></div>';

        if (auth.isAdmin()) {
            try {
                const dashRes = await api.members.getDashboard();
                const stats = dashRes.data?.stats || dashRes.data || {};
                
                container.innerHTML = `
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1.5rem; margin-bottom: 2rem;">
                        <div class="glass stat-card">
                            <div class="stat-icon"><i class="fa-solid fa-book"></i></div>
                            <p style="color: var(--text-muted); font-size: 0.875rem;">Total Collection</p>
                            <h2 style="font-size: 2rem;">${stats.totalBooks || 0} <span style="font-size: 1rem; color: var(--text-muted); font-weight: 400;">Books</span></h2>
                        </div>
                        <div class="glass stat-card">
                            <div class="stat-icon" style="background: rgba(16, 185, 129, 0.1); color: var(--secondary);"><i class="fa-solid fa-handshake"></i></div>
                            <p style="color: var(--text-muted); font-size: 0.875rem;">Active Loans</p>
                            <h2 style="font-size: 2rem; color: var(--secondary);">${stats.activeLoans || 0} <span style="font-size: 1rem; color: var(--text-muted); font-weight: 400;">Active</span></h2>
                        </div>
                        <div class="glass stat-card">
                            <div class="stat-icon" style="background: rgba(245, 158, 11, 0.1); color: var(--accent);"><i class="fa-solid fa-users"></i></div>
                            <p style="color: var(--text-muted); font-size: 0.875rem;">Total Members</p>
                            <h2 style="font-size: 2rem;">${stats.totalMembers || 0}</h2>
                        </div>
                        <div class="glass stat-card">
                            <div class="stat-icon" style="background: rgba(239, 68, 68, 0.1); color: var(--danger);"><i class="fa-solid fa-clock"></i></div>
                            <p style="color: var(--text-muted); font-size: 0.875rem;">Overdue Items</p>
                            <h2 style="font-size: 2rem; color: var(--danger);">${stats.overdueLoans || 0}</h2>
                        </div>
                    </div>

                    <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 1.5rem;">
                        <div class="glass" style="padding: 2rem;">
                            <h3 style="margin-bottom: 1.5rem;">Financial Overview</h3>
                            <div style="display: flex; justify-content: space-between; align-items: center; padding: 1.5rem; background: rgba(255,255,255,0.03); border-radius: 1rem;">
                                <div>
                                    <p style="color: var(--text-muted); font-size: 0.875rem;">Unpaid Fines Total</p>
                                    <h2 style="color: var(--danger);">Rp ${(stats.unpaidFineAmount || 0).toLocaleString()}</h2>
                                </div>
                                <div style="text-align: right;">
                                    <p style="color: var(--text-muted); font-size: 0.875rem;">Pending from</p>
                                    <p style="font-weight: 700;">${stats.unpaidFineCount || 0} Members</p>
                                </div>
                            </div>
                            <button class="btn btn-outline" style="width: 100%; margin-top: 1.5rem;" onclick="switchView('manage-fines')">Manage All Fines</button>
                        </div>
                        <div class="glass" style="padding: 2rem; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center;">
                            <div class="stat-icon" style="width: 60px; height: 60px;"><i class="fa-solid fa-shield-check"></i></div>
                            <h3>Admin Access</h3>
                            <p style="color: var(--text-muted); font-size: 0.875rem; margin-top: 0.5rem;">You have full control over books, loans, and system members.</p>
                        </div>
                    </div>
                `;
            } catch (err) {
                container.innerHTML = `<div class="glass" style="padding: 2rem; text-align: center;"><h3>Welcome to Admin Dashboard</h3><p>${err.message}</p></div>`;
            }
        } else {
            // Member Overview
            container.innerHTML = `
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem;">
                    <div class="glass" style="padding: 2.5rem; text-align: center;">
                        <div class="stat-icon" style="margin-left: auto; margin-right: auto; width: 70px; height: 70px; font-size: 2rem;">
                            <i class="fa-solid fa-magnifying-glass"></i>
                        </div>
                        <h2 style="margin-bottom: 1rem;">Need something new?</h2>
                        <p style="color: var(--text-muted); margin-bottom: 2rem;">Browse our extensive collection of books across all genres.</p>
                        <a href="../index.html" class="btn btn-primary" style="width: 100%;">Browse Books</a>
                    </div>
                    <div class="glass" style="padding: 2.5rem; text-align: center;">
                        <div class="stat-icon" style="margin-left: auto; margin-right: auto; width: 70px; height: 70px; font-size: 2rem; background: rgba(16, 185, 129, 0.1); color: var(--secondary);">
                            <i class="fa-solid fa-bookmark"></i>
                        </div>
                        <h2 style="margin-bottom: 1rem;">Reading List</h2>
                        <p style="color: var(--text-muted); margin-bottom: 2rem;">Track your current loans and return dates to avoid fines.</p>
                        <button class="btn btn-outline" style="width: 100%;" onclick="switchView('my-loans')">View My Loans</button>
                    </div>
                </div>
            `;
        }
    },

    'manage-books': async () => {
        document.getElementById('view-title').textContent = 'Book Management';
        document.getElementById('header-actions').innerHTML = `
            <button class="btn btn-primary" onclick="openBookModal()">
                <i class="fa-solid fa-plus"></i> Add New Book
            </button>
        `;
        
        const container = document.getElementById('dashboard-view-container');
        container.innerHTML = '<div style="text-align: center; padding: 3rem;"><i class="fa-solid fa-circle-notch fa-spin fa-2x"></i></div>';
        
        try {
            const { books } = await fetchData(true);
            
            container.innerHTML = `
                <div class="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Book Title</th>
                                <th>Author</th>
                                <th>Category</th>
                                <th>Stock (Avail/Total)</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${books.map(book => `
                                <tr>
                                    <td>
                                        <div style="font-weight: 700; color: var(--text-main);">${book.title}</div>
                                        <div style="font-size: 0.75rem; color: var(--text-muted);">${book.isbn}</div>
                                    </td>
                                    <td>${book.author}</td>
                                    <td><span class="status-pill" style="background: rgba(99, 102, 241, 0.1); color: #a5b4fc;">${book.category}</span></td>
                                    <td>
                                        <span style="font-weight: 700;">${book.availableCopies !== undefined ? book.availableCopies : (book.stock || 0)}</span>
                                        <span style="color: var(--text-muted);">/ ${book.totalCopies || book.stock || 0}</span>
                                    </td>
                                    <td>
                                        <div style="display: flex; gap: 0.5rem;">
                                            <button class="btn btn-outline" style="padding: 0.5rem 0.75rem;" onclick="editBook('${book._id || book.id}')" title="Edit">
                                                <i class="fa-solid fa-pen-to-square"></i>
                                            </button>
                                            <button class="btn btn-outline" style="padding: 0.5rem 0.75rem; color: var(--danger); border-color: rgba(239, 68, 68, 0.2);" onclick="deleteBook('${book._id || book.id}')" title="Delete">
                                                <i class="fa-solid fa-trash-can"></i>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            `;
        } catch (err) { container.innerHTML = `<p style="color: var(--danger);">Error: ${err.message}</p>`; }
    },

    'my-loans': async () => {
        document.getElementById('view-title').textContent = 'My Borrowing';
        const container = document.getElementById('dashboard-view-container');
        container.innerHTML = '<div style="text-align: center; padding: 3rem;"><i class="fa-solid fa-circle-notch fa-spin fa-2x"></i></div>';
        
        try {
            const response = await api.loans.getAll();
            const loans = response.data?.loans || response.data || [];
            
            if (loans.length === 0) {
                container.innerHTML = '<div class="glass" style="padding: 4rem; text-align: center;"><h3>No borrowing history found.</h3><p style="margin-bottom: 2rem;">Start exploring books and borrow your first one!</p><a href="../index.html" class="btn btn-primary">Browse Now</a></div>';
                return;
            }

            container.innerHTML = `
                <div class="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Book Details</th>
                                <th>Borrowed On</th>
                                <th>Due Date</th>
                                <th>Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${loans.map(loan => {
                                const book = loan.book || {};
                                const isOverdue = new Date(loan.dueDate) < new Date() && loan.status === 'borrowed';
                                return `
                                <tr>
                                    <td>
                                        <div style="font-weight: 700;">${book.title || 'Unknown Book'}</div>
                                        <div style="font-size: 0.75rem; color: var(--text-muted);">${book.author || 'Unknown Author'}</div>
                                    </td>
                                    <td>${formatDate(loan.loanDate)}</td>
                                    <td style="color: ${isOverdue ? 'var(--danger)' : 'inherit'}; font-weight: ${isOverdue ? '700' : 'normal'};">
                                        ${formatDate(loan.dueDate)}
                                        ${isOverdue ? ' <i class="fa-solid fa-triangle-exclamation"></i>' : ''}
                                    </td>
                                    <td>
                                        <span class="status-pill" style="background: ${loan.status === 'borrowed' ? 'rgba(99, 102, 241, 0.15)' : 'rgba(16, 185, 129, 0.15)'}; color: ${loan.status === 'borrowed' ? '#818cf8' : '#34d399'};">
                                            ${loan.status}
                                        </span>
                                    </td>
                                    <td>
                                        ${loan.status === 'borrowed' ? `<button class="btn btn-primary" style="padding: 0.5rem 1rem; font-size: 0.8125rem;" onclick="returnBook('${loan._id}')">Return Book</button>` : '-'}
                                    </td>
                                </tr>
                            `}).join('')}
                        </tbody>
                    </table>
                </div>
            `;
        } catch (err) { container.innerHTML = `<p>Error: ${err.message}</p>`; }
    },

    'my-fines': async () => {
        document.getElementById('view-title').textContent = 'My Fines';
        const container = document.getElementById('dashboard-view-container');
        
        try {
            const response = await api.fines.getAll();
            const fines = response.data?.fines || response.data || [];
            
            if (fines.length === 0) {
                container.innerHTML = '<div class="glass" style="padding: 4rem; text-align: center;"><h3>No fines recorded. Good job!</h3><p>Keep returning books on time to maintain a clean record.</p></div>';
                return;
            }

            container.innerHTML = `
                <div class="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Reason / Note</th>
                                <th>Amount</th>
                                <th>Status</th>
                                <th>Created At</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${fines.map(fine => `
                                <tr>
                                    <td>
                                        <div style="font-weight: 600;">${fine.reason}</div>
                                        <div style="font-size: 0.75rem; color: var(--text-muted);">${fine.notes || 'No notes'}</div>
                                    </td>
                                    <td style="font-weight: 700; color: var(--danger);">Rp ${fine.amount.toLocaleString()}</td>
                                    <td>
                                        <span class="status-pill" style="background: ${fine.status === 'unpaid' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)'}; color: ${fine.status === 'unpaid' ? '#f87171' : '#34d399'};">
                                            ${fine.status}
                                        </span>
                                    </td>
                                    <td>${formatDate(fine.createdAt)}</td>
                                    <td>
                                        ${fine.status === 'unpaid' ? `<button class="btn btn-primary" style="padding: 0.5rem 1rem; font-size: 0.8125rem;" onclick="payFine('${fine._id}')">Pay Now</button>` : '<i class="fa-solid fa-circle-check" style="color: var(--secondary);"></i> Paid'}
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            `;
        } catch (err) { container.innerHTML = `<p>Error: ${err.message}</p>`; }
    },

    'all-loans': async () => {
        document.getElementById('view-title').textContent = 'Global Loan Tracking';
        const container = document.getElementById('dashboard-view-container');
        
        try {
            const response = await api.loans.getAll();
            const loans = response.data?.loans || response.data || [];
            
            const { books, members } = await fetchData();
            const bookMap = Object.fromEntries(books.map(b => [b._id || b.id, b]));
            const memberMap = Object.fromEntries(members.map(m => [m._id || m.id, m]));

            container.innerHTML = `
                <div class="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Book</th>
                                <th>Member</th>
                                <th>Status</th>
                                <th>Dates</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${loans.map(loan => {
                                const book = typeof loan.book === 'object' ? loan.book : bookMap[loan.book];
                                const member = typeof loan.member === 'object' ? loan.member : memberMap[loan.member];
                                return `
                                <tr>
                                    <td><div style="font-weight: 600;">${book?.title || 'Unknown'}</div></td>
                                    <td><div style="font-weight: 600;">${member?.name || 'Unknown'}</div><div style="font-size:0.75rem;color:var(--text-muted);">${member?.email || ''}</div></td>
                                    <td><span class="status-pill" style="background: ${loan.status === 'borrowed' ? 'rgba(99, 102, 241, 0.15)' : 'rgba(16, 185, 129, 0.15)'}; color: ${loan.status === 'borrowed' ? '#818cf8' : '#34d399'};">${loan.status}</span></td>
                                    <td>
                                        <div style="font-size: 0.75rem;">Borrowed: ${formatDate(loan.loanDate)}</div>
                                        <div style="font-size: 0.75rem; font-weight: 700;">Due: ${formatDate(loan.dueDate)}</div>
                                    </td>
                                </tr>
                            `}).join('')}
                        </tbody>
                    </table>
                </div>
            `;
        } catch (err) { container.innerHTML = `<p>Error: ${err.message}</p>`; }
    },

    'manage-fines': async () => {
        document.getElementById('view-title').textContent = 'System Fines';
        const container = document.getElementById('dashboard-view-container');
        
        try {
            const response = await api.fines.getAll();
            const fines = response.data?.fines || response.data || [];
            const { members } = await fetchData();
            const memberMap = Object.fromEntries(members.map(m => [m._id || m.id, m]));

            container.innerHTML = `
                <div class="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Member</th>
                                <th>Amount</th>
                                <th>Reason</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${fines.map(fine => {
                                const member = typeof fine.member === 'object' ? fine.member : memberMap[fine.member];
                                return `
                                <tr>
                                    <td><div style="font-weight: 600;">${member?.name || 'Unknown'}</div></td>
                                    <td style="font-weight: 700;">Rp ${fine.amount.toLocaleString()}</td>
                                    <td>${fine.reason}</td>
                                    <td><span class="status-pill" style="background: ${fine.status === 'unpaid' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)'}; color: ${fine.status === 'unpaid' ? '#f87171' : '#34d399'};">${fine.status}</span></td>
                                </tr>
                            `}).join('')}
                        </tbody>
                    </table>
                </div>
            `;
        } catch (err) { container.innerHTML = `<p>Error: ${err.message}</p>`; }
    },

    'members': async () => {
        document.getElementById('view-title').textContent = 'Member Directory';
        const container = document.getElementById('dashboard-view-container');
        
        try {
            const { members } = await fetchData(true);
            
            container.innerHTML = `
                <div class="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Full Name</th>
                                <th>Contact Information</th>
                                <th>Account Role</th>
                                <th>Joined Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${members.map(m => `
                                <tr>
                                    <td><div style="font-weight: 700;">${m.name}</div><div style="font-size:0.75rem;color:var(--text-muted);">${m.address || ''}</div></td>
                                    <td><div>${m.email}</div><div style="font-size:0.8125rem;color:var(--text-muted);">${m.phone || ''}</div></td>
                                    <td><span class="status-pill" style="background: rgba(255,255,255,0.05); color: var(--text-main);">${m.role}</span></td>
                                    <td>${formatDate(m.createdAt)}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            `;
        } catch (err) { container.innerHTML = `<p>Error: ${err.message}</p>`; }
    }
};

// --- View Controller ---
async function switchView(viewName) {
    // UI Update
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    const activeLink = document.querySelector(`[data-view="${viewName}"]`);
    if (activeLink) activeLink.classList.add('active');
    
    document.getElementById('header-actions').innerHTML = '';
    document.getElementById('view-subtitle').textContent = 'Manage your library activities here.';
    
    if (views[viewName]) {
        await views[viewName]();
    } else {
        document.getElementById('dashboard-view-container').innerHTML = `<div class="glass" style="padding: 4rem; text-align: center;"><h3>Section "${viewName}" is under development.</h3></div>`;
    }
}

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    const user = auth.getUser();
    if (!user) return; // Should be handled by checkAuth
    
    document.getElementById('user-name').textContent = user.name;
    document.getElementById('user-role').textContent = user.role;
    document.getElementById('user-info').querySelector('div').textContent = user.name.charAt(0).toUpperCase();

    if (auth.isAdmin()) {
        document.getElementById('admin-nav').style.display = 'block';
    } else {
        document.getElementById('member-nav').style.display = 'block';
    }
    
    // Initial View
    switchView('overview');
    
    // Handle Navigation Clicks
    document.querySelectorAll('.nav-link').forEach(link => {
        link.onclick = (e) => {
            e.preventDefault();
            switchView(link.dataset.view);
        };
    });
});

// --- CRUD Actions ---

function openBookModal(book = null) {
    const modal = document.getElementById('book-modal');
    const title = document.getElementById('modal-title');
    const form = document.getElementById('book-form');
    
    if (book) {
        title.textContent = 'Update Book Information';
        document.getElementById('book-id').value = book._id || book.id;
        document.getElementById('book-title').value = book.title;
        document.getElementById('book-author').value = book.author;
        document.getElementById('book-category').value = book.category;
        document.getElementById('book-stock').value = book.totalCopies || book.stock;
        document.getElementById('book-isbn').value = book.isbn;
        document.getElementById('book-publisher').value = book.publisher || '';
        document.getElementById('book-year').value = book.publishYear || '';
        document.getElementById('book-pages').value = book.pages || '';
        document.getElementById('book-location').value = book.location || '';
        document.getElementById('book-desc').value = book.description || '';
    } else {
        title.textContent = 'Add New Collection Item';
        form.reset();
        document.getElementById('book-id').value = '';
    }
    
    modal.style.display = 'flex';
}

function closeModal() {
    document.getElementById('book-modal').style.display = 'none';
}

document.getElementById('book-form').onsubmit = async (e) => {
    e.preventDefault();
    const id = document.getElementById('book-id').value;
    const btn = e.target.querySelector('button[type="submit"]');
    
    const data = {
        title: document.getElementById('book-title').value,
        author: document.getElementById('book-author').value,
        category: document.getElementById('book-category').value,
        totalCopies: parseInt(document.getElementById('book-stock').value),
        isbn: document.getElementById('book-isbn').value,
        publisher: document.getElementById('book-publisher').value,
        publishYear: parseInt(document.getElementById('book-year').value),
        pages: parseInt(document.getElementById('book-pages').value),
        location: document.getElementById('book-location').value,
        description: document.getElementById('book-desc').value
    };

    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Saving...';

    try {
        if (id) {
            await api.books.update(id, data);
        } else {
            await api.books.create(data);
        }
        closeModal();
        switchView('manage-books');
    } catch (err) { 
        alert(err.message); 
        btn.disabled = false;
        btn.innerHTML = 'Save Book Data';
    }
};

async function editBook(id) {
    try {
        const res = await api.books.getById(id);
        openBookModal(res.data?.book || res.data);
    } catch (err) { alert('Failed to load book: ' + err.message); }
}

async function deleteBook(id) {
    if (!confirm('Are you sure? This action will permanently remove the book from the system.')) return;
    try {
        await api.books.delete(id);
        switchView('manage-books');
    } catch (err) { alert(err.message); }
}

async function returnBook(loanId) {
    if (!confirm('Return this book now?')) return;
    try {
        const res = await api.loans.return(loanId);
        alert(res.message || 'Book returned successfully!');
        switchView('my-loans');
    } catch (err) { alert(err.message); }
}

async function payFine(fineId) {
    if (!confirm('Proceed with payment?')) return;
    try {
        await api.fines.pay(fineId);
        alert('Payment confirmed! Your record is updated.');
        switchView('my-fines');
    } catch (err) { alert(err.message); }
}
