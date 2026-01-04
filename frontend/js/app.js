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
  archiveSearch: '',
  archiveTag: '',
  shopSearch: '',
  shopTag: '',
  blogSearch: '',
};

/* ================================================================
   View templates
================================================================= */
function renderHome() {
  return `
    <div class="flex flex-col items-center justify-center min-h-screen py-12 px-4 md:px-12 border-l-0 md:border-l border-black bg-white/50">
      <div class="max-w-4xl w-full">

        <div class="mb-8 flex justify-center items-center space-x-3">
          <div class="h-[1px] bg-black w-12"></div>
          <span class="text-xs font-bold uppercase tracking-widest text-red-700 flex items-center gap-2">
            <span class="w-2 h-2 bg-red-700 rounded-full animate-pulse"></span>
            Project of the Month
          </span>
          <div class="h-[1px] bg-black w-12"></div>
        </div>

        <h2 class="text-5xl md:text-8xl font-black mb-10 text-center leading-[0.9] hover:opacity-70 transition cursor-pointer" data-route="archive">
          The Brutalist<br />Revival in Tokyo
        </h2>

        <div class="w-full aspect-[16/9] overflow-hidden mb-10 border border-black relative group cursor-pointer shadow-lg" data-route="archive">
          <img
            src="https://picsum.photos/seed/arch/1600/900"
            class="w-full h-full object-cover img-newspaper group-hover:scale-105 transition duration-700"
            alt="Hero Project"
            loading="lazy"
            decoding="async"
          />
          <div class="absolute bottom-0 right-0 bg-white border-t border-l border-black p-3">
            <p class="font-serif italic text-xs text-gray-500">Fig 1.1 — Exterior Facade</p>
          </div>
        </div>

        <div class="max-w-2xl mx-auto text-center">
          <p class="text-xl md:text-2xl font-serif leading-relaxed mb-6">
            <span class="font-bold uppercase text-sm mr-2 block mb-2">Tokyo, Japan</span>
            In an era defined by glass towers and digital facades, one firm is returning to the raw honesty of concrete.
            Our feature project this month explores the tactile nature of permanence in a transient city.
          </p>

          <div class="flex justify-center gap-8 py-6 border-t border-b border-black/10 my-8">
            <div class="text-center">
              <span class="block text-[10px] font-bold uppercase text-gray-400">Architect</span>
              <span class="font-serif italic">Kengo Sato</span>
            </div>
            <div class="text-center">
              <span class="block text-[10px] font-bold uppercase text-gray-400">Year</span>
              <span class="font-serif italic">2024</span>
            </div>
            <div class="text-center">
              <span class="block text-[10px] font-bold uppercase text-gray-400">Area</span>
              <span class="font-serif italic">450 sqm</span>
            </div>
          </div>

          <button data-route="archive" class="group text-sm font-bold uppercase tracking-widest hover:text-gray-600 transition">
            Read Full Story
            <span class="inline-block transition-transform group-hover:translate-x-1">&rarr;</span>
          </button>
        </div>

      </div>
    </div>
  `;
}

function renderArchive() {
  return `
    <div class="w-full min-h-screen border-l-0 md:border-l border-black">
      <div class="py-12 px-6 md:px-12 border-b border-black bg-[#FDFBF7]">
        <h2 class="text-4xl md:text-6xl font-bold mb-4">The Archive</h2>
        <p class="font-serif text-gray-600 italic max-w-xl mb-6">
          A curated collection of past works, preserving the dialogue between space, form, and light.
        </p>

        <div class="flex flex-col md:flex-row gap-4 mt-6">
          <div class="flex-grow relative">
            <input
              type="text"
              id="archive-search"
              placeholder="Search projects..."
              class="w-full px-4 py-2 border border-black focus:outline-none focus:ring-2 focus:ring-black text-sm"
            />
            <i data-lucide="search" class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"></i>
          </div>
          <div class="relative">
            <select
              id="archive-tag-filter"
              class="w-full md:w-48 px-4 py-2 border border-black focus:outline-none focus:ring-2 focus:ring-black text-sm appearance-none bg-white"
            >
              <option value="">All Tags</option>
            </select>
            <i data-lucide="filter" class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"></i>
          </div>
        </div>
      </div>

      <div id="archive-grid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0"></div>

      <!-- sentinel used by IntersectionObserver -->
      <div class="loader" data-loader>
        <span class="inline-block w-2 h-2 bg-black rounded-full animate-bounce mr-1"></span>
        <span class="inline-block w-2 h-2 bg-black rounded-full animate-bounce mr-1 delay-75"></span>
        <span class="inline-block w-2 h-2 bg-black rounded-full animate-bounce delay-150"></span>
      </div>
      <div data-sentinel class="h-10"></div>
    </div>
  `;
}

