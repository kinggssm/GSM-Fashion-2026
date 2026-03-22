// assets/js/main.js

// Global cart array
let cart = [];

// Load cart from localStorage
function loadCartFromStorage() {
    const saved = localStorage.getItem('gsmCart');
    if (saved) cart = JSON.parse(saved);
    else cart = [];
    updateCartCount();
}
function saveCartToStorage() {
    localStorage.setItem('gsmCart', JSON.stringify(cart));
    updateCartCount();
}

function updateCartCount() {
    const total = cart.reduce((sum, item) => sum + item.quantity, 0);
    document.querySelectorAll('#cart-count').forEach(el => el.textContent = total);
}

function addToCart(productId, category) {
    const product = findProductById(productId, category);
    if (!product) return;
    const existing = cart.find(i => i.id == productId && i.category === category);
    if (existing) {
        if (existing.quantity < 10) existing.quantity++;
        else return alert('Idadi ya bidhaa hii imefikia kiwango cha juu (10).');
    } else {
        cart.push({ id: productId, category, quantity: 1 });
    }
    saveCartToStorage();
    alert(`${product.name} imeongezwa kwenye rukwama!`);
}

function findProductById(id, category) {
    if (!products[category]) return null;
    return products[category].find(p => p.id == id);
}

// Load products for a specific category into a grid
function loadCategoryProducts(category) {
    const grid = document.getElementById('products-grid');
    if (!grid) return;
    const productList = products[category] || [];
    if (productList.length === 0) {
        grid.innerHTML = '<p class="col-span-full text-center text-gray-500">Hakuna bidhaa kwa sasa.</p>';
        return;
    }
    grid.innerHTML = productList.map(product => `
        <div class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition">
            <img src="${product.image}" alt="${product.name}" class="w-full h-48 object-cover">
            <div class="p-4">
                <h3 class="font-bold text-lg">${product.name}</h3>
                <p class="text-orange-500 font-semibold">Tsh ${product.price.toLocaleString()}/=</p>
                <button class="mt-2 w-full bg-orange-500 text-white py-2 rounded hover:bg-orange-600 transition add-to-cart-btn" data-id="${product.id}" data-category="${product.category}">Weka kwenye Rukwama</button>
            </div>
        </div>
    `).join('');

    // Attach event listeners to add-to-cart buttons
    document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = btn.getAttribute('data-id');
            const cat = btn.getAttribute('data-category');
            addToCart(id, cat);
        });
    });
}

// Load featured products on index page
function loadFeaturedProducts() {
    const grid = document.getElementById('featured-products-grid');
    if (!grid) return;
    // Take first 4 from men (or mix)
    const featured = products.men.slice(0, 4);
    grid.innerHTML = featured.map(product => `
        <div class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition">
            <img src="${product.image}" alt="${product.name}" class="w-full h-48 object-cover">
            <div class="p-4">
                <h3 class="font-bold text-lg">${product.name}</h3>
                <p class="text-orange-500 font-semibold">Tsh ${product.price.toLocaleString()}/=</p>
                <button class="mt-2 w-full bg-orange-500 text-white py-2 rounded hover:bg-orange-600 transition add-to-cart-btn" data-id="${product.id}" data-category="${product.category}">Weka kwenye Rukwama</button>
            </div>
        </div>
    `).join('');
    // Attach event listeners
    document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = btn.getAttribute('data-id');
            const cat = btn.getAttribute('data-category');
            addToCart(id, cat);
        });
    });
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadCartFromStorage();
    // mobile menu toggle (if needed)
    const menuBtn = document.getElementById('menu-btn');
    const nav = document.querySelector('nav');
    if (menuBtn && nav) {
        menuBtn.addEventListener('click', () => {
            nav.classList.toggle('hidden');
        });
    }
});