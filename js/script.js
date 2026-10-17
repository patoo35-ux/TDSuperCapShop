

// GESTION DU THEME AVEC BOUTON A DROITE
//const themeToggleBtn = document.getElementById('theme-toggle');

// 1. Sélection du bouton
const themeToggleBtn = document.getElementById('theme-toggle');

// 2. Récupération du thème sauvegardé ou détection de la préférence système
const savedTheme = localStorage.getItem('theme');
const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)');

// Détermination du thème initial
let currentTheme = savedTheme || (systemPrefersDark.matches ? 'dark' : 'light');

// Applique le thème à la racine du document (<html class="dark">) et met à jour le bouton
function applyTheme(theme) {
    if (theme === 'dark') {
        document.documentElement.classList.add('dark');
        if (themeToggleBtn) themeToggleBtn.textContent = '☀️';
    } else {
        document.documentElement.classList.remove('dark');
        if (themeToggleBtn) themeToggleBtn.textContent = '🌙';
    }
}

// Application au chargement
applyTheme(currentTheme);

// 3. Écouteur d'événement sur le bouton
if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
        const isDark = document.documentElement.classList.contains('dark');
        currentTheme = isDark ? 'light' : 'dark';
        
        applyTheme(currentTheme);
        localStorage.setItem('theme', currentTheme);
    });
}

// 4. Adaptation automatique si l'utilisateur n'a pas forcé de thème
systemPrefersDark.addEventListener('change', (e) => {
    if (!localStorage.getItem('theme')) {
        currentTheme = e.matches ? 'dark' : 'light';
        applyTheme(currentTheme);
    }
});

// Clé de stockage dans localStorage
const STORAGE_KEY_CART = 'super_cap_cart';

// Sélection des éléments du DOM
const addButtons = document.querySelectorAll("[data-add]");
const clearBtn = document.getElementById("clear-cart-btn") || document.querySelector("[data-clear]");
const filterForm = document.getElementById("filter-form");

// Écouteurs d'événements
addButtons.forEach(btn => {
    btn.addEventListener('click', () => addToCart(btn.dataset.add, 1));
});

if (clearBtn) {
    clearBtn.addEventListener('click', () => {
        state.cart.clear();
        saveCart();
        renderCart();
    });
}

if (filterForm) {
    filterForm.addEventListener('submit', e => {
        e.preventDefault();
        applyFilters();
    });
}


// Sauvegarde le panier dans le localStorage
function saveCart() {
    // Transformation du Map en tableau pour la sérialisation JSON
    const cartEntries = Array.from(state.cart.entries());
    localStorage.setItem(STORAGE_KEY_CART, JSON.stringify(cartEntries));
}


const filters = document.forms.categories;

const state = {
    cart: new Map(),
    // On extrait la valeur (.value) de chaque input
    categories: new Set(
        Array.from(filters.elements.category || []).map(input => input.value)
    )
};

filters.addEventListener('submit', e => {
    e.preventDefault(); // Annule le rechargement de la page
    
});


// Récupérer l'élément Html du formulaire
filters.addEventListener('submit', e=> {
    e.preventDefault(
        renderCatalogue ()
    )
})

filters.elements.category.forEach(input => input.addEventListener('change', applyFilters));

//
function applyFilters(e) {
    if(e.target.value === 'all') {
        if (e.target.checked) {
          filters.elements.category.forEach(input => input.checked = true);  
        } else {
            filters.elements.category.forEach(input = input.ckecked = falsel)
        } 
    } else {
        filters.elements.category[0].checked = false
    }
    if (Array.from(filters.elements.category).filter(boxe => boxe.checked).length === filters.elements.category.length -1)
        filters.elements.category.forEach(input => input.checked = true)
    }
    state.categories = new Set (
        [...filters.elements.category]
        .filter(c => c.checke)
        .map(c => c.value)
    )
    

function renderCatalogue {

    const articles = document.querySelectorAll ('.product-list li');
    articles.forEach(a => {
        if (!state.categories.has(a.firstElementChild.dataset.category)) {
            a.hidden = true
        }
    })
} 

// Charge le panier depuis le localStorage au démarrage
function loadCart() {
    const savedCart = localStorage.getItem(STORAGE_KEY_CART);
    if (savedCart) {
        try {
            const parsedEntries = JSON.parse(savedCart);
            // Reconstitution du Map à partir des données parsées
            state.cart = new Map(parsedEntries);
        } catch (e) {
            console.error("Erreur lors du chargement du panier depuis localStorage :", e);
            state.cart = new Map();
        }
    }
}


