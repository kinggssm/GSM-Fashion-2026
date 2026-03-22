// assets/js/cart.js

async function loadCartItems() {
    const container = document.getElementById('cart-items-container');
    const emptyMessage = document.getElementById('empty-cart-message');
    const cartItems = JSON.parse(localStorage.getItem('gsmCart')) || [];

    if (cartItems.length === 0) {
        container.innerHTML = '';
        emptyMessage.classList.remove('hidden');
        document.getElementById('total-items').innerText = '0';
        document.getElementById('subtotal').innerText = 'Tsh 0/=';
        document.getElementById('total-amount').innerText = 'Tsh 0/=';
        return;
    }
    emptyMessage.classList.add('hidden');

    let subtotal = 0;
    let itemsHtml = '';

    for (let item of cartItems) {
        const product = findProductById(item.id, item.category);
        if (!product) continue;
        const itemTotal = product.price * item.quantity;
        subtotal += itemTotal;
        itemsHtml += `
            <div class="bg-white rounded-lg shadow-md p-4 flex flex-col sm:flex-row gap-4 items-center">
                <img src="${product.image}" alt="${product.name}" class="w-24 h-24 object-cover rounded">
                <div class="flex-1">
                    <h3 class="font-bold">${product.name}</h3>
                    <p class="text-gray-600 text-sm">${product.category === 'men' ? 'Wanaume' : product.category === 'women' ? 'Wanawake' : product.category}</p>
                    <p class="text-orange-500 font-semibold">Tsh ${product.price.toLocaleString()}/=</p>
                </div>
                <div class="flex items-center gap-2">
                    <button class="qty-minus bg-gray-200 w-8 h-8 rounded" data-id="${item.id}" data-category="${item.category}">-</button>
                    <span class="w-8 text-center">${item.quantity}</span>
                    <button class="qty-plus bg-gray-200 w-8 h-8 rounded" data-id="${item.id}" data-category="${item.category}">+</button>
                </div>
                <div class="font-bold">Tsh ${itemTotal.toLocaleString()}/=</div>
                <button class="remove-item text-red-500 hover:text-red-700" data-id="${item.id}" data-category="${item.category}">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
    }
    container.innerHTML = itemsHtml;

    const shipping = subtotal > 200000 ? 0 : 5000;
    const total = subtotal + shipping;

    document.getElementById('total-items').innerText = cartItems.length;
    document.getElementById('subtotal').innerText = `Tsh ${subtotal.toLocaleString()}/=`;
    document.getElementById('shipping').innerText = shipping === 0 ? 'Bure' : `Tsh ${shipping.toLocaleString()}/=`;
    document.getElementById('total-amount').innerText = `Tsh ${total.toLocaleString()}/=`;

    // Event listeners for quantity and remove
    document.querySelectorAll('.qty-minus').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.dataset.id;
            const cat = btn.dataset.category;
            changeQuantity(id, cat, -1);
        });
    });
    document.querySelectorAll('.qty-plus').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.dataset.id;
            const cat = btn.dataset.category;
            changeQuantity(id, cat, 1);
        });
    });
    document.querySelectorAll('.remove-item').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.dataset.id;
            const cat = btn.dataset.category;
            removeFromCart(id, cat);
        });
    });
}

function changeQuantity(id, category, delta) {
    let cart = JSON.parse(localStorage.getItem('gsmCart')) || [];
    const index = cart.findIndex(i => i.id == id && i.category === category);
    if (index !== -1) {
        let newQty = cart[index].quantity + delta;
        if (newQty < 1) newQty = 1;
        if (newQty > 10) newQty = 10;
        cart[index].quantity = newQty;
        localStorage.setItem('gsmCart', JSON.stringify(cart));
        loadCartItems();
        updateCartCount(); // from main.js
    }
}

function removeFromCart(id, category) {
    let cart = JSON.parse(localStorage.getItem('gsmCart')) || [];
    cart = cart.filter(i => !(i.id == id && i.category === category));
    localStorage.setItem('gsmCart', JSON.stringify(cart));
    loadCartItems();
    updateCartCount();
}

// Checkout via WhatsApp
document.getElementById('checkout-whatsapp')?.addEventListener('click', () => {
    const cart = JSON.parse(localStorage.getItem('gsmCart')) || [];
    if (cart.length === 0) return alert('Rukwama yako iko tupu.');

    let message = `*AGIZO KUTOKA GSM FASHION 2026*\n\n`;
    let subtotal = 0;
    cart.forEach(item => {
        const product = findProductById(item.id, item.category);
        if (product) {
            const itemTotal = product.price * item.quantity;
            subtotal += itemTotal;
            message += `- ${product.name} x${item.quantity} = Tsh ${itemTotal.toLocaleString()}/=\n`;
        }
    });
    const shipping = subtotal > 200000 ? 0 : 5000;
    const total = subtotal + shipping;
    message += `\nJumla: Tsh ${subtotal.toLocaleString()}/=`;
    message += `\nUsafirishaji: ${shipping === 0 ? 'Bure' : 'Tsh ' + shipping.toLocaleString() + '/='}`;
    message += `\nJumla Kuu: Tsh ${total.toLocaleString()}/=`;
    message += `\n\nAsante kwa kununua GSM Fashion 2026!`;

    window.open(`https://wa.me/255686835513?text=${encodeURIComponent(message)}`, '_blank');
});