function renderShop() {
  return `
    <div class="w-full min-h-screen border-l-0 md:border-l border-black">
      <div class="py-12 px-6 md:px-12 border-b border-black bg-[#FDFBF7]">
        <div class="flex flex-col md:flex-row justify-between md:items-end gap-6 mb-6">
          <div>
            <h2 class="text-4xl md:text-6xl font-bold mb-4">The Shop</h2>
            <p class="font-serif text-gray-600 italic max-w-xl">Curated objects of utility and beauty for the modern minimalist.</p>
          </div>
          <div class="flex items-center space-x-2 text-sm font-bold uppercase tracking-widest text-gray-400 pb-2">
            <i data-lucide="shopping-bag" class="w-4 h-4"></i>
            <span>Cart (0)</span>
          </div>
        </div>

        <div class="flex flex-col md:flex-row gap-4 mt-6">
          <div class="flex-grow relative">
            <input
              type="text"
              id="shop-search"
              placeholder="Search products..."
              class="w-full px-4 py-2 border border-black focus:outline-none focus:ring-2 focus:ring-black text-sm"
            />
            <i data-lucide="search" class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"></i>
          </div>
          <div class="relative">
            <select
              id="shop-tag-filter"
              class="w-full md:w-48 px-4 py-2 border border-black focus:outline-none focus:ring-2 focus:ring-black text-sm appearance-none bg-white"
            >
              <option value="">All Categories</option>
            </select>
            <i data-lucide="filter" class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"></i>
          </div>
        </div>
      </div>

      <div id="shop-grid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0"></div>

      <div class="loader" data-loader>
        <span class="inline-block w-2 h-2 bg-black rounded-full animate-bounce mr-1"></span>
        <span class="inline-block w-2 h-2 bg-black rounded-full animate-bounce mr-1 delay-75"></span>
        <span class="inline-block w-2 h-2 bg-black rounded-full animate-bounce delay-150"></span>
      </div>
      <div data-sentinel class="h-10"></div>
    </div>
  `;
}

