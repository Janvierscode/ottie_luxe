"use strict";

/* ==========================================================
   OTTIE LUXE — EDIT THESE VALUES TO UPDATE BUSINESS DETAILS
   Use the international WhatsApp format with digits only.
   Example format: country code + number, without + or spaces.
   ========================================================== */
const SITE_CONFIG = Object.freeze({
    whatsappNumber: "+263785483168",
    phoneDisplay: "+263 78 548 3168",
    email: "ottieluxe@gmail.com",
    instagramUrl: "https://www.instagram.com/ottieluxe",
    instagramHandle: "ottieluxe",
    tiktokUrl: "",
    facebookUrl: "https://www.facebook.com/ottieluxe",
    serviceArea: "Zimbabwe — Harare",
    businessHours: "0700 - 1800",
    currency: "USD",
    locale: "en-ZW",
});

/* Product catalogue — add, remove or edit products here. */
const PRODUCTS = Object.freeze([
    {
        id: "signature-bloom",
        name: "Women's Signature Perfume",
        category: "perfumes",
        categoryLabel: "Perfume",
        price: 18,
        oldPrice: null,
        image: "https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=720&q=76",
        description: "A polished, feminine fragrance for confident everyday wear.",
        badge: "Popular",
        featured: true,
    },
    {
        id: "vanilla-cloud",
        name: "Sweet Vanilla Fragrance",
        category: "perfumes",
        categoryLabel: "Perfume",
        price: 15,
        oldPrice: 18,
        image: "https://images.unsplash.com/photo-1547887538-e3a2f32cb1cc?auto=format&fit=crop&w=720&q=76",
        description: "Warm, creamy and sweet—an easy scent for day or night.",
        badge: "Sale",
        featured: true,
    },
    {
        id: "floral-muse",
        name: "Floral Muse Perfume",
        category: "perfumes",
        categoryLabel: "Perfume",
        price: 17,
        oldPrice: null,
        image: "https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?auto=format&fit=crop&w=720&q=76",
        description: "A light floral scent with a soft, modern finish.",
        badge: "New",
        featured: true,
    },
    {
        id: "midnight-luxe",
        name: "Luxury Inspired Fragrance",
        category: "perfumes",
        categoryLabel: "Perfume",
        price: 22,
        oldPrice: null,
        image: "https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=720&q=76",
        description: "A deeper, sophisticated scent for evenings and occasions.",
        badge: "Popular",
        featured: true,
    },
    {
        id: "gold-drop-earrings",
        name: "Gold-Tone Drop Earrings",
        category: "earrings",
        categoryLabel: "Earrings",
        price: 8,
        oldPrice: null,
        image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=720&q=76",
        description: "Elegant statement earrings with an easy golden glow.",
        badge: "New",
        featured: true,
    },
    {
        id: "classic-hoops",
        name: "Classic Hoop Earrings",
        category: "earrings",
        categoryLabel: "Earrings",
        price: 6,
        oldPrice: 8,
        image: "https://images.unsplash.com/photo-1635767798638-3e25273a8236?auto=format&fit=crop&w=720&q=76",
        description: "A versatile everyday pair that works with every look.",
        badge: "Sale",
        featured: true,
    },
    {
        id: "delicate-necklace",
        name: "Elegant Layering Necklace",
        category: "necklaces",
        categoryLabel: "Necklace",
        price: 12,
        oldPrice: null,
        image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=720&q=76",
        description: "A delicate piece designed to shine alone or layered.",
        badge: "Popular",
        featured: true,
    },
    {
        id: "charm-bracelet",
        name: "Everyday Charm Bracelet",
        category: "bracelets",
        categoryLabel: "Bracelet",
        price: 10,
        oldPrice: null,
        image: "https://images.unsplash.com/photo-1611652022419-a9419f74343d?auto=format&fit=crop&w=720&q=76",
        description: "A playful polished bracelet for a touch of personality.",
        badge: "New",
        featured: true,
    },
    {
        id: "stacking-ring",
        name: "Minimal Fashion Ring",
        category: "rings",
        categoryLabel: "Ring",
        price: 7,
        oldPrice: null,
        image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=720&q=76",
        description: "A simple statement ring made for mixing and matching.",
        badge: "New",
        featured: false,
    },
    {
        id: "luxe-gift-set",
        name: "Jewellery & Perfume Gift Set",
        category: "gift-sets",
        categoryLabel: "Gift Set",
        price: 28,
        oldPrice: 33,
        image: "https://images.unsplash.com/photo-1602173574767-37ac01994b2a?auto=format&fit=crop&w=720&q=76",
        description: "A ready-to-delight pairing for celebrations and surprises.",
        badge: "Popular",
        featured: true,
    },
]);

