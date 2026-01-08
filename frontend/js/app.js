/**
 * The Daily Aesthetic - Main Application
 * Client-side routing, infinite scroll, modal system
 */

import api from './api.js';
import { escapeHtml, $, $$, appendHTML, formatDataFromDB } from './utils.js';
import { createCardFromData, batchCreateCards, createDropCard, batchCreateDropCards } from './components.js';

/* ================================================================
   App State
================================================================= */
const app = $("#app");
const currentDateEl = $("#current-date");

const state = {
  view: "home",
  archiveIndex: 0,
  shopIndex: 0,
  blogIndex: 0,
  dropsIndex: 0,
  dropNumber: 100, // Start numbering from 100 (can be any number)
  isLoading: false,
  io: null,
  scrollObserver: null,
  prefersReducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  filters: {
    archive: {},
    shop: {},
    blog: {},
    drops: {}
  },
  latestDrop: null
};

/* ================================================================
   View templates
================================================================= */
function renderHome() {
  // Render hero section with latest drop
  return `
    <div class="drop-hero">
      <div class="drop-hero__background">
        <img
          src="https://picsum.photos/seed/hero-drop/1920/1080"
          alt="Latest Drop Background"
          loading="eager"
        />
      </div>

      <div class="drop-hero__content">
        <div class="drop-hero__eyebrow">Latest Drop • Live Now</div>
        <h1 class="drop-hero__title">Exclusive Collection</h1>
        <p class="drop-hero__description">
          Discover our latest curated drop. Limited quantities available.
          Each piece tells a story of craftsmanship and design excellence.
        </p>

        <div class="drop-hero__cta-group">
          <button class="drop-hero__cta" data-route="drops">View All Drops</button>
          <button class="drop-hero__cta secondary" data-route="archive">Browse Archive</button>
        </div>
      </div>
    </div>

    <!-- Latest Drop Preview -->
    <div class="py-16 px-6 md:px-16" style="background-color: var(--bg-primary);">
      <div class="max-w-6xl mx-auto">
        <div class="flex justify-between items-center mb-12">
          <div>
            <h2 class="text-3xl md:text-5xl font-bold mb-4" style="color: var(--text-primary); letter-spacing: -0.03em;">
              Recent Drops
            </h2>
            <p class="text-base" style="color: var(--text-secondary);">
              Explore our latest releases in reverse chronological order
            </p>
          </div>
          <button
            data-route="drops"
            class="px-6 py-3 text-sm font-semibold tracking-wide hover:opacity-70 transition-opacity"
            style="color: var(--text-primary);"
          >
            View All →
          </button>
        </div>

        <div id="home-drops-preview"></div>
      </div>
    </div>
  `;
}

function renderDrops() {
  return `
    <div class="w-full min-h-screen" style="background-color: var(--bg-primary);">
      <!-- Header -->
      <div class="py-16 px-8 md:px-16" style="background-color: var(--bg-card); border-bottom: 1px solid var(--border-subtle);">
        <div class="max-w-6xl mx-auto">
          <h2 class="text-4xl md:text-6xl font-semibold mb-6" style="color: var(--text-primary); letter-spacing: -0.03em;">
            All Drops
          </h2>
          <p class="max-w-xl mb-10 leading-relaxed" style="color: var(--text-secondary);">
            A reverse-chronological archive of our exclusive releases. Each drop represents a carefully curated selection of design excellence.
          </p>

          <!-- Filter Controls -->
          <div class="flex flex-col md:flex-row gap-4 max-w-3xl">
            <div class="flex-grow relative">
              <input
                type="text"
                id="drops-search"
                placeholder="Search drops..."
                class="w-full px-5 py-4 text-sm transition-all"
                style="background-color: var(--bg-elevated); border: 1px solid var(--border-light); border-radius: var(--radius-md); color: var(--text-primary);"
              />
              <i data-lucide="search" class="w-4 h-4 absolute right-4 top-1/2 -translate-y-1/2" style="color: var(--text-tertiary);"></i>
            </div>

            <select
              id="drops-status"
              class="px-5 py-4 text-sm md:w-48 transition-all"
              style="background-color: var(--bg-elevated); border: 1px solid var(--border-light); border-radius: var(--radius-md); color: var(--text-primary);"
            >
              <option value="">All Status</option>
              <option value="live">Live Now</option>
              <option value="upcoming">Coming Soon</option>
              <option value="sold-out">Sold Out</option>
              <option value="limited">Limited Edition</option>
            </select>

            <button
              id="drops-clear"
              class="px-8 py-4 text-xs font-medium tracking-wide transition-all"
              style="background-color: var(--accent-primary); color: var(--text-inverse); border-radius: var(--radius-md);"
            >
              CLEAR
            </button>
          </div>
        </div>
      </div>

      <!-- Drops Feed -->
      <div id="drops-feed" class="py-12 px-6 md:px-16"></div>

      <!-- Loader -->
      <div class="loader" data-loader>
        <span class="inline-block w-2 h-2 rounded-full animate-bounce mr-1" style="background-color: var(--text-tertiary);"></span>
        <span class="inline-block w-2 h-2 rounded-full animate-bounce mr-1 delay-75" style="background-color: var(--text-tertiary);"></span>
        <span class="inline-block w-2 h-2 rounded-full animate-bounce delay-150" style="background-color: var(--text-tertiary);"></span>
      </div>
      <div data-sentinel class="h-10"></div>
    </div>
  `;
}

