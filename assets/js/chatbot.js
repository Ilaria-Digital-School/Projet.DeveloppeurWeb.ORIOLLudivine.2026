// ================================
//  Pâtissons — Chatbot simulé
//  Bloc 1 : pas d'API, réponses pré-écrites
// ================================

const FAQ = [
  {
    mots_cles: ["blancs", "neige", "monter", "meringue"],
    reponse: "Pour monter des blancs en neige, vos œufs doivent être à température ambiante et le bol parfaitement propre et sec. Commencez à vitesse lente, puis augmentez progressivement. Quelques gouttes de jus de citron aident à les stabiliser au besoin. ✨"
  },
  {
    mots_cles: ["beurre", "remplacer", "substitut", "alternative"],
    reponse: "Pour remplacer le beurre dans une pâte de l'huile de coco en même quantité, compote de pommes (moitié de la quantité pour les gâteaux moelleux)."
  },
  {
    mots_cles: ["ganache", "tranché", "séparé", "rattraper", "huile"],
    reponse: "Une ganache tranchée se rattrape facilement ! Réchauffez-la doucement au bain-marie en remuant sans cesse, ou ajoutez une cuillère de crème chaude progressivement tout en mixant. Si elle est trop froide, c'est souvent la cause — la chaleur règle tout. 🍫"
  },
  {
    mots_cles: ["chantilly", "crème", "fouetter", "monter"],
    reponse: "Pour une chantilly réussie : la crème doit être très froide (minimum 30% de matière grasse), le bol et les fouets aussi. Fouettez à vitesse moyenne, pas maximum — vous la contrôlez mieux. Arrêtez dès qu'elle tient en bec d'oiseau, sinon elle vire au beurre ! 🍦"
  },
  {
    mots_cles: ["pâte", "sablée", "friable", "casser", "tarte"],
    reponse: "Une pâte sablée qui se casse trop : elle manque probablement de liant (œuf) ou a été trop travaillée. Ajoutez quelques gouttes d'eau froide, fraisez-la doucement et laissez-la reposer au frais 30 min avant d'étaler. Ne la pétrissez jamais longtemps ! 🥧"
  },
  {
    mots_cles: ["levure", "bicarbonate", "différence", "levant"],
    reponse: "La levure chimique agit à la chaleur (au four), le bicarbonate réagit à l'acidité (buttermilk, citron, yaourt). On peut remplacer 1 c.à.c de levure par 1/4 de bicarbonate + un ingrédient acide. Dans la plupart des gâteaux, c'est la levure chimique qu'il faut. 🧁"
  },
  {
    mots_cles: ["caramel", "cristallisé", "raté", "dur", "granuleux"],
    reponse: "Un caramel qui cristallise : ne remuez jamais le sucre pendant la cuisson ! Ajoutez quelques gouttes de jus de citron au départ pour éviter la cristallisation. Si ça arrive quand même, ajoutez un peu d'eau et refaites chauffer doucement — il se dissoudra. 🍯"
  },
  {
    mots_cles: ["chocolat", "tempérer", "tempérage", "brillant", "croquant"],
    reponse: "Le tempérage donne au chocolat son brillant et son croquant. Faites fondre à 50°C, refroidissez à 27°C sur marbre ou en ajoutant du chocolat râpé, puis remontez à 31-32°C pour le chocolat noir. C'est une question de cristallisation du beurre de cacao. 🍫"
  },
  {
    mots_cles: ["gélatine", "agar", "feuille", "gélifier", "prise"],
    reponse: "1 feuille de gélatine (2g) gélifie environ 200ml de liquide. Réhydratez-la 5 min dans l'eau froide, essorez-la et incorporez-la dans un liquide chaud (pas bouillant). Pour remplacer par de l'agar-agar : 2g d'agar pour 500ml, mais il doit bouillir pour agir. 🌿"
  },
  {
    mots_cles: ["bonjour", "salut", "hello", "aide", "question"],
    reponse: "Bonjour et bienvenue sur Pâtissons ! Je suis ici pour répondre à toutes vos questions de pâtisserie — techniques, substitutions, rattrapage de recettes… Posez-moi votre question ! 👨‍🍳"
  }
];

const REPONSE_DEFAUT = "Je ne suis pas sûr de pouvoir répondre à cette question précise. Pour une aide plus complète, la version complète de Pâtissons avec intelligence artificielle sera bientôt disponible ! En attendant, parcourez nos recettes pour trouver des conseils. 🎂";

