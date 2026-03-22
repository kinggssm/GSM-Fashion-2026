// assets/js/whatsapp.js
// Optional: can add a share product feature; for now simple

function shareProduct(product) {
    const message = `Nina nia ya kununua bidhaa: ${product.name} (Tsh ${product.price.toLocaleString()}/=) kutoka GSM Fashion 2026.`;
    window.open(`https://wa.me/255686835513?text=${encodeURIComponent(message)}`, '_blank');
}