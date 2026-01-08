/**
 * The Daily Aesthetic - Main Application
 * Client-side routing, infinite scroll, modal system
 */

import api from './api.js';
import { escapeHtml, $, $$, appendHTML, formatDataFromDB } from './utils.js';

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
  isLoading: false,
  io: null,
  scrollObserver: null,
  prefersReducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  filters: {
    archive: {},
    shop: {},
    blog: {}
  }
};

/* ================================================================
   View templates
================================================================= */
function renderHome() {
  return `
    <div class="flex flex-col items-center justify-center min-h-screen py-24 px-6 md:px-16">
      <div class="max-w-5xl w-full">

        <div class="mb-12 flex justify-center items-center space-x-4">
          <div class="h-[1px] w-16" style="background-color: var(--border-medium);"></div>
          <span class="text-xs font-semibold tracking-wide flex items-center gap-2" style="color: var(--text-secondary);">
            <span class="w-1.5 h-1.5 rounded-full animate-pulse" style="background-color: var(--accent-sand);"></span>
            PROJECT OF THE MONTH
          </span>
          <div class="h-[1px] w-16" style="background-color: var(--border-medium);"></div>
        </div>

        <h2 class="text-5xl md:text-8xl font-bold mb-16 text-center leading-[0.95] hover:opacity-70 transition-opacity cursor-pointer" data-route="archive" style="color: var(--text-primary); letter-spacing: -0.04em;">
          The Brutalist<br />Revival in Tokyo
        </h2>

        <div class="w-full aspect-[16/9] overflow-hidden mb-14 relative group cursor-pointer" data-route="archive" style="border-radius: var(--radius-lg); box-shadow: var(--shadow-lg);">
          <img
            src="https://picsum.photos/seed/arch/1600/900"
            class="w-full h-full object-cover img-newspaper group-hover:scale-105 transition duration-700"
            alt="Hero Project"
            loading="lazy"
            decoding="async"
          />
          <div class="absolute bottom-6 right-6 px-4 py-2" style="background-color: var(--overlay-glass); backdrop-filter: blur(12px); border-radius: var(--radius-md);">
            <p class="text-xs font-medium" style="color: var(--text-secondary);">Fig 1.1 — Exterior Facade</p>
          </div>
        </div>

        <div class="max-w-3xl mx-auto text-center">
          <p class="text-lg md:text-xl leading-relaxed mb-8" style="color: var(--text-secondary); line-height: 1.8;">
            <span class="font-semibold text-sm tracking-wide mr-2 block mb-4" style="color: var(--text-tertiary);">TOKYO, JAPAN</span>
            In an era defined by glass towers and digital facades, one firm is returning to the raw honesty of concrete.
            Our feature project this month explores the tactile nature of permanence in a transient city.
          </p>

          <div class="flex justify-center gap-12 py-8 my-12" style="border-top: 1px solid var(--border-subtle); border-bottom: 1px solid var(--border-subtle);">
            <div class="text-center">
              <span class="block text-xs font-semibold tracking-wide mb-2" style="color: var(--text-tertiary);">ARCHITECT</span>
              <span class="font-medium" style="color: var(--text-secondary);">Kengo Sato</span>
            </div>
            <div class="text-center">
              <span class="block text-xs font-semibold tracking-wide mb-2" style="color: var(--text-tertiary);">YEAR</span>
              <span class="font-medium" style="color: var(--text-secondary);">2024</span>
            </div>
            <div class="text-center">
              <span class="block text-xs font-semibold tracking-wide mb-2" style="color: var(--text-tertiary);">AREA</span>
              <span class="font-medium" style="color: var(--text-secondary);">450 sqm</span>
            </div>
          </div>

          <button data-route="archive" class="group text-sm font-medium tracking-wide hover:opacity-70 transition-opacity" style="color: var(--text-primary);">
            READ FULL STORY
            <span class="inline-block transition-transform group-hover:translate-x-1 ml-2">&rarr;</span>
          </button>
        </div>

      </div>
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

      <div id="archive-grid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 p-8 md:p-16"></div>

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

      <div id="shop-grid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 p-8 md:p-16"></div>

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
    },
    { root: null, rootMargin: "800px 0px", threshold: 0.01 }
  );

  state.io.observe(sentinel);
}

/* ================================================================
   Data loaders (using real API)
================================================================= */
async function loadArchiveItems(count = 6) {
  const grid = $("#archive-grid");
  if (!grid || state.isLoading) return;

  setLoading(true);

  try {
    const response = await api.getProjects(state.archiveIndex, count, state.filters.archive);
    const projects = response.data;

    let html = "";

    for (const project of projects) {
      const data = formatDataFromDB(project);
      const payload = encodeURIComponent(JSON.stringify(data));

      html += `
        <div class="group p-0 flex flex-col cursor-pointer transition" data-open-modal="1" data-item="${payload}" style="background-color: var(--bg-card); border-radius: var(--radius-lg); overflow: hidden;">
          <div class="overflow-hidden mb-6 relative aspect-[4/5]" style="border-radius: var(--radius-lg) var(--radius-lg) 0 0;">
            <img src="${data.image}" class="w-full h-full object-cover img-newspaper group-hover:scale-105 transition duration-500" alt="${escapeHtml(data.title)}" loading="lazy" decoding="async" />
          </div>
          <div class="mt-auto px-6 pb-6">
            <span class="text-xs font-medium tracking-wide mb-3 block" style="color: var(--text-tertiary);">${escapeHtml(data.date).toUpperCase()}</span>
            <h3 class="text-xl font-semibold leading-tight mb-4 group-hover:opacity-70 transition" style="color: var(--text-primary); letter-spacing: -0.01em;">${escapeHtml(data.title)}</h3>
            <div class="flex flex-wrap gap-2">
              ${data.tags
                .map(
                  (t) =>
                    `<span class="text-xs px-3 py-1 uppercase tracking-wide" style="background-color: var(--bg-secondary); color: var(--text-secondary); border-radius: var(--radius-full);">${escapeHtml(
                      t
                    )}</span>`
                )
                .join("")}
            </div>
          </div>
        </div>
      `;
    }

    appendHTML(grid, html);
    state.archiveIndex += projects.length;
    setLoading(false);

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

    let html = "";

    for (const product of products) {
      const data = formatDataFromDB(product);
      const payload = encodeURIComponent(JSON.stringify(data));

      html += `
        <div class="group p-0 flex flex-col cursor-pointer transition" data-open-modal="1" data-item="${payload}" style="background-color: var(--bg-card); border-radius: var(--radius-lg); overflow: hidden;">
          <div class="overflow-hidden mb-6 relative aspect-[1]" style="border-radius: var(--radius-lg) var(--radius-lg) 0 0;">
            <img src="${data.image}" class="w-full h-full object-cover img-newspaper group-hover:scale-105 transition duration-500" alt="${escapeHtml(data.title)}" loading="lazy" decoding="async" />
            <div class="absolute top-3 right-3 px-3 py-1.5 text-xs font-medium uppercase opacity-0 group-hover:opacity-100 transition" style="background-color: var(--accent-primary); color: var(--text-inverse); border-radius: var(--radius-md);">Quick Add</div>
          </div>
          <div class="mt-auto px-6 pb-6 flex justify-between items-start gap-4">
            <div class="flex-1">
              <h3 class="text-lg font-semibold leading-tight mb-2 group-hover:opacity-70 transition" style="color: var(--text-primary); letter-spacing: -0.01em;">${escapeHtml(
                data.title
              )}</h3>
              <div class="flex flex-wrap gap-2">
                ${data.tags.map((t) => `<span class="text-xs" style="color: var(--text-tertiary);">${escapeHtml(t).toUpperCase()}</span>`).join(" · ")}
              </div>
            </div>
            <span class="text-lg font-semibold flex-shrink-0" style="color: var(--text-primary);">$${data.price}</span>
          </div>
        </div>
      `;
    }

    appendHTML(grid, html);
    state.shopIndex += products.length;
    setLoading(false);

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

    const html = `
      <article class="py-24 px-8 md:px-12">
        <div class="text-center mb-14">
          <span class="text-xs font-semibold tracking-wide mb-4 block" style="color: var(--text-tertiary);">WEEK OF ${escapeHtml(article.date).toUpperCase()}</span>
          <h3 class="text-4xl md:text-6xl font-semibold mb-6 leading-tight" style="color: var(--text-primary); letter-spacing: -0.03em;">${escapeHtml(article.title)}</h3>
          <div class="flex justify-center items-center space-x-2 text-sm font-medium" style="color: var(--text-secondary);">
            <span>By ${escapeHtml(article.author)}</span>
          </div>
        </div>

        <div class="w-full aspect-[21/9] mb-16 overflow-hidden relative" style="border-radius: var(--radius-lg);">
          <img src="${article.image}" class="w-full h-full object-cover" alt="${escapeHtml(article.title)}" loading="lazy" decoding="async" style="filter: saturate(0.9);" />
        </div>

        <div class="prose prose-lg mx-auto leading-relaxed" style="color: var(--text-secondary);">
          ${article.content}
        </div>

        <div class="mt-20 flex justify-center tracking-[1em]" style="color: var(--border-medium);">***</div>
      </article>
    `;

    appendHTML(feed, html);
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

  $("#modal-img").src = data.image;
  $("#modal-title").innerText = data.title;
  $("#modal-date").innerText = data.date;
  $("#modal-desc").innerHTML = data.description;
  $("#modal-tags").innerText = (data.tags || []).join(" / ");

  if (data.price) {
    actionBtn.innerText = `Add to Cart — $${data.price}`;
    actionBtn.onclick = () => {
      alert(`${data.title} added to cart!`);
      closeModal();
    };
  } else {
    actionBtn.innerText = "View Full Project";
    actionBtn.onclick = () => alert("Project details view...");
  }

  modal.lastFocus = document.activeElement;

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
