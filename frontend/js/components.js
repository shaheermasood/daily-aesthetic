/**
 * Modular UI Components - Pinterest-Inspired Design System
 * Reusable components for creating dynamic, responsive layouts
 */

import { escapeHtml } from './utils.js';

/* ================================================================
   Pinterest-Style Masonry Grid Component
================================================================= */
export class MasonryGrid {
  constructor(container, options = {}) {
    this.container = container;
    this.options = {
      columnCount: options.columnCount || 'auto',
      gap: options.gap || 16,
      breakpoints: options.breakpoints || {
        320: 1,
        640: 2,
        768: 3,
        1024: 4,
        1280: 5,
        1536: 6
      }
    };
    this.columns = [];
    this.init();
  }

  init() {
    this.container.classList.add('masonry-grid');
    this.updateColumns();
    window.addEventListener('resize', () => this.updateColumns());
  }

  updateColumns() {
    const width = window.innerWidth;
    let columnCount = 3;

    // Determine column count based on breakpoints
    const breakpointKeys = Object.keys(this.options.breakpoints)
      .map(Number)
      .sort((a, b) => b - a);

    for (const breakpoint of breakpointKeys) {
      if (width >= breakpoint) {
        columnCount = this.options.breakpoints[breakpoint];
        break;
      }
    }

    this.columnCount = columnCount;
    this.container.style.setProperty('--masonry-columns', columnCount);
  }

  add(items) {
    // Items are added and CSS handles the masonry layout
    items.forEach(item => {
      this.container.appendChild(item);
    });
  }

  clear() {
    this.container.innerHTML = '';
  }
}

/* ================================================================
   Pinterest-Style Card Component
================================================================= */
export class PinterestCard {
  constructor(data, type = 'project') {
    this.data = data;
    this.type = type;
  }

  // Create a Pinterest-style card element
  createElement() {
    const card = document.createElement('div');
    card.className = 'pinterest-card';
    card.dataset.openModal = '1';
    card.dataset.item = encodeURIComponent(JSON.stringify(this.data));

    const aspectRatio = this._getRandomAspectRatio();

    card.innerHTML = `
      <div class="pinterest-card__image-container" style="aspect-ratio: ${aspectRatio};">
        <img
          src="${this.data.image}"
          class="pinterest-card__image"
          alt="${escapeHtml(this.data.title)}"
          loading="lazy"
          decoding="async"
        />
        <div class="pinterest-card__overlay">
          <button class="pinterest-card__save-btn" aria-label="Save">
            <i data-lucide="bookmark"></i>
            <span>Save</span>
          </button>
          ${this.type === 'product' ? `
            <button class="pinterest-card__shop-btn" aria-label="Add to cart">
              <i data-lucide="shopping-cart"></i>
            </button>
          ` : ''}
        </div>
      </div>
      <div class="pinterest-card__content">
        <h3 class="pinterest-card__title">${escapeHtml(this.data.title)}</h3>
        ${this._renderMetadata()}
      </div>
    `;

    return card;
  }

  // Generate varied aspect ratios for Pinterest-style layout
  _getRandomAspectRatio() {
    const ratios = [
      '3/4',   // Portrait
      '4/5',   // Tall
      '1/1',   // Square
      '4/3',   // Landscape (less common)
      '2/3',   // Tall portrait
    ];

    // Weighted random selection (favor taller images like Pinterest)
    const weights = [0.3, 0.3, 0.2, 0.1, 0.1];
    const random = Math.random();
    let sum = 0;

    for (let i = 0; i < weights.length; i++) {
      sum += weights[i];
      if (random <= sum) {
        return ratios[i];
      }
    }

    return ratios[0];
  }

  _renderMetadata() {
    if (this.type === 'product' && this.data.price) {
      return `
        <div class="pinterest-card__metadata">
          <span class="pinterest-card__price">$${this.data.price}</span>
          <div class="pinterest-card__tags">
            ${this.data.tags.slice(0, 2).map(tag =>
              `<span class="pinterest-card__tag">${escapeHtml(tag)}</span>`
            ).join('')}
          </div>
        </div>
      `;
    }

    return `
      <div class="pinterest-card__metadata">
        <span class="pinterest-card__date">${escapeHtml(this.data.date)}</span>
        <div class="pinterest-card__tags">
          ${this.data.tags.slice(0, 3).map(tag =>
            `<span class="pinterest-card__tag">${escapeHtml(tag)}</span>`
          ).join('')}
        </div>
      </div>
    `;
  }
}

/* ================================================================
   Compact Grid Card (Alternative Layout)
================================================================= */
export class CompactCard {
  constructor(data, type = 'project') {
    this.data = data;
    this.type = type;
  }