function renderArchive() {
  return `
    <div class="w-full min-h-screen">
      <div class="py-16 px-8 md:px-16" style="background-color: var(--bg-card); border-bottom: 1px solid var(--border-subtle);">
        <h2 class="text-4xl md:text-6xl font-semibold mb-6" style="color: var(--text-primary); letter-spacing: -0.03em;">The Archive</h2>
        <p class="max-w-xl mb-10 leading-relaxed" style="color: var(--text-secondary);">
          A curated collection of past works, preserving the dialogue between space, form, and light.
        </p>
        <div class="flex flex-col md:flex-row gap-4 max-w-3xl">
          <div class="flex-grow relative">
            <input
              type="text"
              id="archive-search"
              placeholder="Search projects..."
              class="w-full px-5 py-4 text-sm transition-all"
              style="background-color: var(--bg-elevated); border: 1px solid var(--border-light); border-radius: var(--radius-md); color: var(--text-primary);"
            />
            <i data-lucide="search" class="w-4 h-4 absolute right-4 top-1/2 -translate-y-1/2" style="color: var(--text-tertiary);"></i>
          </div>
          <input
            type="text"
            id="archive-tag"
            placeholder="Filter by tag..."
            class="px-5 py-4 text-sm md:w-48 transition-all"
            style="background-color: var(--bg-elevated); border: 1px solid var(--border-light); border-radius: var(--radius-md); color: var(--text-primary);"
          />
          <button
            id="archive-clear"
            class="px-8 py-4 text-xs font-medium tracking-wide transition-all"
            style="background-color: var(--accent-primary); color: var(--text-inverse); border-radius: var(--radius-md);"
          >
            CLEAR
          </button>
        </div>
      </div>

      <div id="archive-grid" class="masonry-grid"></div>

      <!-- sentinel used by IntersectionObserver -->
      <div class="loader" data-loader>
        <span class="inline-block w-2 h-2 rounded-full animate-bounce mr-1" style="background-color: var(--text-tertiary);"></span>
        <span class="inline-block w-2 h-2 rounded-full animate-bounce mr-1 delay-75" style="background-color: var(--text-tertiary);"></span>
        <span class="inline-block w-2 h-2 rounded-full animate-bounce delay-150" style="background-color: var(--text-tertiary);"></span>
      </div>
      <div data-sentinel class="h-10"></div>
    </div>
  `;
}