const icons = {
    whatsapp: "icon-whatsapp",
    phone: "icon-phone",
    email: "icon-mail",
    instagram: "icon-instagram",
    tiktok: "icon-tiktok",
    facebook: "icon-facebook",
    location: "icon-map",
    hours: "icon-clock",
};

const state = {
    filter: "all",
    favourites: new Set(readFavourites()),
};

const productGrid = document.querySelector("#product-grid");
const arrivalsGrid = document.querySelector("#new-arrivals-grid");
const productCount = document.querySelector("#product-count");
const toast = document.querySelector("#toast");
let toastTimer;

function createIcon(iconName) {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("aria-hidden", "true");
    const use = document.createElementNS("http://www.w3.org/2000/svg", "use");
    use.setAttribute("href", `#${iconName}`);
    svg.append(use);
    return svg;
}

function formatPrice(value) {
    return new Intl.NumberFormat(SITE_CONFIG.locale, {
        style: "currency",
        currency: SITE_CONFIG.currency,
        maximumFractionDigits: 0,
    }).format(value);
}

function createProductCard(product, compact = false) {
    const article = document.createElement("article");
    article.className = "product-card";
    article.dataset.category = product.category;
    article.dataset.productId = product.id;

    const imageWrap = document.createElement("div");
    imageWrap.className = "product-card__image";
    const image = document.createElement("img");
    image.src = product.image;
    image.alt = `${product.name} from Ottie Luxe`;
    image.width = 620;
    image.height = 750;
    image.loading = "lazy";
    image.decoding = "async";
    image.addEventListener("error", () => {
        image.remove();
        imageWrap.classList.add("image-error");
    });
    imageWrap.append(image);

    if (product.badge) {
        const badge = document.createElement("span");
        badge.className = "product-card__badge";
        badge.dataset.badge = product.badge;
        badge.textContent = product.badge;
        imageWrap.append(badge);
    }

    const favourite = document.createElement("button");
    favourite.type = "button";
    favourite.className = "favourite-button";
    favourite.dataset.favouriteId = product.id;
    favourite.setAttribute("aria-label", `Save ${product.name} as a favourite`);
    favourite.setAttribute("aria-pressed", String(state.favourites.has(product.id)));
    if (state.favourites.has(product.id)) favourite.classList.add("is-favourite");
    favourite.append(createIcon("icon-heart"));
    imageWrap.append(favourite);

    const body = document.createElement("div");
    body.className = "product-card__body";
    const category = document.createElement("p");
    category.className = "product-card__category";
    category.textContent = product.categoryLabel;
    const name = document.createElement("h3");
    name.textContent = product.name;
    const description = document.createElement("p");
    description.className = "product-card__description";
    description.textContent = product.description;
    const price = document.createElement("p");
    price.className = "product-card__price";
    const currentPrice = document.createElement("span");
    currentPrice.textContent = formatPrice(product.price);
    price.append(currentPrice);
    if (product.oldPrice) {
        const oldPrice = document.createElement("span");
        oldPrice.className = "product-card__old-price";
        oldPrice.textContent = formatPrice(product.oldPrice);
        price.append(oldPrice);
    }

    const order = document.createElement("a");
    order.className = "button whatsapp-link";
    order.href = "#contact";
    order.dataset.message = `Hi Ottie Luxe, I'm interested in the ${product.name}. Is it still available?`;
    order.setAttribute("aria-label", `Order ${product.name} on WhatsApp`);
    order.append(createIcon("icon-whatsapp"), document.createTextNode(compact ? "Enquire" : "Order on WhatsApp"));

    body.append(category, name, description, price, order);
    article.append(imageWrap, body);
    return article;
}

function renderProducts(filter = "all") {
    const visibleProducts = PRODUCTS.filter((product) => {
        if (filter === "all") return true;
        if (filter === "jewellery") return ["earrings", "necklaces", "bracelets", "rings"].includes(product.category);
        return product.category === filter;
    });

    const fragment = document.createDocumentFragment();
    visibleProducts.forEach((product) => fragment.append(createProductCard(product)));
    productGrid.replaceChildren(fragment);
    productCount.textContent = `${visibleProducts.length} ${visibleProducts.length === 1 ? "piece" : "pieces"} in this edit`;
}

