// Index.html BURGER MENU

const burger = document.getElementById('burger');
const nav = document.getElementById('header-nav');

// Ajouter un écouteur d'événement pour le clic sur le burger
burger.addEventListener('click', function() {
    nav.classList.toggle('ouvert');
});

// Fermer le menu lorsque l'utilisateur clique en dehors du menu ou du burger
document.addEventListener('click', function(event) {
    if (!nav.contains(event.target) && !burger.contains(event.target)) {    
        nav.classList.remove('ouvert');
    }
});


// Apparition du texte au scroll 
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    } else {
      entry.target.classList.remove('visible'); // sort de l'écran → disparition
    }
  });
});

const introContent = document.querySelector('.intro-content');
observer.observe(introContent);

