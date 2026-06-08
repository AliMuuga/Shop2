document.addEventListener('DOMContentLoaded', () => {
  
  /* ==========================================================================
     1. CAROUSEL CONTROLLER ENGINE
     ========================================================================== */
  const slides = document.querySelectorAll('.hero-slide');
  const prevBtn = document.getElementById('prevSlide');
  const nextBtn = document.getElementById('nextSlide');
  let currentSlideIndex = 0;
  let automaticSlideTimer;

  function setSlidePosition(targetIndex) {
    if (!slides.length) return;
    slides[currentSlideIndex].classList.remove('active');
    currentSlideIndex = (targetIndex + slides.length) % slides.length;
    slides[currentSlideIndex].classList.add('active');
  }

  function advanceCarouselSlide() { setSlidePosition(currentSlideIndex + 1); }
  function regressCarouselSlide() { setSlidePosition(currentSlideIndex - 1); }

  function initCarouselClock() {
    if (slides.length > 1) {
      automaticSlideTimer = setInterval(advanceCarouselSlide, 5000);
    }
  }

  function flushCarouselClock() {
    clearInterval(automaticSlideTimer);
    initCarouselClock();
  }

  if (prevBtn && nextBtn) {
    prevBtn.addEventListener('click', () => { regressCarouselSlide(); flushCarouselClock(); });
    nextBtn.addEventListener('click', () => { advanceCarouselSlide(); flushCarouselClock(); });
  }

  initCarouselClock();

  /* ==========================================================================
     2. GLOBAL REGISTRY STATE
     ========================================================================== */
  let shoppingBagMatrix = [];
  let activelySelectedProductCard = null;
  let accountAuthorizationState = false;

  const htmlElementRegistry = {
    cards: document.querySelectorAll('.product-card'),
    modal: document.getElementById('product-modal'),
    modalBackdrop: document.getElementById('modal-backdrop'),
    modalClose: document.getElementById('modal-close'),
    modalTitle: document.getElementById('modal-title'),
    modalDescription: document.getElementById('modal-description'),
    modalPrice: document.getElementById('modal-price'),
    modalImage: document.getElementById('modalImage'),
    sizeContainer: document.getElementById('js-size-buttons'),
    viewOptionsContainer: document.getElementById('color-options'),
    addToBagTrigger: document.getElementById('add-to-bag'),
    
    cartToggle: document.getElementById('cart-toggle'),
    cartDrawer: document.getElementById('cart-drawer'),
    cartClose: document.getElementById('cart-close'),
    cartBackdrop: document.getElementById('cart-backdrop'),
    cartItemsContainer: document.getElementById('cart-items'),
    cartCounterBadge: document.getElementById('cart-count'),
    cartSumTotalElement: document.getElementById('cart-total'),
    checkoutTrigger: document.getElementById('checkout-order'),

    authToggle: document.getElementById('auth-toggle'),
    authModal: document.getElementById('auth-modal'),
    authClose: document.getElementById('auth-close'),
    authBackdrop: document.getElementById('auth-backdrop'),
    authTabs: document.querySelectorAll('.auth-tab'),
    authViews: document.querySelectorAll('.auth-view'),
    regPasswordInput: document.getElementById('reg-pass'),
    passwordMeterText: document.getElementById('password-strength')
  };

  /* ==========================================================================
     3. AUDIO SYNTH PACKET PIPELINE (PROCEDURAL REACTION)
     ========================================================================== */
  function dispatchBagInsertionChime() {
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(840, ctx.currentTime);
      gainNode.gain.setValueAtTime(0.12, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
      
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } catch (e) {
      console.warn("Audio processing framework deferred until interaction profile registers.");
    }
  }

  /* ==========================================================================
     4. UNIFIED AUTHENTICATION GATEWAY PIPELINE
     ========================================================================== */
  function assessPasswordKeyStrength(passwordString) {
    const value = passwordString.trim();
    if (!value) return { label: 'Awaiting values...', hex: '#8C7662' };
    if (value.length < 6) return { label: 'Insufficient Sizing Matrix', hex: '#9E2A2B' };
    if (/[A-Z]/.test(value) && /[0-9]/.test(value)) return { label: 'High Security Profile', hex: '#2F4F25' };
    return { label: 'Moderate Metrics', hex: '#D35400' };
  }

  if (htmlElementRegistry.regPasswordInput) {
    htmlElementRegistry.regPasswordInput.addEventListener('input', (e) => {
      const metrics = assessPasswordKeyStrength(e.target.value);
      htmlElementRegistry.passwordMeterText.textContent = metrics.label;
      htmlElementRegistry.passwordMeterText.style.color = metrics.hex;
    });
  }

  htmlElementRegistry.authTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      htmlElementRegistry.authTabs.forEach(t => t.classList.remove('active'));
      htmlElementRegistry.authViews.forEach(v => v.classList.remove('active'));
      
      tab.classList.add('active');
      const targetView = document.getElementById(tab.dataset.target);
      if (targetView) targetView.classList.add('active');
    });
  });

  const forgotTriggerBtn = document.getElementById('go-forgot');
  const returnToLoginBtn = document.getElementById('back-from-forgot');

  if (forgotTriggerBtn && returnToLoginBtn) {
    forgotTriggerBtn.addEventListener('click', () => {
      htmlElementRegistry.authViews.forEach(v => v.classList.remove('active'));
      document.getElementById('forgot-view').classList.add('active');
    });
    returnToLoginBtn.addEventListener('click', () => {
      htmlElementRegistry.authViews.forEach(v => v.classList.remove('active'));
      document.getElementById('login-view').classList.add('active');
    });
  }

  function accessAuthGate(visibilityState) {
    htmlElementRegistry.authModal.classList.toggle('open', visibilityState);
  }

  htmlElementRegistry.authToggle.addEventListener('click', () => {
    if (accountAuthorizationState) {
      accountAuthorizationState = false;
      htmlElementRegistry.authToggle.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`;
      alert("Session terminal disconnected successfully.");
      return;
    }
    accessAuthGate(true);
  });

  if (htmlElementRegistry.authClose) htmlElementRegistry.authClose.addEventListener('click', () => accessAuthGate(false));
  if (htmlElementRegistry.authBackdrop) htmlElementRegistry.authBackdrop.addEventListener('click', () => accessAuthGate(false));

  document.querySelectorAll('.security-login-trigger, .security-register-trigger, .recovery-broadcast-trigger, #google-sso-trigger').forEach(trigger => {
    trigger.addEventListener('click', () => {
      accountAuthorizationState = true;
      htmlElementRegistry.authToggle.innerHTML = `<span style="font-size:0.7rem; font-weight:600; letter-spacing:0.05em; text-transform:uppercase;">Sign Out</span>`;
      accessAuthGate(false);
      alert("Security Token Synchronized successfully.");
    });
  });

  /* ==========================================================================
     5. DYNAMIC INTERACTIVE DETAIL MATRIX MODAL
     ========================================================================== */
  function triggerCatalogueModal(cardElement) {
    activelySelectedProductCard = cardElement;
    
    const context = {
      title: cardElement.dataset.product || 'Archival Piece',
      description: cardElement.dataset.description || '',
      priceValue: cardElement.dataset.price || '0',
      sizeArray: (cardElement.dataset.sizes || 'S,M,L').split(','),
      frontView: cardElement.dataset.front || '',
      backView: cardElement.dataset.back || ''
    };

    htmlElementRegistry.modalTitle.textContent = context.title;
    htmlElementRegistry.modalDescription.textContent = context.description;
    htmlElementRegistry.modalPrice.textContent = `R ${context.priceValue}`;
    htmlElementRegistry.modalImage.src = context.frontView;

    htmlElementRegistry.sizeContainer.innerHTML = context.sizeArray.map((sz, idx) => {
      const cleanSize = sz.trim();
      return `<button type="button" class="size-token${idx === 0 ? ' active' : ''}" data-size="${cleanSize}">${cleanSize}</button>`;
    }).join('');

    htmlElementRegistry.sizeContainer.querySelectorAll('.size-token').forEach(btn => {
      btn.addEventListener('click', () => {
        htmlElementRegistry.sizeContainer.querySelectorAll('.size-token').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      });
    });

    htmlElementRegistry.viewOptionsContainer.innerHTML = `
      <button type="button" class="view-toggle active" data-perspective="front">Front Perspective</button>
      ${context.backView ? `<button type="button" class="view-toggle" data-perspective="back">Back Axis</button>` : ''}
    `;

    htmlElementRegistry.viewOptionsContainer.querySelectorAll('.view-toggle').forEach(btn => {
      btn.addEventListener('click', () => {
        htmlElementRegistry.viewOptionsContainer.querySelectorAll('.view-toggle').forEach(v => v.classList.remove('active'));
        btn.classList.add('active');
        htmlElementRegistry.modalImage.src = btn.dataset.perspective === 'back' ? context.backView : context.frontView;
      });
    });

    htmlElementRegistry.modal.classList.add('open');
  }

  function retractCatalogueModal() {
    htmlElementRegistry.modal.classList.remove('open');
  }

  htmlElementRegistry.cards.forEach(card => card.addEventListener('click', () => triggerCatalogueModal(card)));
  if (htmlElementRegistry.modalClose) htmlElementRegistry.modalClose.addEventListener('click', retractCatalogueModal);
  if (htmlElementRegistry.modalBackdrop) htmlElementRegistry.modalBackdrop.addEventListener('click', retractCatalogueModal);

  /* ==========================================================================
     6. CURATED SHOPPING BAG MATRIX PROCESSING
     ========================================================================== */
  function constructCartCryptographicKey(itemObj) {
    return `${itemObj.productName}|${itemObj.selectedSize}|${itemObj.selectedColor}`;
  }

  function calculateCartAllocationTotal() {
    return shoppingBagMatrix.reduce((acc, currentItem) => acc + (currentItem.unitPrice * currentItem.itemQuantity), 0);
  }

  function synchroniseShoppingBagUserInterface() {
    const aggregateUnitsCount = shoppingBagMatrix.reduce((acc, target) => acc + target.itemQuantity, 0);
    htmlElementRegistry.cartCounterBadge.textContent = aggregateUnitsCount;
    htmlElementRegistry.cartSumTotalElement.textContent = `R ${calculateCartAllocationTotal()}`;

    if (shoppingBagMatrix.length === 0) {
      htmlElementRegistry.cartItemsContainer.innerHTML = `<p class="cart-empty">Your layout space is empty.</p>`;
      return;
    }

    htmlElementRegistry.cartItemsContainer.innerHTML = shoppingBagMatrix.map(item => {
      return `
        <div class="cart-item">
          <img src="${item.previewImageCoordinate}" alt="${item.productName}">
          <div class="cart-item-copy">
            <p class="cart-item-name">${item.productName}</p>
            <p class="cart-item-meta">Size Matrix: ${item.selectedSize} · Natural</p>
            <p class="cart-item-price">R ${item.unitPrice * item.itemQuantity}</p>
            <div class="cart-item-actions">
              <button type="button" class="qty-change" data-key="${constructCartCryptographicKey(item)}" data-offset="-1">−</button>
              <span>${item.itemQuantity}</span>
              <button type="button" class="qty-change" data-key="${constructCartCryptographicKey(item)}" data-offset="1">+</button>
              <button type="button" class="cart-remove" data-key="${constructCartCryptographicKey(item)}">Remove</button>
            </div>
          </div>
        </div>
      `;
    }).join('');

    htmlElementRegistry.cartItemsContainer.querySelectorAll('.qty-change').forEach(changeBtn => {
      changeBtn.addEventListener('click', () => {
        const uniqueKey = changeBtn.dataset.key;
        const transformDelta = parseInt(changeBtn.dataset.offset, 10);
        const activeTargetMatch = shoppingBagMatrix.find(i => constructCartCryptographicKey(i) === uniqueKey);
        
        if (activeTargetMatch) {
          activeTargetMatch.itemQuantity += transformDelta;
          if (activeTargetMatch.itemQuantity <= 0) {
            shoppingBagMatrix = shoppingBagMatrix.filter(i => constructCartCryptographicKey(i) !== uniqueKey);
          }
          synchroniseShoppingBagUserInterface();
        }
      });
    });

    htmlElementRegistry.cartItemsContainer.querySelectorAll('.cart-remove').forEach(removeBtn => {
      removeBtn.addEventListener('click', () => {
        shoppingBagMatrix = shoppingBagMatrix.filter(i => constructCartCryptographicKey(i) !== removeBtn.dataset.key);
        synchroniseShoppingBagUserInterface();
      });
    });
  }

  htmlElementRegistry.addToBagTrigger.addEventListener('click', () => {
    dispatchBagInsertionChime();
    
    const sizeActiveSelection = htmlElementRegistry.sizeContainer.querySelector('.size-token.active');
    const computedSizeValue = sizeActiveSelection ? sizeActiveSelection.dataset.size : 'M';
    const computedPriceInteger = parseFloat(htmlElementRegistry.modalPrice.textContent.replace(/[^0-9]/g, '')) || 0;
    
    const blueprintItemPacket = {
      productName: htmlElementRegistry.modalTitle.textContent,
      unitPrice: computedPriceInteger,
      selectedSize: computedSizeValue,
      selectedColor: activelySelectedProductCard ? (activelySelectedProductCard.dataset.colors || 'Stone').split(',')[0].trim() : 'Core',
      previewImageCoordinate: htmlElementRegistry.modalImage.src,
      itemQuantity: 1
    };

    const identicalMatchInstance = shoppingBagMatrix.find(i => constructCartCryptographicKey(i) === constructCartCryptographicKey(blueprintItemPacket));
    if (identicalMatchInstance) {
      identicalMatchInstance.itemQuantity += 1;
    } else {
      shoppingBagMatrix.push(blueprintItemPacket);
    }

    synchroniseShoppingBagUserInterface();
    
    htmlElementRegistry.addToBagTrigger.textContent = 'Piece Secured';
    setTimeout(() => { htmlElementRegistry.addToBagTrigger.textContent = 'Secure To Bag Layout'; }, 1000);
  });

  function modifyCartDrawerState(openActionFlag) {
    htmlElementRegistry.cartDrawer.classList.toggle('open', openActionFlag);
  }

  htmlElementRegistry.cartToggle.addEventListener('click', () => modifyCartDrawerState(true));
  if (htmlElementRegistry.cartClose) htmlElementRegistry.cartClose.addEventListener('click', () => modifyCartDrawerState(false));
  if (htmlElementRegistry.cartBackdrop) htmlElementRegistry.cartBackdrop.addEventListener('click', () => modifyCartDrawerState(false));

  /* ==========================================================================
     7. WHATSAPP STRATIFIED ORDER CONSTRUCTOR DISPATCH
     ========================================================================== */
  htmlElementRegistry.checkoutTrigger.addEventListener('click', () => {
    if (!shoppingBagMatrix.length) {
      alert("Your order space requires values before transaction routing.");
      return;
    }

    const textualMessageLines = [
      '⚡ *NEW ORDER TRANSMISSION - MAJITA ARCHIVAL LABS* ⚡',
      '________________________________',
      '',
      ...shoppingBagMatrix.map(item => `• *${item.itemQuantity}x ${item.productName}* \n  Size Variant: ${item.selectedSize} \n  Subtotal: R ${item.unitPrice * item.itemQuantity}`),
      '________________________________',
      `*TOTAL:* R ${calculateCartAllocationTotal()}`,
      '',
      'Please verify production stock availability parameters.'
    ];

    const encodedStringCoordinate = encodeURIComponent(textualMessageLines.join('\n'));
    window.open(`https://wa.me/27111234567?text=${encodedStringCoordinate}`, '_blank');
    
    shoppingBagMatrix = [];
    synchroniseShoppingBagUserInterface();
    modifyCartDrawerState(false);
  });

  /* ==========================================================================
     8. GLOBAL ACCESSIBILITY CONTROLS
     ========================================================================== */
  window.addEventListener('keydown', (eventToken) => {
    if (eventToken.key === 'Escape') {
      retractCatalogueModal();
      modifyCartDrawerState(false);
      accessAuthGate(false);
    }
  });

  // Mobile navigation drawer toggle interaction
  const mobileToggle = document.getElementById('mobile-menu-toggle');
  const navLinksList = document.querySelector('.nav-links');
  if (mobileToggle && navLinksList) {
    mobileToggle.addEventListener('click', () => {
      const isVisible = window.getComputedStyle(navLinksList).display !== 'none';
      navLinksList.style.display = isVisible ? 'none' : 'flex';
      navLinksList.style.flexDirection = 'column';
      navLinksList.style.position = 'absolute';
      navLinksList.style.top = '100%';
      navLinksList.style.left = '0';
      navLinksList.style.width = '100%';
      navLinksList.style.background = 'var(--palette-cream)';
      navLinksList.style.padding = '2rem';
    });
  }
});