// Neuroscape Imaging Core - Main JavaScript

// Global state management
const App = {
    theme: localStorage.getItem('theme') || 'dark',
    recentSearches: JSON.parse(localStorage.getItem('recentSearches') || '[]'),
    contentData: null,
    searchIndex: [],
    currentPage: 'home'
};

// Initialize app on DOM load
document.addEventListener('DOMContentLoaded', async () => {
    await initializeApp();
    setupEventListeners();
    setupKeyboardShortcuts();
    loadUserPreferences();
    initAnimations();
});

// Initialize application
async function initializeApp() {
    // Set initial theme
    document.documentElement.setAttribute('data-theme', App.theme);
    
    // Load content data
    await loadContentData();
    
    // Build search index
    buildSearchIndex();
    
    // Initialize components
    initializeSearch();
    initializeNavigation();
    initializeTooltips();
    
    // Show loading complete
    hideLoader();
}

// Load content data
async function loadContentData() {
    try {
        const response = await fetch('site_structure.json');
        App.contentData = await response.json();
    } catch (error) {
        console.error('Failed to load content data:', error);
        showToast('Failed to load site content', 'error');
    }
}

// Build search index for instant search
function buildSearchIndex() {
    if (!App.contentData) return;
    
    App.searchIndex = [];
    
    // Index all pages
    App.contentData.navigation.main_menu.forEach(category => {
        category.pages.forEach(page => {
            App.searchIndex.push({
                title: page.title,
                description: page.description,
                file: page.file,
                category: category.category,
                keywords: [
                    ...page.title.toLowerCase().split(' '),
                    ...page.description.toLowerCase().split(' ')
                ]
            });
        });
    });
}

// Setup event listeners
function setupEventListeners() {
    // Theme toggle
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }
    
    // Mobile menu toggle
    const menuToggle = document.getElementById('menuToggle');
    if (menuToggle) {
        menuToggle.addEventListener('click', toggleMobileMenu);
    }
    
    // Search functionality
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(handleSearch, 300));
        searchInput.addEventListener('focus', showRecentSearches);
        searchInput.addEventListener('blur', () => setTimeout(hideSearchResults, 200));
    }
    
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', handleSmoothScroll);
    });
    
    // Category card clicks
    document.querySelectorAll('.category-card').forEach(card => {
        card.addEventListener('click', handleCategoryClick);
    });
    
    // Accordion functionality
    document.querySelectorAll('.accordion-header').forEach(header => {
        header.addEventListener('click', toggleAccordion);
    });
    
    // Modal close buttons
    document.querySelectorAll('.modal-close, .modal-backdrop').forEach(element => {
        element.addEventListener('click', closeModal);
    });
}

// Keyboard shortcuts
function setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        // Ctrl/Cmd + K for search
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            focusSearch();
        }
        
        // Escape to close modals
        if (e.key === 'Escape') {
            closeAllModals();
        }
        
        // Ctrl/Cmd + / for help
        if ((e.ctrlKey || e.metaKey) && e.key === '/') {
            e.preventDefault();
            showHelpModal();
        }
        
        // Alt + T for theme toggle
        if (e.altKey && e.key === 't') {
            e.preventDefault();
            toggleTheme();
        }
    });
}

// Theme management
function toggleTheme() {
    App.theme = App.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', App.theme);
    localStorage.setItem('theme', App.theme);
    
    // Update theme toggle button
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.innerHTML = App.theme === 'dark' ? '☀️' : '🌙';
    }
    
    showToast(`Switched to ${App.theme} mode`, 'success');
}

// Search functionality
function initializeSearch() {
    const searchContainer = document.querySelector('.search-container');
    if (!searchContainer) return;
    
    // Create search results dropdown
    const resultsDiv = document.createElement('div');
    resultsDiv.className = 'search-results';
    resultsDiv.id = 'searchResults';
    searchContainer.appendChild(resultsDiv);
}

