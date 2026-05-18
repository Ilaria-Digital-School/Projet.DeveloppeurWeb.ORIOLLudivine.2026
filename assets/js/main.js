// ================================
// MENU BURGER
// ================================

const burger = document.getElementById('burger');
const nav = document.getElementById('header-nav');

burger.addEventListener('click', function() {
    const ouvert = nav.classList.toggle('ouvert');
    burger.classList.toggle('actif');
    
    // Accessibilité : met à jour aria-expanded
    burger.setAttribute('aria-expanded', ouvert);
    burger.setAttribute('aria-label', ouvert ? 'Fermer le menu' : 'Ouvrir le menu');
});