function renderShop() {
  return `
    <div class="w-full min-h-screen">
      <div class="py-16 px-8 md:px-16" style="background-color: var(--bg-card); border-bottom: 1px solid var(--border-subtle);">
        <div class="flex flex-col md:flex-row justify-between md:items-end gap-6 mb-10">
          <div>
            <h2 class="text-4xl md:text-6xl font-semibold mb-6" style="color: var(--text-primary); letter-spacing: -0.03em;">The Shop</h2>
            <p class="max-w-xl leading-relaxed" style="color: var(--text-secondary);">Curated objects of utility and beauty for the modern minimalist.</p>
          </div>
          <div class="flex items-center space-x-2 text-sm font-medium tracking-wide pb-2" style="color: var(--text-tertiary);">
            <i data-lucide="shopping-bag" class="w-4 h-4"></i>
            <span>CART (0)</span>
          </div>
        </div>
        <div class="flex flex-col md:flex-row gap-4 max-w-4xl">
          <div class="flex-grow relative">
            <input
              type="text"
              id="shop-search"
              placeholder="Search products..."
              class="w-full px-5 py-4 text-sm transition-all"
              style="background-color: var(--bg-elevated); border: 1px solid var(--border-light); border-radius: var(--radius-md); color: var(--text-primary);"
            />
            <i data-lucide="search" class="w-4 h-4 absolute right-4 top-1/2 -translate-y-1/2" style="color: var(--text-tertiary);"></i>
          </div>
          <input
            type="text"
            id="shop-tag"
            placeholder="Filter by tag..."
            class="px-5 py-4 text-sm md:w-40 transition-all"
            style="background-color: var(--bg-elevated); border: 1px solid var(--border-light); border-radius: var(--radius-md); color: var(--text-primary);"
          />
          <input
            type="number"
            id="shop-min-price"
            placeholder="Min $"
            class="px-5 py-4 text-sm md:w-28 transition-all"
            style="background-color: var(--bg-elevated); border: 1px solid var(--border-light); border-radius: var(--radius-md); color: var(--text-primary);"
          />
          <input
            type="number"
            id="shop-max-price"
            placeholder="Max $"
            class="px-5 py-4 text-sm md:w-28 transition-all"
            style="background-color: var(--bg-elevated); border: 1px solid var(--border-light); border-radius: var(--radius-md); color: var(--text-primary);"
          />
          <button
            id="shop-clear"
            class="px-8 py-4 text-xs font-medium tracking-wide transition-all"
            style="background-color: var(--accent-primary); color: var(--text-inverse); border-radius: var(--radius-md);"
          >
            CLEAR
          </button>
        </div>
      </div>

      <div id="shop-grid" class="masonry-grid"></div>

      <div class="loader" data-loader>
        <span class="inline-block w-2 h-2 rounded-full animate-bounce mr-1" style="background-color: var(--text-tertiary);"></span>
        <span class="inline-block w-2 h-2 rounded-full animate-bounce mr-1 delay-75" style="background-color: var(--text-tertiary);"></span>
        <span class="inline-block w-2 h-2 rounded-full animate-bounce delay-150" style="background-color: var(--text-tertiary);"></span>
      </div>
      <div data-sentinel class="h-10"></div>
    </div>
  `;
}

function renderBlog() {
  return `
    <div class="w-full min-h-screen">
      <div class="py-20 px-8" style="background-color: var(--bg-card); border-bottom: 1px solid var(--border-subtle);">
        <div class="text-center max-w-3xl mx-auto">
          <h2 class="text-4xl font-semibold tracking-wide mb-4" style="color: var(--text-primary); letter-spacing: -0.02em;">The Columnist</h2>
          <p class="mb-10 leading-relaxed" style="color: var(--text-secondary);">Weekly musings on design theory.</p>
          <div class="flex flex-col md:flex-row gap-4 justify-center">
            <div class="flex-grow relative max-w-md">
              <input
                type="text"
                id="blog-search"
                placeholder="Search articles..."
                class="w-full px-5 py-4 text-sm transition-all"
                style="background-color: var(--bg-elevated); border: 1px solid var(--border-light); border-radius: var(--radius-md); color: var(--text-primary);"
              />
              <i data-lucide="search" class="w-4 h-4 absolute right-4 top-1/2 -translate-y-1/2" style="color: var(--text-tertiary);"></i>
            </div>
            <input
              type="text"
              id="blog-author"
              placeholder="Filter by author..."
              class="px-5 py-4 text-sm md:w-48 transition-all"
              style="background-color: var(--bg-elevated); border: 1px solid var(--border-light); border-radius: var(--radius-md); color: var(--text-primary);"
            />
            <button
              id="blog-clear"
              class="px-8 py-4 text-xs font-medium tracking-wide transition-all"
              style="background-color: var(--accent-primary); color: var(--text-inverse); border-radius: var(--radius-md);"
            >
              CLEAR
            </button>
          </div>
        </div>
      </div>

      <div id="blog-feed" class="max-w-4xl mx-auto" style="border-top: 1px solid var(--border-subtle);"></div>

      <div class="loader" data-loader>
        <span class="text-xs font-medium tracking-wide" style="color: var(--text-tertiary);">Loading previous week...</span>
      </div>
      <div data-sentinel class="h-10"></div>
    </div>
  `;
}