function handleSearch(e) {
    const query = e.target.value.toLowerCase().trim();
    
    if (query.length < 2) {
        hideSearchResults();
        return;
    }
    
    // Save to recent searches
    saveRecentSearch(query);
    
    // Search through index
    const results = App.searchIndex.filter(item => {
        return item.title.toLowerCase().includes(query) ||
               item.description.toLowerCase().includes(query) ||
               item.keywords.some(keyword => keyword.includes(query));
    });
    
    // Display results
    displaySearchResults(results.slice(0, 10));
}

function displaySearchResults(results) {
    const resultsDiv = document.getElementById('searchResults');
    if (!resultsDiv) return;
    
    if (results.length === 0) {
        resultsDiv.innerHTML = `
            <div class="search-result">
                <div class="search-result-title">No results found</div>
                <div class="search-result-description">Try different keywords or browse categories</div>
            </div>
        `;
    } else {
        resultsDiv.innerHTML = results.map(result => `
            <div class="search-result" onclick="navigateToPage('${result.file}')">
                <div class="search-result-title">${highlightText(result.title)}</div>
                <div class="search-result-description">${highlightText(result.description)}</div>
                <div class="search-result-category">${result.category}</div>
            </div>
        `).join('');
    }
    
    resultsDiv.classList.add('active');
}

function hideSearchResults() {
    const resultsDiv = document.getElementById('searchResults');
    if (resultsDiv) {
        resultsDiv.classList.remove('active');
    }
}