function renderNewArrivals() {
    const arrivals = PRODUCTS.filter((product) => product.badge === "New").slice(0, 4);
    const fragment = document.createDocumentFragment();
    arrivals.forEach((product) => fragment.append(createProductCard(product, true)));
    arrivalsGrid.replaceChildren(fragment);
}

function setFilter(filter) {
    state.filter = filter;
    document.querySelectorAll(".filter-button").forEach((button) => {
        const active = button.dataset.filter === filter;
        button.classList.toggle("is-active", active);
        button.setAttribute("aria-pressed", String(active));
    });
    renderProducts(filter);
}

function selectFilterAndScroll(filter) {
    setFilter(filter);
    document.querySelector("#shop")?.scrollIntoView({ behavior: preferredScrollBehavior(), block: "start" });
}

function preferredScrollBehavior() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
}

function readFavourites() {
    try {
        const saved = JSON.parse(localStorage.getItem("ottie-luxe-favourites") || "[]");
        return Array.isArray(saved) ? saved.filter((id) => typeof id === "string") : [];
    } catch {
        return [];
    }
}

function saveFavourites() {
    try {
        localStorage.setItem("ottie-luxe-favourites", JSON.stringify([...state.favourites]));
    } catch {
        // Favourites still work for the current visit when storage is unavailable.
    }
}

function toggleFavourite(button) {
    const id = button.dataset.favouriteId;
    const product = PRODUCTS.find((item) => item.id === id);
    if (!product) return;

    const isSaved = state.favourites.has(id);
    if (isSaved) state.favourites.delete(id);
    else state.favourites.add(id);
    saveFavourites();

    document.querySelectorAll(`[data-favourite-id="${CSS.escape(id)}"]`).forEach((matchingButton) => {
        matchingButton.classList.toggle("is-favourite", !isSaved);
        matchingButton.setAttribute("aria-pressed", String(!isSaved));
        matchingButton.setAttribute("aria-label", `${isSaved ? "Save" : "Remove"} ${product.name} ${isSaved ? "as" : "from"} favourites`);
    });
    showToast(isSaved ? `${product.name} removed from favourites.` : `${product.name} saved to favourites.`);
}

function cleanWhatsAppNumber(value) {
    return String(value || "").replace(/\D/g, "");
}