/* ================================================================
   UI helpers
================================================================= */
function setLoading(isLoading) {
  state.isLoading = isLoading;
  const loader = $("[data-loader]");
  if (!loader) return;
  loader.classList.toggle("active", isLoading);
}

function updateNavActive(view) {
  $$(".nav-link").forEach((el) => el.classList.toggle("active", el.dataset.target === view));
}

function refreshIcons() {
  lucide.createIcons();
}

/* ================================================================
   Modern Animation Utilities
================================================================= */
function setupScrollAnimations() {
  if (state.prefersReducedMotion) return;

  // Disconnect existing observer
  if (state.scrollObserver) {
    state.scrollObserver.disconnect();
  }

  // Create intersection observer for scroll-triggered animations
  state.scrollObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          // Optionally unobserve after revealing for performance
          // state.scrollObserver.unobserve(entry.target);
        }
      });
    },
    {
      root: null,
      rootMargin: '0px 0px -100px 0px',
      threshold: 0.1,
    }
  );

  // Observe all reveal-on-scroll elements
  $$('.reveal-on-scroll').forEach((el) => {
    state.scrollObserver.observe(el);
  });
}

function addStaggerAnimation(container, selector = '.stagger-item') {
  if (state.prefersReducedMotion) return;

  const items = container.querySelectorAll(selector);
  items.forEach((item, index) => {
    item.style.animationDelay = `${index * 50}ms`;
  });
}

function smoothScrollTo(top) {
  if (state.prefersReducedMotion) {
    window.scrollTo(0, top);
  } else {
    window.scrollTo({
      top,
      behavior: 'smooth'
    });
  }
}

// Subtle parallax effect on scroll
let ticking = false;
function handleParallaxScroll() {
  if (state.prefersReducedMotion) return;

  const scrolled = window.pageYOffset;
  const parallaxElements = $$('.parallax');

  parallaxElements.forEach((el) => {
    const speed = el.dataset.speed || 0.5;
    el.style.transform = `translateY(${scrolled * speed}px)`;
  });

  ticking = false;
}

window.addEventListener('scroll', () => {
  if (!ticking && !state.prefersReducedMotion) {
    window.requestAnimationFrame(handleParallaxScroll);
    ticking = true;
  }
}, { passive: true });

function mountInfiniteScroll() {
  if (state.io) {
    state.io.disconnect();
    state.io = null;
  }

  const sentinel = $("[data-sentinel]");
  if (!sentinel) return;

  state.io = new IntersectionObserver(
    (entries) => {
      if (!entries.some((e) => e.isIntersecting)) return;
      if (state.isLoading) return;

      if (state.view === "archive") loadArchiveItems();
      if (state.view === "shop") loadShopItems();
      if (state.view === "blog") loadBlogArticle();
      if (state.view === "drops") loadDrops();
    },
    { root: null, rootMargin: "800px 0px", threshold: 0.01 }
  );

  state.io.observe(sentinel);
}

/* ================================================================
   Data loaders (using real API)
================================================================= */

// Load drops for the main drops feed (reverse chronological, all items)
async function loadDrops(count = 5) {
  const feed = $("#drops-feed");
  if (!feed || state.isLoading) return;

  setLoading(true);

  try {
    // Fetch all types of content and merge them (projects, products, articles)
    const [projectsRes, productsRes, articlesRes] = await Promise.all([
      api.getProjects(state.dropsIndex, Math.ceil(count / 3), state.filters.drops),
      api.getProducts(state.dropsIndex, Math.ceil(count / 3), state.filters.drops),
      api.getArticles(state.dropsIndex, Math.ceil(count / 3), state.filters.drops)
    ]);

    // Combine and format all items
    let allItems = [
      ...projectsRes.data.map(item => ({ ...formatDataFromDB(item), type: 'project' })),
      ...productsRes.data.map(item => ({ ...formatDataFromDB(item), type: 'product' })),
      ...articlesRes.data.map(item => ({ ...formatDataFromDB(item), type: 'article' }))
    ];

    // Sort by date (newest first) - reverse chronological
    allItems.sort((a, b) => {
      const dateA = new Date(a.date || a.created_at || 0);
      const dateB = new Date(b.date || b.created_at || 0);
      return dateB - dateA; // Descending order (newest first)
    });

    // Take only the count we need
    allItems = allItems.slice(0, count);

    // Create drop cards
    const cards = allItems.map((item, index) => {
      const currentDropNum = state.dropNumber - state.dropsIndex - index;
      return createDropCard(item, currentDropNum, item.type);
    });

    // Append cards to feed
    cards.forEach(card => feed.appendChild(card));

    state.dropsIndex += allItems.length;
    setLoading(false);

    // Refresh icons for new cards
    refreshIcons();
    setupScrollAnimations();
  } catch (error) {
    console.error('Failed to load drops:', error);
    setLoading(false);
  }
}

