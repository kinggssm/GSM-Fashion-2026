// assets/js/main.js
function loadFeaturedProducts() {
    const grid = document.getElementById('featured-products-grid');
    if (!grid) return;
    // Sample products (tunachukua kutoka products.js)
    const featured = products.men.slice(0, 4); // example
    grid.innerHTML = featured.map(p => `
        <div class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition">
            <img src="${p.image}" alt="${p.name}" class="w-full h-48 object-cover">
            <div class="p-4">
                <h3 class="font-bold text-lg">${p.name}</h3>
                <p class="text-orange-500 font-semibold">Tsh ${p.price.toLocaleString()}/=</p>
                <button class="mt-2 w-full bg-orange-500 text-white py-2 rounded hover:bg-orange-600 transition" data-id="${p.id}" data-category="${p.category}">Weka kwenye Rukwama</button>
            </div>
        </div>
    `).join('');
}