function openWhatsApp(message) {
    const number = cleanWhatsAppNumber(SITE_CONFIG.whatsappNumber);
    if (!number) {
        showToast("The Ottie Luxe WhatsApp number has not been added yet.");
        document.querySelector("#contact")?.scrollIntoView({ behavior: preferredScrollBehavior() });
        return;
    }
    const url = `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank", "noopener,noreferrer");
}

function showToast(message) {
    window.clearTimeout(toastTimer);
    toast.textContent = message;
    toast.classList.add("is-visible");
    toastTimer = window.setTimeout(() => toast.classList.remove("is-visible"), 3600);
}

function createContactItem(icon, label, value, href = "") {
    const item = document.createElement("li");
    item.className = "contact-item";
    const iconWrap = document.createElement("span");
    iconWrap.className = "contact-item__icon";
    iconWrap.append(createIcon(icons[icon]));
    const text = document.createElement("span");
    const small = document.createElement("small");
    small.textContent = label;
    const strong = document.createElement("strong");
    strong.textContent = value;
    text.append(small, strong);
    if (href) {
        const link = document.createElement("a");
        link.href = href;
        link.append(iconWrap, text);
        item.append(link);
    } else {
        item.append(iconWrap, text);
    }
    return item;
}

function renderContactDetails() {
    const list = document.querySelector("#contact-details");
    const phoneValue = SITE_CONFIG.phoneDisplay || "Add WhatsApp / phone number";
    const emailValue = SITE_CONFIG.email || "Add business email";
    const instagramValue = SITE_CONFIG.instagramHandle || "Add Instagram username";
    const phoneHref = SITE_CONFIG.phoneDisplay ? `tel:${SITE_CONFIG.phoneDisplay.replace(/[^+\d]/g, "")}` : "";
    const emailHref = SITE_CONFIG.email ? `mailto:${SITE_CONFIG.email}` : "";
    const instagramHref = SITE_CONFIG.instagramUrl || "";

    list.replaceChildren(
        createContactItem("phone", "Phone / WhatsApp", phoneValue, phoneHref),
        createContactItem("email", "Email", emailValue, emailHref),
        createContactItem("instagram", "Instagram", instagramValue, instagramHref),
        createContactItem("location", "Service area", SITE_CONFIG.serviceArea),
        createContactItem("hours", "Business hours", SITE_CONFIG.businessHours),
    );
}

function createSocialLink(icon, label, href) {
    const element = document.createElement(href ? "a" : "span");
    element.className = "social-link";
    element.append(createIcon(icons[icon]), document.createTextNode(label));
    if (href) {
        element.href = href;
        element.target = "_blank";
        element.rel = "noopener noreferrer";
    } else {
        element.setAttribute("aria-disabled", "true");
        element.title = `${label} link can be added in SITE_CONFIG`;
    }
    return element;
}

function renderSocialLinks() {
    const social = document.querySelector("#social-links");
    social.replaceChildren(
        createSocialLink("instagram", "Instagram", SITE_CONFIG.instagramUrl),
        createSocialLink("tiktok", "TikTok", SITE_CONFIG.tiktokUrl),
        createSocialLink("facebook", "Facebook", SITE_CONFIG.facebookUrl),
    );

    const footer = document.querySelector("#footer-connect");
    const items = [
        ["Instagram", SITE_CONFIG.instagramUrl],
        ["TikTok", SITE_CONFIG.tiktokUrl],
        ["Facebook", SITE_CONFIG.facebookUrl],
    ];
    const fragment = document.createDocumentFragment();
    items.forEach(([label, href]) => {
        const item = document.createElement("li");
        if (href) {
            const link = document.createElement("a");
            link.href = href;
            link.target = "_blank";
            link.rel = "noopener noreferrer";
            link.textContent = label;
            item.append(link);
        } else {
            const span = document.createElement("span");
            span.textContent = `${label} · add link`;
            item.append(span);
        }
        fragment.append(item);
    });
    footer.replaceChildren(fragment);
}

function setupMobileMenu() {
    const toggle = document.querySelector(".menu-toggle");
    const menu = document.querySelector("#mobile-menu");
    if (!toggle || !menu) return;

    function setMenu(open) {
        toggle.setAttribute("aria-expanded", String(open));
        toggle.setAttribute("aria-label", open ? "Close navigation menu" : "Open navigation menu");
        menu.hidden = !open;
        document.body.classList.toggle("menu-open", open);
    }

    toggle.addEventListener("click", () => setMenu(toggle.getAttribute("aria-expanded") !== "true"));
    menu.addEventListener("click", (event) => {
        if (event.target.closest("a")) setMenu(false);
    });
    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") {
            setMenu(false);
            toggle.focus();
        }
    });
    window.addEventListener("resize", () => {
        if (window.innerWidth >= 1024) setMenu(false);
    });
}

function setupScrollEffects() {
    const header = document.querySelector(".site-header");
    const backToTop = document.querySelector(".back-to-top");
    let ticking = false;

    function update() {
        const scrolled = window.scrollY > 30;
        header?.classList.toggle("is-scrolled", scrolled);
        if (backToTop) backToTop.hidden = window.scrollY < 700;
        ticking = false;
    }

    window.addEventListener("scroll", () => {
        if (!ticking) {
            window.requestAnimationFrame(update);
            ticking = true;
        }
    }, { passive: true });
    backToTop?.addEventListener("click", () => window.scrollTo({ top: 0, behavior: preferredScrollBehavior() }));
    update();
}

function handleDocumentClick(event) {
    const filterButton = event.target.closest(".filter-button");
    if (filterButton) {
        setFilter(filterButton.dataset.filter);
        return;
    }

    const filterLink = event.target.closest(".category-filter-link, .footer-filter");
    if (filterLink) {
        selectFilterAndScroll(filterLink.dataset.filter);
        return;
    }

    const favouriteButton = event.target.closest(".favourite-button");
    if (favouriteButton) {
        toggleFavourite(favouriteButton);
        return;
    }

    const whatsappLink = event.target.closest(".whatsapp-link");
    if (whatsappLink) {
        event.preventDefault();
        openWhatsApp(whatsappLink.dataset.message || "Hi Ottie Luxe, I'd like to make an enquiry.");
    }
}

function initialise() {
    document.querySelector("#current-year").textContent = String(new Date().getFullYear());
    renderProducts();
    renderNewArrivals();
    renderContactDetails();
    renderSocialLinks();
    setupMobileMenu();
    setupScrollEffects();
    document.addEventListener("click", handleDocumentClick);
}

initialise();