// Load preview drops for home page
async function loadHomeDropsPreview() {
  const container = $("#home-drops-preview");
  if (!container) return;

  try {
    // Load just the latest items
    const [projectsRes, productsRes] = await Promise.all([
      api.getProjects(0, 2, {}),
      api.getProducts(0, 1, {})
    ]);

    let allItems = [
      ...projectsRes.data.map(item => ({ ...formatDataFromDB(item), type: 'project' })),
      ...productsRes.data.map(item => ({ ...formatDataFromDB(item), type: 'product' }))
    ];

    // Sort by date (newest first)
    allItems.sort((a, b) => {
      const dateA = new Date(a.date || a.created_at || 0);
      const dateB = new Date(b.date || b.created_at || 0);
      return dateB - dateA;
    });

    // Show top 3
    allItems = allItems.slice(0, 3);

    // Create drop cards
    const cards = allItems.map((item, index) => {
      return createDropCard(item, state.dropNumber - index, item.type);
    });

    cards.forEach(card => container.appendChild(card));
    refreshIcons();
  } catch (error) {
    console.error('Failed to load home drops preview:', error);
  }
}

/* ================================================================
   Data loaders for original views (keeping for backwards compatibility)
================================================================= */
async function loadArchiveItems(count = 6) {
  const grid = $("#archive-grid");
  if (!grid || state.isLoading) return;

  setLoading(true);

  try {
    const response = await api.getProjects(state.archiveIndex, count, state.filters.archive);
    const projects = response.data;

    // Use modular Pinterest-style cards
    const formattedData = projects.map(project => formatDataFromDB(project));
    const cards = batchCreateCards(formattedData, 'project', 'pinterest');

    // Append cards to masonry grid
    cards.forEach(card => grid.appendChild(card));

    state.archiveIndex += projects.length;
    setLoading(false);

    // Refresh icons for new cards
    refreshIcons();

    // Setup scroll animations for newly added items
    setupScrollAnimations();
  } catch (error) {
    console.error('Failed to load archive items:', error);
    setLoading(false);
  }
}

async function loadShopItems(count = 6) {
  const grid = $("#shop-grid");
  if (!grid || state.isLoading) return;

  setLoading(true);

  try {
    const response = await api.getProducts(state.shopIndex, count, state.filters.shop);
    const products = response.data;

    // Use modular Pinterest-style cards for products
    const formattedData = products.map(product => formatDataFromDB(product));
    const cards = batchCreateCards(formattedData, 'product', 'pinterest');

    // Append cards to masonry grid
    cards.forEach(card => grid.appendChild(card));

    state.shopIndex += products.length;
    setLoading(false);

    // Refresh icons for new cards
    refreshIcons();

    // Setup scroll animations for newly added items
    setupScrollAnimations();
  } catch (error) {
    console.error('Failed to load shop items:', error);
    setLoading(false);
  }
}

async function loadBlogArticle() {
  const feed = $("#blog-feed");
  if (!feed || state.isLoading) return;

  setLoading(true);

  try {
    const response = await api.getArticles(state.blogIndex, 1, state.filters.blog);
    const articles = response.data;

    if (articles.length === 0) {
      setLoading(false);
      return;
    }

    const article = formatDataFromDB(articles[0]);

    // Use modular FeedCard component
    const card = createCardFromData(article, 'article', 'feed');
    feed.appendChild(card);

    state.blogIndex += 1;
    setLoading(false);

    // Setup scroll animations for newly added article
    setupScrollAnimations();
  } catch (error) {
    console.error('Failed to load blog article:', error);
    setLoading(false);
  }
}