  createElement() {
    const card = document.createElement('div');
    card.className = 'compact-card';
    card.dataset.openModal = '1';
    card.dataset.item = encodeURIComponent(JSON.stringify(this.data));

    card.innerHTML = `
      <div class="compact-card__image-container">
        <img
          src="${this.data.image}"
          class="compact-card__image"
          alt="${escapeHtml(this.data.title)}"
          loading="lazy"
          decoding="async"
        />
        <div class="compact-card__overlay">
          <div class="compact-card__actions">
            <button class="compact-card__action-btn" aria-label="Save">
              <i data-lucide="heart"></i>
            </button>
            <button class="compact-card__action-btn" aria-label="Share">
              <i data-lucide="share-2"></i>
            </button>
          </div>
        </div>
      </div>
      <div class="compact-card__content">
        <h3 class="compact-card__title">${escapeHtml(this.data.title)}</h3>
        ${this.type === 'product' ?
          `<span class="compact-card__price">$${this.data.price}</span>` :
          `<span class="compact-card__date">${escapeHtml(this.data.date)}</span>`
        }
      </div>
    `;

    return card;
  }
}

/* ================================================================
   Feed Card Component (For Blog/Articles)
================================================================= */
export class FeedCard {
  constructor(data) {
    this.data = data;
  }

  createElement() {
    const card = document.createElement('article');
    card.className = 'feed-card';

    card.innerHTML = `
      <div class="feed-card__header">
        <span class="feed-card__label">Week of ${escapeHtml(this.data.date).toUpperCase()}</span>
        <h3 class="feed-card__title">${escapeHtml(this.data.title)}</h3>
        <div class="feed-card__meta">
          <span class="feed-card__author">By ${escapeHtml(this.data.author)}</span>
        </div>
      </div>

      <div class="feed-card__image-container">
        <img
          src="${this.data.image}"
          class="feed-card__image"
          alt="${escapeHtml(this.data.title)}"
          loading="lazy"
          decoding="async"
        />
      </div>

      <div class="feed-card__content">
        ${this.data.content}
      </div>

      <div class="feed-card__divider">***</div>
    `;

    return card;
  }
}

/* ================================================================
   Utilities for Component System
================================================================= */
export function createCardFromData(data, type = 'project', variant = 'pinterest') {
  switch (variant) {
    case 'pinterest':
      return new PinterestCard(data, type).createElement();
    case 'compact':
      return new CompactCard(data, type).createElement();
    case 'feed':
      return new FeedCard(data).createElement();
    default:
      return new PinterestCard(data, type).createElement();
  }
}

export function batchCreateCards(dataArray, type = 'project', variant = 'pinterest') {
  return dataArray.map(data => createCardFromData(data, type, variant));
}

/* ================================================================
   Infinite Scroll Component
================================================================= */
export class InfiniteScroll {
  constructor(options = {}) {
    this.sentinel = options.sentinel;
    this.onLoad = options.onLoad;
    this.rootMargin = options.rootMargin || '800px 0px';
    this.threshold = options.threshold || 0.01;
    this.isLoading = false;
    this.observer = null;
  }

  init() {
    if (!this.sentinel) return;

    this.observer = new IntersectionObserver(
      (entries) => {
        if (entries.some(e => e.isIntersecting) && !this.isLoading) {
          this.load();
        }
      },
      {
        root: null,
        rootMargin: this.rootMargin,
        threshold: this.threshold
      }
    );

    this.observer.observe(this.sentinel);
  }

  async load() {
    if (this.isLoading || !this.onLoad) return;

    this.isLoading = true;
    await this.onLoad();
    this.isLoading = false;
  }

  destroy() {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
  }
}

/* ================================================================
   Search Filter Component
================================================================= */
export class SearchFilter {
  constructor(options = {}) {
    this.searchInput = options.searchInput;
    this.filterInputs = options.filterInputs || [];
    this.clearButton = options.clearButton;
    this.onSearch = options.onSearch;
    this.debounceTime = options.debounceTime || 500;
    this.timeout = null;
  }

  init() {
    if (this.searchInput) {
      this.searchInput.addEventListener('input', () => this.handleSearch());
    }

    this.filterInputs.forEach(input => {
      input.addEventListener('input', () => this.handleSearch());
    });

    if (this.clearButton) {
      this.clearButton.addEventListener('click', () => this.clear());
    }
  }

  handleSearch() {
    clearTimeout(this.timeout);
    this.timeout = setTimeout(() => {
      if (this.onSearch) {
        this.onSearch(this.getValues());
      }
    }, this.debounceTime);
  }

  getValues() {
    const values = {};

    if (this.searchInput) {
      values.search = this.searchInput.value.trim();
    }

    this.filterInputs.forEach(input => {
      const key = input.id.split('-').pop();
      values[key] = input.value.trim();
    });

    return values;
  }

  clear() {
    if (this.searchInput) {
      this.searchInput.value = '';
    }

    this.filterInputs.forEach(input => {
      input.value = '';
    });

    this.handleSearch();
  }

  destroy() {
    clearTimeout(this.timeout);
  }
}