// Cherche la meilleure réponse selon les mots-clés
function trouverReponse(question) {
  const q = question.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  
  for (const faq of FAQ) {
    for (const mot of faq.mots_cles) {
      const motNorm = mot.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      if (q.includes(motNorm)) {
        return faq.reponse;
      }
    }
  }
  return REPONSE_DEFAUT;
}

// ================================
//  Construction du chatbot
// ================================

function initChatbot() {
  // Injection du HTML du chatbot dans le body
  const html = `
    <button id="chat-bubble" aria-label="Ouvrir le chat pâtisserie" onclick="toggleChat()">
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
    </button>

    <div id="chat-container" role="dialog" aria-label="Assistant pâtisserie Pâtissons" aria-hidden="true">
      <div class="chat-window">

        <div class="chat-header">
          <div class="chat-avatar">P</div>
          <div class="chat-header-info">
            <div class="chat-header-name">Le Chef Pâtissons</div>
            <div class="chat-header-status">● Toujours au fourneaux, prêt à vous conseiller !</div>
          </div>
          <button class="chat-close" onclick="toggleChat()" aria-label="Fermer le chat">✕</button>
        </div>

        <div class="chat-messages" id="chat-messages"></div>

        <div class="chat-suggestions" id="chat-suggestions">
          <button class="suggestion-btn" onclick="envoyerSuggestion(this)">Comment monter des blancs en neige ?</button>
          <button class="suggestion-btn" onclick="envoyerSuggestion(this)">Ma ganache a tranché, que faire ?</button>
          <button class="suggestion-btn" onclick="envoyerSuggestion(this)">Remplacer le beurre ?</button>
        </div>

        <div class="chat-footer">
          <input
            class="chat-input"
            id="chat-input"
            type="text"
            placeholder="Posez votre question…"
            aria-label="Votre question pâtisserie"
            onkeydown="if(event.key==='Enter') envoyerMessage()"
          >
          <button class="chat-send" onclick="envoyerMessage()" aria-label="Envoyer">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
          </button>
        </div>

      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', html);

  // Message de bienvenue
  ajouterMessage("Bonjour ! Je suis le Chef Pâtissons 👨‍🍳 Posez-moi vos questions sur la pâtisserie !", "bot");
}

// Ouvre/ferme la fenêtre de chat
function toggleChat() {
  const container = document.getElementById('chat-container');
  const bubble = document.getElementById('chat-bubble');
  const ouvert = container.classList.toggle('ouvert');
  container.setAttribute('aria-hidden', !ouvert);
  bubble.classList.toggle('actif', ouvert);

  if (ouvert) {
    document.getElementById('chat-input').focus();
  }
}

// Ajoute un message dans la fenêtre
function ajouterMessage(texte, qui) {
  const messages = document.getElementById('chat-messages');
  const div = document.createElement('div');
  div.className = 'chat-msg ' + qui;

  if (qui === 'bot') {
    div.innerHTML = `<div class="chat-msg-avatar">P</div><div class="chat-msg-bulle">${texte}</div>`;
  } else {
    div.innerHTML = `<div class="chat-msg-bulle">${texte}</div>`;
  }

  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
}

// Affiche l'animation de frappe
function afficherTyping() {
  const messages = document.getElementById('chat-messages');
  const div = document.createElement('div');
  div.className = 'chat-msg bot';
  div.id = 'chat-typing';
  div.innerHTML = `
    <div class="chat-msg-avatar">P</div>
    <div class="chat-msg-bulle">
      <span class="typing-dot"></span>
      <span class="typing-dot"></span>
      <span class="typing-dot"></span>
    </div>`;
  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
}

function supprimerTyping() {
  const t = document.getElementById('chat-typing');
  if (t) t.remove();
}

// Envoie le message de l'utilisateur
function envoyerMessage() {
  const input = document.getElementById('chat-input');
  const texte = input.value.trim();
  if (!texte) return;

  // Cache les suggestions après le premier message
  document.getElementById('chat-suggestions').style.display = 'none';

  ajouterMessage(texte, 'user');
  input.value = '';
  afficherTyping();

  // Simule un délai de réflexion (600ms)
  setTimeout(() => {
    supprimerTyping();
    ajouterMessage(trouverReponse(texte), 'bot');
  }, 600);
}

function envoyerSuggestion(btn) {
  document.getElementById('chat-input').value = btn.textContent;
  envoyerMessage();
}

// Lance le chatbot au chargement de la page
document.addEventListener('DOMContentLoaded', initChatbot);