function highlightText(text) {
    const searchInput = document.getElementById('searchInput');
    if (!searchInput) return text;
    
    const query = searchInput.value.toLowerCase().trim();
    if (!query) return text;
    
    const regex = new RegExp(`(${query})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
}

function saveRecentSearch(query) {
    if (!App.recentSearches.includes(query)) {
        App.recentSearches.unshift(query);
        App.recentSearches = App.recentSearches.slice(0, 5);
        localStorage.setItem('recentSearches', JSON.stringify(App.recentSearches));
    }
}

function showRecentSearches() {
    if (App.recentSearches.length > 0 && !document.getElementById('searchInput').value) {
        const resultsDiv = document.getElementById('searchResults');
        if (resultsDiv) {
            resultsDiv.innerHTML = `
                <div class="recent-searches">
                    <div class="recent-searches-header">Recent Searches</div>
                    ${App.recentSearches.map(search => `
                        <div class="search-result" onclick="performSearch('${search}')">
                            <div class="search-result-title">${search}</div>
                        </div>
                    `).join('')}
                </div>
            `;
            resultsDiv.classList.add('active');
        }
    }
}

function performSearch(query) {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.value = query;
        handleSearch({ target: searchInput });
    }
}

function focusSearch() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.focus();
        searchInput.select();
    }
}

// Navigation
function initializeNavigation() {
    // Highlight active page
    const currentPath = window.location.pathname;
    document.querySelectorAll('.nav-link').forEach(link => {
        if (link.getAttribute('href') === currentPath) {
            link.classList.add('active');
        }
    });
    
    // Setup breadcrumbs
    updateBreadcrumbs();
}

function updateBreadcrumbs() {
    const breadcrumbsContainer = document.getElementById('breadcrumbs');
    if (!breadcrumbsContainer) return;
    
    const path = window.location.pathname.split('/').filter(Boolean);
    const breadcrumbs = ['Home'];
    
    path.forEach((segment, index) => {
        const name = segment.replace(/-/g, ' ').replace('.html', '');
        breadcrumbs.push(name.charAt(0).toUpperCase() + name.slice(1));
    });
    
    breadcrumbsContainer.innerHTML = breadcrumbs.map((crumb, index) => {
        const isLast = index === breadcrumbs.length - 1;
        return `
            <span class="breadcrumb-item ${isLast ? 'active' : ''}">
                ${isLast ? crumb : `<a href="#">${crumb}</a>`}
            </span>
            ${!isLast ? '<span class="breadcrumb-separator">›</span>' : ''}
        `;
    }).join('');
}

// Mobile menu
function toggleMobileMenu() {
    const mobileMenu = document.getElementById('mobileMenu');
    if (mobileMenu) {
        mobileMenu.classList.toggle('active');
        document.body.classList.toggle('menu-open');
    }
}

// Smooth scrolling
function handleSmoothScroll(e) {
    e.preventDefault();
    const targetId = e.currentTarget.getAttribute('href').substring(1);
    const targetElement = document.getElementById(targetId);
    
    if (targetElement) {
        const offset = 80; // Account for fixed header
        const targetPosition = targetElement.offsetTop - offset;
        
        window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
        });
    }
}

// Category handling
function handleCategoryClick(e) {
    const card = e.currentTarget;
    const category = card.dataset.category;
    
    if (category) {
        navigateToCategory(category);
    }
}

function navigateToCategory(category) {
    // Navigate to category page
    const categoryMap = {
        'equipment': 'equipment.html',
        'procedures': 'procedures.html',
        'troubleshooting': 'troubleshooting.html',
        'resources': 'resources.html'
    };
    
    const page = categoryMap[category];
    if (page) {
        window.location.href = page;
    }
}

function navigateToPage(file) {
    if (file) {
        window.location.href = file;
    }
}

// Accordion functionality
function toggleAccordion(e) {
    const accordion = e.currentTarget.parentElement;
    accordion.classList.toggle('active');
    
    // Close other accordions in the same group
    const group = accordion.parentElement;
    if (group.classList.contains('accordion-group')) {
        group.querySelectorAll('.accordion').forEach(item => {
            if (item !== accordion && item.classList.contains('active')) {
                item.classList.remove('active');
            }
        });
    }
}

// Modal functionality
function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
        document.body.classList.add('modal-open');
    }
}

function closeModal(e) {
    const modal = e.currentTarget.closest('.modal');
    if (modal) {
        modal.classList.remove('active');
        document.body.classList.remove('modal-open');
    }
}

function closeAllModals() {
    document.querySelectorAll('.modal.active').forEach(modal => {
        modal.classList.remove('active');
    });
    document.body.classList.remove('modal-open');
}

function showHelpModal() {
    // Create help modal if it doesn't exist
    if (!document.getElementById('helpModal')) {
        createHelpModal();
    }
    showModal('helpModal');
}

function createHelpModal() {
    const modal = document.createElement('div');
    modal.id = 'helpModal';
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-backdrop"></div>
        <div class="modal-content">
            <div class="modal-header">
                <h2 class="modal-title">Keyboard Shortcuts</h2>
                <button class="modal-close">×</button>
            </div>
            <div class="modal-body">
                <div class="shortcut-list">
                    <div class="shortcut-item">
                        <span class="shortcut-keys">Ctrl/Cmd + K</span>
                        <span class="shortcut-description">Focus search</span>
                    </div>
                    <div class="shortcut-item">
                        <span class="shortcut-keys">Alt + T</span>
                        <span class="shortcut-description">Toggle theme</span>
                    </div>
                    <div class="shortcut-item">
                        <span class="shortcut-keys">Ctrl/Cmd + /</span>
                        <span class="shortcut-description">Show this help</span>
                    </div>
                    <div class="shortcut-item">
                        <span class="shortcut-keys">Escape</span>
                        <span class="shortcut-description">Close modals</span>
                    </div>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

// Toast notifications
function showToast(message, type = 'info') {
    const toastContainer = document.getElementById('toastContainer') || createToastContainer();
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icons = {
        success: '✓',
        error: '✕',
        warning: '⚠',
        info: 'ℹ'
    };
    
    toast.innerHTML = `
        <span class="toast-icon">${icons[type]}</span>
        <span class="toast-message">${message}</span>
    `;
    
    toastContainer.appendChild(toast);
    
    // Trigger animation
    setTimeout(() => toast.classList.add('show'), 10);
    
    // Auto remove
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function createToastContainer() {
    const container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'toast-container';
    document.body.appendChild(container);
    return container;
}

// Progress tracking
function initProgressTracker(steps) {
    const tracker = document.getElementById('progressTracker');
    if (!tracker) return;
    
    tracker.innerHTML = `
        <div class="progress-steps">
            ${steps.map((step, index) => `
                <div class="progress-step ${index === 0 ? 'active' : ''}" data-step="${index}">
                    <div class="progress-circle">${index + 1}</div>
                    <div class="progress-label">${step}</div>
                </div>
            `).join('')}
        </div>
    `;
}

function updateProgress(stepIndex) {
    const steps = document.querySelectorAll('.progress-step');
    steps.forEach((step, index) => {
        if (index < stepIndex) {
            step.classList.add('completed');
            step.classList.remove('active');
        } else if (index === stepIndex) {
            step.classList.add('active');
            step.classList.remove('completed');
        } else {
            step.classList.remove('active', 'completed');
        }
    });
}

// Tooltips
function initializeTooltips() {
    document.querySelectorAll('[data-tooltip]').forEach(element => {
        element.addEventListener('mouseenter', showTooltip);
        element.addEventListener('mouseleave', hideTooltip);
    });
}

function showTooltip(e) {
    const element = e.currentTarget;
    const text = element.getAttribute('data-tooltip');
    
    const tooltip = document.createElement('div');
    tooltip.className = 'tooltip';
    tooltip.textContent = text;
    
    document.body.appendChild(tooltip);
    
    const rect = element.getBoundingClientRect();
    tooltip.style.top = `${rect.top - tooltip.offsetHeight - 10}px`;
    tooltip.style.left = `${rect.left + (rect.width - tooltip.offsetWidth) / 2}px`;
    
    element.tooltip = tooltip;
}

function hideTooltip(e) {
    const tooltip = e.currentTarget.tooltip;
    if (tooltip) {
        tooltip.remove();
        e.currentTarget.tooltip = null;
    }
}

// User preferences
function loadUserPreferences() {
    // Load theme (already done in init)
    
    // Load other preferences
    const preferences = JSON.parse(localStorage.getItem('userPreferences') || '{}');
    
    if (preferences.fontSize) {
        document.documentElement.style.fontSize = preferences.fontSize;
    }
    
    if (preferences.reducedMotion) {
        document.documentElement.classList.add('reduced-motion');
    }
}

function saveUserPreference(key, value) {
    const preferences = JSON.parse(localStorage.getItem('userPreferences') || '{}');
    preferences[key] = value;
    localStorage.setItem('userPreferences', JSON.stringify(preferences));
}

// Animations
function initAnimations() {
    // Intersection Observer for fade-in animations
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1
    });
    
    document.querySelectorAll('.animate-on-scroll').forEach(element => {
        observer.observe(element);
    });
}

// Loader
function showLoader() {
    const loader = document.getElementById('loader');
    if (loader) {
        loader.classList.add('active');
    }
}

function hideLoader() {
    const loader = document.getElementById('loader');
    if (loader) {
        loader.classList.remove('active');
        setTimeout(() => loader.remove(), 300);
    }
}

// Utility functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Print functionality
function initPrintStyles() {
    const printButton = document.getElementById('printButton');
    if (printButton) {
        printButton.addEventListener('click', () => {
            window.print();
        });
    }
}

// Copy to clipboard
function copyToClipboard(text) {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(() => {
            showToast('Copied to clipboard', 'success');
        }).catch(() => {
            showToast('Failed to copy', 'error');
        });
    } else {
        // Fallback for older browsers
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        showToast('Copied to clipboard', 'success');
    }
}

// Export functions for use in other scripts
window.NeuroscapeApp = {
    showToast,
    showModal,
    closeModal,
    updateProgress,
    copyToClipboard,
    navigateToPage,
    toggleTheme,
    showLoader,
    hideLoader
};