/* ================================================================
   Modal
================================================================= */
const modal = {
  overlay: $("[data-modal-overlay]"),
  content: $("[data-modal-content]"),
  closeBtn: $("[data-modal-close]"),
  lastFocus: null,
};

function openModal(data) {
  const overlay = modal.overlay;
  const content = modal.content;
  const actionBtn = $("#modal-action-btn");

  // Set modal content
  $("#modal-img").src = data.image;
  $("#modal-title").innerText = data.title;
  $("#modal-date").innerText = data.date.toUpperCase();
  // Use textContent instead of innerHTML to prevent XSS
  $("#modal-desc").textContent = data.description;

  // Render tags as badges (Pinterest-style)
  const tagsContainer = $("#modal-tags");
  tagsContainer.innerHTML = (data.tags || []).map(tag =>
    `<span class="modal-badge">${escapeHtml(tag)}</span>`
  ).join('');

  // Set action button behavior
  if (data.price) {
    actionBtn.innerHTML = `<i data-lucide="bookmark"></i> <span>Save — $${data.price}</span>`;
    actionBtn.onclick = () => {
      alert(`${data.title} added to cart!`);
      closeModal();
    };
  } else {
    actionBtn.innerHTML = `<i data-lucide="bookmark"></i> <span>Save</span>`;
    actionBtn.onclick = () => {
      alert(`Saved ${data.title} to your collection!`);
      closeModal();
    };
  }

  modal.lastFocus = document.activeElement;

  // Open modal with Pinterest-style animation
  overlay.classList.remove("hidden");
  requestAnimationFrame(() => {
    overlay.classList.remove("opacity-0");
    content.classList.remove("opacity-0", "scale-95");
    content.classList.add("scale-100");
  });

  document.body.style.overflow = "hidden";
  refreshIcons();

  modal.closeBtn?.focus?.();
}

function closeModal() {
  const overlay = modal.overlay;
  const content = modal.content;

  overlay.classList.add("opacity-0");
  content.classList.add("opacity-0", "scale-95");
  content.classList.remove("scale-100");

  setTimeout(() => {
    overlay.classList.add("hidden");
    document.body.style.overflow = "";
    modal.lastFocus?.focus?.();
  }, 250);
}

/* ================================================================
   Search handlers
================================================================= */
let searchTimeout = null;

function setupDropsSearch() {
  const searchInput = $("#drops-search");
  const statusSelect = $("#drops-status");
  const clearBtn = $("#drops-clear");

  if (!searchInput || !statusSelect || !clearBtn) return;

  const performSearch = () => {
    state.filters.drops = {
      search: searchInput.value.trim(),
      status: statusSelect.value
    };
    state.dropsIndex = 0;
    $("#drops-feed").innerHTML = '';
    loadDrops(5);
  };

  searchInput.addEventListener("input", () => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(performSearch, 500);
  });

  statusSelect.addEventListener("change", performSearch);

  clearBtn.addEventListener("click", () => {
    searchInput.value = '';
    statusSelect.value = '';
    performSearch();
  });
}

function setupArchiveSearch() {
  const searchInput = $("#archive-search");
  const tagInput = $("#archive-tag");
  const clearBtn = $("#archive-clear");

  if (!searchInput || !tagInput || !clearBtn) return;

  const performSearch = () => {
    state.filters.archive = {
      search: searchInput.value.trim(),
      tag: tagInput.value.trim()
    };
    state.archiveIndex = 0;
    $("#archive-grid").innerHTML = '';
    loadArchiveItems(9);
  };

  searchInput.addEventListener("input", () => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(performSearch, 500);
  });

  tagInput.addEventListener("input", () => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(performSearch, 500);
  });

  clearBtn.addEventListener("click", () => {
    searchInput.value = '';
    tagInput.value = '';
    performSearch();
  });
}