// Ajoute un article ou augmente sa quantité dans le panier
function addToCart(id, qty = 1) {
    const article = document.querySelector(`[data-id="${id}"]`);
    if (!article) return;

    const cartArticle = state.cart.get(id);
    const price = parseFloat(article.dataset.price);

    state.cart.set(id, cartArticle 
        ? { ...cartArticle, qty: cartArticle.qty + qty }
        : { ...article.dataset, price, qty }
    );

    saveCart();
    renderCart();

    // Fait défiler l'écran de manière fluide vers la section panier
    const cartSection = document.getElementById('cart');
    if (cartSection) {
        cartSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

// Filtre le catalogue en fonction des catégories cochées
function applyFilters() {
    const checkedCategories = Array.from(
        filterForm.querySelectorAll('input[name="category"]:checked')
    ).map(input => input.value.toLowerCase());

    const products = document.querySelectorAll('#catalogue .product-list > li');

    products.forEach(li => {
        const article = li.querySelector('article');
        const category = article.dataset.category.toLowerCase();

        if (checkedCategories.includes('all') || checkedCategories.includes(category)) {
            li.style.display = "";
        } else {
            li.style.display = "none";
        }
    });
}

// Met à jour l'affichage de l'interface du panier
function renderCart() {
    const cartCount = document.querySelector('[data-cart-count]');
    const cartPrice = document.querySelector('[data-cart-price]');
    const emptyMsg = document.querySelector('[data-cart-empty]');
    const list = document.querySelector('[data-cart-items]');

    // Calcul du nombre total d'articles et du prix total
    const { count, total } = Array.from(state.cart.values()).reduce((acc, item) => ({
        count: acc.count + item.qty,
        total: acc.total + (item.price * item.qty)
    }), { count: 0, total: 0 });

    if (cartCount) cartCount.textContent = count;
    if (cartPrice) cartPrice.textContent = total.toFixed(2);

    // Visibilité du message "Panier vide" et du bouton "Vider"
    if (emptyMsg && clearBtn) {
        if (count > 0) {
            emptyMsg.style.display = "none";
            clearBtn.style.display = "inline-block";
        } else {
            emptyMsg.style.display = "block";
            clearBtn.style.display = "none";
        }
    }

    if (!list) return;
    list.textContent = "";

    state.cart.forEach((values, key) => {
        const item = document.createElement('li');

        const h3 = document.createElement('h3');
        h3.textContent = values.name;

        const spanQty = document.createElement('span');
        spanQty.textContent = `Quantité : ${values.qty}`;

        const spanPrice = document.createElement('span');
        spanPrice.textContent = `${(values.qty * values.price).toFixed(2)} €`;

        const actionControls = document.createElement('div');
        actionControls.className = "cart-actions";

        // Bouton Diminuer [-]
        const decreaseBtn = document.createElement('button');
        decreaseBtn.className = "button button-qty";
        decreaseBtn.textContent = '-';
        decreaseBtn.setAttribute('aria-label', `Diminuer la quantité de ${values.name}`);
        decreaseBtn.addEventListener('click', () => {
            const element = state.cart.get(key);
            element.qty--;
            if (element.qty <= 0) {
                state.cart.delete(key);
            }
            saveCart();
            renderCart();
        });

        // Bouton Augmenter [+]
        const increaseBtn = document.createElement('button');
        increaseBtn.className = "button button-qty";
        increaseBtn.textContent = '+';
        increaseBtn.setAttribute('aria-label', `Augmenter la quantité de ${values.name}`);
        increaseBtn.addEventListener('click', () => {
            addToCart(key, 1);
        });

        // Bouton Supprimer [🗑️]
        const removeBtn = document.createElement('button');
        removeBtn.className = "button button-remove";
        removeBtn.innerHTML = '🗑️';
        removeBtn.setAttribute('aria-label', `Supprimer ${values.name} du panier`);
        removeBtn.addEventListener('click', () => {
            state.cart.delete(key);
            saveCart();
            renderCart();
        });

        actionControls.append(decreaseBtn, increaseBtn, removeBtn);
        item.append(h3, spanQty, spanPrice, actionControls);
        list.append(item);
    });
}

// Initialisation au chargement de la page
loadCart();
renderCart();