function renderBlog() {
  return `
    <div class="w-full min-h-screen border-l-0 md:border-l border-black">
      <div class="py-12 px-6 md:px-12 border-b border-black bg-[#FDFBF7]">
        <div class="text-center mb-6">
          <h2 class="text-4xl font-bold uppercase tracking-widest mb-2">The Columnist</h2>
          <p class="font-serif italic text-gray-500">Weekly musings on design theory.</p>
        </div>

        <div class="max-w-2xl mx-auto mt-8">
          <div class="relative">
            <input
              type="text"
              id="blog-search"
              placeholder="Search articles..."
              class="w-full px-4 py-2 border border-black focus:outline-none focus:ring-2 focus:ring-black text-sm"
            />
            <i data-lucide="search" class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"></i>
          </div>
        </div>
      </div>

      <div id="blog-feed" class="max-w-3xl mx-auto divide-y-2 divide-black/10"></div>

      <div class="loader" data-loader>
        <span class="text-xs font-bold uppercase tracking-widest text-gray-500">Loading previous week...</span>
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
    const response = await api.getProjects(state.archiveIndex, count, state.archiveSearch, state.archiveTag);
    const projects = response.data;

    let html = "";

    for (const project of projects) {
      const data = formatDataFromDB(project);
      const payload = encodeURIComponent(JSON.stringify(data));

      html += `
        <div class="group border-b border-black md:border-r border-gray-300 p-8 flex flex-col cursor-pointer transition hover:bg-white" data-open-modal="1" data-item="${payload}">
          <div class="overflow-hidden mb-6 border border-gray-200 relative aspect-[4/5] shadow-sm">
            <img src="${data.image}" class="w-full h-full object-cover img-newspaper group-hover:scale-105 transition duration-500" alt="${escapeHtml(data.title)}" loading="lazy" decoding="async" />
            <div class="absolute inset-0 bg-black/5 group-hover:bg-transparent transition"></div>
          </div>
          <div class="mt-auto">
            <span class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">${escapeHtml(data.date)}</span>
            <h3 class="text-2xl font-bold leading-none mb-3 group-hover:underline underline-offset-4 decoration-1">${escapeHtml(data.title)}</h3>
            <div class="flex flex-wrap gap-2">
              ${data.tags
                .map(
                  (t) =>
                    `<span class="text-[10px] border border-gray-300 px-1.5 py-0.5 text-gray-500 uppercase tracking-wide">${escapeHtml(
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
    const response = await api.getProducts(state.shopIndex, count, state.shopSearch, state.shopTag);
    const products = response.data;

    let html = "";

    for (const product of products) {
      const data = formatDataFromDB(product);
      const payload = encodeURIComponent(JSON.stringify(data));

      html += `
        <div class="group border-b border-black md:border-r border-gray-300 p-8 flex flex-col cursor-pointer transition hover:bg-white" data-open-modal="1" data-item="${payload}">
          <div class="overflow-hidden mb-6 border border-gray-200 relative aspect-[1] shadow-sm">
            <img src="${data.image}" class="w-full h-full object-cover img-newspaper group-hover:scale-105 transition duration-500" alt="${escapeHtml(data.title)}" loading="lazy" decoding="async" />
            <div class="absolute top-2 right-2 bg-black text-white px-2 py-1 text-xs font-bold uppercase opacity-0 group-hover:opacity-100 transition">Quick Add</div>
          </div>
          <div class="mt-auto flex justify-between items-start">
            <div>
              <h3 class="text-xl font-bold leading-none mb-2 group-hover:underline underline-offset-4 decoration-1">${escapeHtml(
                data.title
              )}</h3>
              <div class="flex flex-wrap gap-2">
                ${data.tags.map((t) => `<span class="text-[10px] text-gray-500 uppercase tracking-wide">${escapeHtml(t)}</span>`).join(" / ")}
              </div>
            </div>
            <span class="text-lg font-serif italic font-bold">$${data.price}</span>
          </div>
        </div>
      `;
    }

    appendHTML(grid, html);
    state.shopIndex += products.length;
    setLoading(false);
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
    const response = await api.getArticles(state.blogIndex, 1, state.blogSearch);
    const articles = response.data;

    if (articles.length === 0) {
      setLoading(false);
      return;
    }

    const article = formatDataFromDB(articles[0]);

    const html = `
      <article class="py-20 px-6 md:px-0">
        <div class="text-center mb-10">
          <span class="text-xs font-bold uppercase tracking-widest text-red-700 mb-2 block">Week of ${escapeHtml(article.date)}</span>
          <h3 class="text-4xl md:text-6xl font-bold mb-4 font-serif leading-tight">${escapeHtml(article.title)}</h3>
          <div class="flex justify-center items-center space-x-2 text-sm font-bold italic text-gray-500">
            <span>By ${escapeHtml(article.author)}</span>
          </div>
        </div>

        <div class="w-full aspect-[21/9] mb-12 border border-black overflow-hidden relative">
          <img src="${article.image}" class="w-full h-full object-cover grayscale contrast-125" alt="${escapeHtml(article.title)}" loading="lazy" decoding="async" />
        </div>

        <div class="prose prose-lg prose-headings:font-serif font-serif mx-auto text-gray-800 leading-relaxed text-justify">
          ${article.content}
        </div>

        <div class="mt-16 flex justify-center text-gray-300 tracking-[1em]">***</div>
      </article>
    `;

    appendHTML(feed, html);
    state.blogIndex += 1;
    setLoading(false);
  } catch (error) {
    console.error('Failed to load blog article:', error);
    setLoading(false);
  }
}

/* ================================================================
   Search and Filter helpers
================================================================= */
let searchDebounceTimer = null;

function setupArchiveSearch() {
  const searchInput = $("#archive-search");
  const tagFilter = $("#archive-tag-filter");

  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      clearTimeout(searchDebounceTimer);
      searchDebounceTimer = setTimeout(() => {
        state.archiveSearch = e.target.value.trim();
        state.archiveIndex = 0;
        const grid = $("#archive-grid");
        if (grid) grid.innerHTML = '';
        loadArchiveItems(9);
      }, 300);
    });
  }

  if (tagFilter) {
    tagFilter.addEventListener("change", (e) => {
      state.archiveTag = e.target.value;
      state.archiveIndex = 0;
      const grid = $("#archive-grid");
      if (grid) grid.innerHTML = '';
      loadArchiveItems(9);
    });
  }
}

function setupShopSearch() {
  const searchInput = $("#shop-search");
  const tagFilter = $("#shop-tag-filter");

  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      clearTimeout(searchDebounceTimer);
      searchDebounceTimer = setTimeout(() => {
        state.shopSearch = e.target.value.trim();
        state.shopIndex = 0;
        const grid = $("#shop-grid");
        if (grid) grid.innerHTML = '';
        loadShopItems(9);
      }, 300);
    });
  }

  if (tagFilter) {
    tagFilter.addEventListener("change", (e) => {
      state.shopTag = e.target.value;
      state.shopIndex = 0;
      const grid = $("#shop-grid");
      if (grid) grid.innerHTML = '';
      loadShopItems(9);
    });
  }
}

function setupBlogSearch() {
  const searchInput = $("#blog-search");

  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      clearTimeout(searchDebounceTimer);
      searchDebounceTimer = setTimeout(() => {
        state.blogSearch = e.target.value.trim();
        state.blogIndex = 0;
        const feed = $("#blog-feed");
        if (feed) feed.innerHTML = '';
        loadBlogArticle();
      }, 300);
    });
  }
}

async function populateTagFilters() {
  try {
    // Fetch some items to get available tags
    const projectsResponse = await api.getProjects(0, 100);
    const productsResponse = await api.getProducts(0, 100);

    // Extract unique tags from projects
    const projectTags = new Set();
    projectsResponse.data.forEach(project => {
      if (project.tags && Array.isArray(project.tags)) {
        project.tags.forEach(tag => projectTags.add(tag));
      }
    });

    // Extract unique tags from products
    const productTags = new Set();
    productsResponse.data.forEach(product => {
      if (product.tags && Array.isArray(product.tags)) {
        product.tags.forEach(tag => productTags.add(tag));
      }
    });

    // Populate archive tag filter
    const archiveTagFilter = $("#archive-tag-filter");
    if (archiveTagFilter && projectTags.size > 0) {
      const sortedProjectTags = Array.from(projectTags).sort();
      sortedProjectTags.forEach(tag => {
        const option = document.createElement('option');
        option.value = tag;
        option.textContent = tag;
        archiveTagFilter.appendChild(option);
      });
    }

    // Populate shop tag filter
    const shopTagFilter = $("#shop-tag-filter");
    if (shopTagFilter && productTags.size > 0) {
      const sortedProductTags = Array.from(productTags).sort();
      sortedProductTags.forEach(tag => {
        const option = document.createElement('option');
        option.value = tag;
        option.textContent = tag;
        shopTagFilter.appendChild(option);
      });
    }
  } catch (error) {
    console.error('Failed to populate tag filters:', error);
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
   Router
================================================================= */
function router(view) {
  state.view = view;
  updateNavActive(view);

  if (view === "home") {
    app.innerHTML = renderHome();
    refreshIcons();
    window.scrollTo(0, 0);
    return;
  }

  if (view === "archive") {
    app.innerHTML = renderArchive();
    refreshIcons();
    state.archiveIndex = 0;
    state.archiveSearch = '';
    state.archiveTag = '';
    populateTagFilters();
    setupArchiveSearch();
    loadArchiveItems(9);
    mountInfiniteScroll();
    window.scrollTo(0, 0);
    return;
  }

  if (view === "shop") {
    app.innerHTML = renderShop();
    refreshIcons();
    state.shopIndex = 0;
    state.shopSearch = '';
    state.shopTag = '';
    populateTagFilters();
    setupShopSearch();
    loadShopItems(9);
    mountInfiniteScroll();
    window.scrollTo(0, 0);
    return;
  }

  if (view === "blog") {
    app.innerHTML = renderBlog();
    refreshIcons();
    state.blogIndex = 0;
    state.blogSearch = '';
    setupBlogSearch();
    loadBlogArticle();
    mountInfiniteScroll();
    window.scrollTo(0, 0);
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