function setupShopSearch() {
  const searchInput = $("#shop-search");
  const tagInput = $("#shop-tag");
  const minPriceInput = $("#shop-min-price");
  const maxPriceInput = $("#shop-max-price");
  const clearBtn = $("#shop-clear");

  if (!searchInput || !tagInput || !minPriceInput || !maxPriceInput || !clearBtn) return;

  const performSearch = () => {
    state.filters.shop = {
      search: searchInput.value.trim(),
      tag: tagInput.value.trim(),
      minPrice: minPriceInput.value ? parseFloat(minPriceInput.value) : undefined,
      maxPrice: maxPriceInput.value ? parseFloat(maxPriceInput.value) : undefined
    };
    state.shopIndex = 0;
    $("#shop-grid").innerHTML = '';
    loadShopItems(9);
  };

  searchInput.addEventListener("input", () => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(performSearch, 500);
  });

  tagInput.addEventListener("input", () => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(performSearch, 500);
  });

  minPriceInput.addEventListener("input", () => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(performSearch, 500);
  });

  maxPriceInput.addEventListener("input", () => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(performSearch, 500);
  });

  clearBtn.addEventListener("click", () => {
    searchInput.value = '';
    tagInput.value = '';
    minPriceInput.value = '';
    maxPriceInput.value = '';
    performSearch();
  });
}

function setupBlogSearch() {
  const searchInput = $("#blog-search");
  const authorInput = $("#blog-author");
  const clearBtn = $("#blog-clear");

  if (!searchInput || !authorInput || !clearBtn) return;

  const performSearch = () => {
    state.filters.blog = {
      search: searchInput.value.trim(),
      author: authorInput.value.trim()
    };
    state.blogIndex = 0;
    $("#blog-feed").innerHTML = '';
    loadBlogArticle();
  };

  searchInput.addEventListener("input", () => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(performSearch, 500);
  });

  authorInput.addEventListener("input", () => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(performSearch, 500);
  });

  clearBtn.addEventListener("click", () => {
    searchInput.value = '';
    authorInput.value = '';
    performSearch();
  });
}

/* ================================================================
   Router
================================================================= */
function router(view) {
  state.view = view;
  updateNavActive(view);

  // Smooth scroll to top
  smoothScrollTo(0);

  if (view === "home") {
    app.innerHTML = renderHome();
    refreshIcons();
    loadHomeDropsPreview();
    setupScrollAnimations();
    return;
  }

  if (view === "drops") {
    app.innerHTML = renderDrops();
    refreshIcons();
    state.dropsIndex = 0;
    state.filters.drops = {};
    setupDropsSearch();
    loadDrops(5);
    mountInfiniteScroll();
    setupScrollAnimations();
    return;
  }

  if (view === "archive") {
    app.innerHTML = renderArchive();
    refreshIcons();
    state.archiveIndex = 0;
    state.filters.archive = {};
    setupArchiveSearch();
    loadArchiveItems(9);
    mountInfiniteScroll();
    setupScrollAnimations();
    return;
  }

  if (view === "shop") {
    app.innerHTML = renderShop();
    refreshIcons();
    state.shopIndex = 0;
    state.filters.shop = {};
    setupShopSearch();
    loadShopItems(9);
    mountInfiniteScroll();
    setupScrollAnimations();
    return;
  }

  if (view === "blog") {
    app.innerHTML = renderBlog();
    refreshIcons();
    state.blogIndex = 0;
    state.filters.blog = {};
    setupBlogSearch();
    loadBlogArticle();
    mountInfiniteScroll();
    setupScrollAnimations();
    return;
  }
}

/* ================================================================
   Events (delegated)
================================================================= */
document.addEventListener("click", (e) => {
  const routeEl = e.target.closest("[data-route]");
  if (routeEl) {
    const view = routeEl.dataset.route;
    if (view) router(view);
    return;
  }

  const modalCard = e.target.closest("[data-open-modal]");
  if (modalCard) {
    const raw = modalCard.getAttribute("data-item");
    if (!raw) return;
    try {
      const data = JSON.parse(decodeURIComponent(raw));
      openModal(data);
    } catch {
      // ignore bad payload
    }
    return;
  }

  if (e.target === modal.overlay) {
    closeModal();
    return;
  }

  if (e.target.closest("[data-modal-close]")) {
    closeModal();
  }
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !modal.overlay.classList.contains("hidden")) {
    closeModal();
  }
});

/* ================================================================
   Boot
================================================================= */
document.addEventListener("DOMContentLoaded", () => {
  const dateOptions = { weekday: "long", year: "numeric", month: "long", day: "numeric" };
  currentDateEl.textContent = new Date().toLocaleDateString("en-US", dateOptions);

  router("home");
});

window.router = router;
