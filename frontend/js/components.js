/**
 * Modular UI Components - Pinterest-Inspired Design System
 * Reusable components for creating dynamic, responsive layouts
 */

import { escapeHtml } from './utils.js';

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
            ${(this.data.tags || []).slice(0, 2).map(tag =>
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
          ${(this.data.tags || []).slice(0, 3).map(tag =>
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
        ${escapeHtml(this.data.content)}
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
   Drop Card Component - Reverse Chronological Culture
================================================================= */
export class DropCard {
  constructor(data, dropNumber, type = 'project') {
    this.data = data;
    this.dropNumber = dropNumber;
    this.type = type;
    this.status = this._determineStatus();
  }

  _determineStatus() {
    // Determine drop status based on data
    // In a real app, this would check actual dates and inventory
    const rand = Math.random();
    if (this.data.soldOut || rand < 0.15) return 'sold-out';
    if (this.data.upcoming || rand < 0.25) return 'upcoming';
    if (this.data.limited || rand < 0.4) return 'limited';
    if (rand < 0.5) return 'mystery';
    return 'live';
  }

  _getStatusText() {
    const statusMap = {
      'live': 'Live Now',
      'upcoming': 'Coming Soon',
      'sold-out': 'Sold Out',
      'limited': 'Limited Edition',
      'mystery': 'Mystery Drop'
    };
    return statusMap[this.status] || 'Available';
  }

  _renderCountdown() {
    if (this.status !== 'upcoming') return '';

    // Mock countdown - in real app, calculate from actual date
    const days = Math.floor(Math.random() * 7);
    const hours = Math.floor(Math.random() * 24);
    const minutes = Math.floor(Math.random() * 60);

    return `
      <div class="drop-countdown">
        <div class="drop-countdown__segment">
          <div class="drop-countdown__number">${String(days).padStart(2, '0')}</div>
          <div class="drop-countdown__label">Days</div>
        </div>
        <div class="drop-countdown__segment">
          <div class="drop-countdown__number">${String(hours).padStart(2, '0')}</div>
          <div class="drop-countdown__label">Hours</div>
        </div>
        <div class="drop-countdown__segment">
          <div class="drop-countdown__number">${String(minutes).padStart(2, '0')}</div>
          <div class="drop-countdown__label">Min</div>
        </div>
      </div>
    `;
  }

  _renderMetadata() {
    const items = [];

    // Drop date
    items.push(`
      <div class="drop-card__meta-item">
        <span class="drop-card__meta-label">Drop Date</span>
        <span class="drop-card__meta-value">${escapeHtml(this.data.date)}</span>
      </div>
    `);

    // Limited quantity (if applicable)
    if (this.status === 'limited' || this.status === 'live') {
      const quantity = Math.floor(Math.random() * 200) + 50;
      items.push(`
        <div class="drop-card__meta-item">
          <span class="drop-card__meta-label">Quantity</span>
          <span class="drop-card__meta-value highlight">Only ${quantity} Available</span>
        </div>
      `);
    }

    // Price (for products)
    if (this.type === 'product' && this.data.price) {
      items.push(`
        <div class="drop-card__meta-item">
          <span class="drop-card__meta-label">Price</span>
          <span class="drop-card__meta-value">$${this.data.price}</span>
        </div>
      `);
    }

    // Category/Type
    if (this.data.tags && this.data.tags.length > 0) {
      items.push(`
        <div class="drop-card__meta-item">
          <span class="drop-card__meta-label">Category</span>
          <span class="drop-card__meta-value">${escapeHtml(this.data.tags[0])}</span>
        </div>
      `);
    }

    return items.join('');
  }

  _renderActions() {
    if (this.status === 'sold-out') {
      return `
        <div class="drop-card__actions">
          <button class="drop-card__cta disabled">Sold Out</button>
          <button class="drop-card__notify">Notify on Restock</button>
        </div>
      `;
    }

    if (this.status === 'upcoming' || this.status === 'mystery') {
      return `
        <div class="drop-card__actions">
          <button class="drop-card__cta disabled">Not Yet Available</button>
          <button class="drop-card__notify">Get Notified</button>
        </div>
      `;
    }

    return `
      <div class="drop-card__actions">
        <button class="drop-card__cta" data-open-modal="1" data-item="${encodeURIComponent(JSON.stringify(this.data))}">
          ${this.type === 'product' ? 'Shop Now' : 'View Drop'}
        </button>
      </div>
    `;
  }

  createElement() {
    const card = document.createElement('article');
    card.className = 'drop-card stagger-item';

    const imageClass = this.status === 'mystery' ? 'drop-card__image mystery' : 'drop-card__image';
    const isSoldOut = this.status === 'sold-out';
    const isLimited = this.status === 'limited';

    card.innerHTML = `
      <div class="drop-card__container">
        <!-- Image Section -->
        <div class="drop-card__image-section">
          ${isLimited ? '<div class="drop-limited-badge">Limited Edition</div>' : ''}

          <img
            src="${this.data.image}"
            class="${imageClass}"
            alt="${escapeHtml(this.data.title)}"
            loading="lazy"
            decoding="async"
          />

          ${this.status === 'mystery' ? `
            <div class="drop-mystery-overlay">
              <i data-lucide="lock" class="drop-mystery-overlay__icon"></i>
              <div class="drop-mystery-overlay__text">Unrevealed</div>
            </div>
          ` : ''}

          ${isSoldOut ? `
            <div class="drop-card__sold-out-overlay">
              <div class="drop-card__sold-out-text">Sold Out</div>
            </div>
          ` : ''}
        </div>

        <!-- Content Section -->
        <div class="drop-card__content">
          <div>
            <div class="drop-status-badge ${this.status}">
              <span class="drop-status-badge__dot"></span>
              <span>${this._getStatusText()}</span>
            </div>

            <div class="drop-card__drop-number">Drop #${this.dropNumber}</div>
            <h2 class="drop-card__title">${escapeHtml(this.data.title)}</h2>
            <p class="drop-card__description">${escapeHtml(this.data.description || this.data.excerpt || '')}</p>

            ${this._renderCountdown()}

            <div class="drop-card__metadata">
              ${this._renderMetadata()}
            </div>
          </div>

          ${this._renderActions()}
        </div>
      </div>
    `;

    return card;
  }
}

/* ================================================================
   Utilities for Drop System
================================================================= */
export function createDropCard(data, dropNumber, type = 'project') {
  return new DropCard(data, dropNumber, type).createElement();
}

export function batchCreateDropCards(dataArray, startNumber = 1, type = 'project') {
  return dataArray.map((data, index) =>
    createDropCard(data, startNumber + index, type)
  );
}
