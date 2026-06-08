document.addEventListener('DOMContentLoaded', () => {
  
  /* ==========================================================================
     1. HERO SLIDESHOW (UPGRADED DOTS & PLAY/PAUSE CONTROLS)
     ========================================================================== */
  const slides = document.querySelectorAll('.hero-slide');
  const dots = document.querySelectorAll('.ctrl-dot');
  const prevBtn = document.getElementById('prevSlide');
  const nextBtn = document.getElementById('nextSlide');
  const pauseBtn = document.getElementById('pauseSlide');
  const pauseIcon = document.getElementById('pauseIcon');
  
  let currentSlideIndex = 0;
  let slideTimer;
  let isPaused = false;
  const slideDuration = 5000; // Controls the standard slide duration in milliseconds

  // Changes active slide and syncs corresponding layout indicator dot
  function showSlide(targetIndex) {
    if (!slides.length) return;
    
    // Deactivate current slide and dot state values
    slides[currentSlideIndex].classList.remove('active');
    if (dots.length) dots[currentSlideIndex].classList.remove('active');
    
    // Cycle index seamlessly across array margins
    currentSlideIndex = (targetIndex + slides.length) % slides.length;
    
    // Activate new target slide and dot state values
    slides[currentSlideIndex].classList.add('active');
    if (dots.length) dots[currentSlideIndex].classList.add('active');
  }

  function nextSlide() { showSlide(currentSlideIndex + 1); }
  function prevSlide() { showSlide(currentSlideIndex - 1); }

  // Starts the background autoplay tracking interval
  function startSlideShow() {
    clearInterval(slideTimer);
    if (slides.length > 1 && !isPaused) {
      slideTimer = setInterval(nextSlide, slideDuration);
    }
  }

  // Safely resets timer intervals during active user interaction overrides
  function resetSlideTimer() {
    if (!isPaused) {
      startSlideShow();
    }
  }

  // Click interaction hooks for manual navigation arrows
  if (prevBtn && nextBtn) {
    prevBtn.addEventListener('click', () => { prevSlide(); resetSlideTimer(); });
    nextBtn.addEventListener('click', () => { nextSlide(); resetSlideTimer(); });
  }

  // Click interaction hooks for index indicator dots
  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      const index = parseInt(dot.dataset.index, 10);
      showSlide(index);
      resetSlideTimer();
    });
  });

  // Play and Pause automation runtime toggle switcher
  if (pauseBtn && pauseIcon) {
    pauseBtn.addEventListener('click', () => {
      isPaused = !isPaused;
      if (isPaused) {
        clearInterval(slideTimer);
        // Swaps dynamic visual rendering into play symbol format
        pauseIcon.innerHTML = `<polygon points="5 3 19 12 5 21 5 3"/>`;
        pauseBtn.setAttribute('aria-label', 'Play Slideshow');
      } else {
        // Swaps dynamic visual rendering into pause lines format
        pauseIcon.innerHTML = `<line x1="18" y1="4" x2="18" y2="20"/><line x1="6" y1="4" x2="6" y2="20"/>`;
        pauseBtn.setAttribute('aria-label', 'Pause Slideshow');
        startSlideShow();
      }
    });
  }

  // Fire up the slideshow engine on page load
  startSlideShow();

  /* ==========================================================================
     2. STORE STATE (CART & LOGIN DATA MANAGEMENT structures)
     ========================================================================== */
  let shoppingCart = [];
  let currentProductCard = null;
  let userIsLoggedIn = false;

  // Cached DOM selectors mapping object for organized access points
  const ui = {
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
     3. AUDIO EFFECTS SYNTH ENGINE
     ========================================================================== */
  function playCartSound() {
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
      console.warn("Audio Context requires explicit viewport interaction clearance profile.");
    }
  }

  /* ==========================================================================
     4. IDENTITY REGISTRATION CONTROLS & SUB-MODAL UTILITIES
     ========================================================================== */
  function checkPasswordStrength(password) {
    const value = password.trim();
    if (!value) return { label: 'Enter password...', hex: '#8C7662' };
    if (value.length < 6) return { label: 'Too Short', hex: '#9E2A2B' };
    if (/[A-Z]/.test(value) && /[0-9]/.test(value)) return { label: 'Strong Password', hex: '#2F4F25' };
    return { label: 'Medium Strength', hex: '#D35400' };
  }

  if (ui.regPasswordInput) {
    ui.regPasswordInput.addEventListener('input', (e) => {
      const strength = checkPasswordStrength(e.target.value);
      ui.passwordMeterText.textContent = strength.label;
      ui.passwordMeterText.style.color = strength.hex;
    });
  }

  ui.authTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      ui.authTabs.forEach(t => t.classList.remove('active'));
      ui.authViews.forEach(v => v.classList.remove('active'));
      
      tab.classList.add('active');
      const targetView = document.getElementById(tab.dataset.target);
      if (targetView) targetView.classList.add('active');
    });
  });

  const forgotTriggerBtn = document.getElementById('go-forgot');
  const returnToLoginBtn = document.getElementById('back-from-forgot');

  if (forgotTriggerBtn && returnToLoginBtn) {
    forgotTriggerBtn.addEventListener('click', () => {
      ui.authViews.forEach(v => v.classList.remove('active'));
      document.getElementById('forgot-view').classList.add('active');
    });
    returnToLoginBtn.addEventListener('click', () => {
      ui.authViews.forEach(v => v.classList.remove('active'));
      document.getElementById('login-view').classList.add('active');
    });
  }

  function toggleAuthPopup(show) {
    ui.authModal.classList.toggle('open', show);
  }

  ui.authToggle.addEventListener('click', () => {
    if (userIsLoggedIn) {
      userIsLoggedIn = false;
      ui.authToggle.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`;
      alert("Logged out successfully.");
      return;
    }
    toggleAuthPopup(true);
  });

  if (ui.authClose) ui.authClose.addEventListener('click', () => toggleAuthPopup(false));
  if (ui.authBackdrop) ui.authBackdrop.addEventListener('click', () => toggleAuthPopup(false));

  document.querySelectorAll('.security-login-trigger, .security-register-trigger, .recovery-broadcast-trigger, #google-sso-trigger').forEach(trigger => {
    trigger.addEventListener('click', () => {
      userIsLoggedIn = true;
      ui.authToggle.innerHTML = `<span style="font-size:0.7rem; font-weight:600; letter-spacing:0.05em; text-transform:uppercase;">Sign Out</span>`;
      toggleAuthPopup(false);
      alert("Successfully logged in.");
    });
  });

  /* ==========================================================================
     5. DYNAMIC PREVIEW MODAL LOGIC FOR THE CATALOG ITEMS
     ========================================================================== */
  function openProductModal(cardElement) {
    currentProductCard = cardElement;
    
    const product = {
      title: cardElement.dataset.product || 'Item',
      description: cardElement.dataset.description || '',
      priceValue: cardElement.dataset.price || '0',
      sizes: (cardElement.dataset.sizes || 'S,M,L').split(','),
      frontView: cardElement.dataset.front || '',
      backView: cardElement.dataset.back || ''
    };

    ui.modalTitle.textContent = product.title;
    ui.modalDescription.textContent = product.description;
    ui.modalPrice.textContent = `R ${product.priceValue}`;
    ui.modalImage.src = product.frontView;

    // Generates sizing tag layout strings dynamically
    ui.sizeContainer.innerHTML = product.sizes.map((size, idx) => {
      const cleanSize = size.trim();
      return `<button type="button" class="size-token${idx === 0 ? ' active' : ''}" data-size="${cleanSize}">${cleanSize}</button>`;
    }).join('');

    ui.sizeContainer.querySelectorAll('.size-token').forEach(btn => {
      btn.addEventListener('click', () => {
        ui.sizeContainer.querySelectorAll('.size-token').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      });
    });

    // Validates whether back asset metadata parameters exist before building control tabs
    ui.viewOptionsContainer.innerHTML = `
      <button type="button" class="view-toggle active" data-perspective="front">Front View</button>
      ${product.backView ? `<button type="button" class="view-toggle" data-perspective="back">Back View</button>` : ''}
    `;

    ui.viewOptionsContainer.querySelectorAll('.view-toggle').forEach(btn => {
      btn.addEventListener('click', () => {
        ui.viewOptionsContainer.querySelectorAll('.view-toggle').forEach(v => v.classList.remove('active'));
        btn.classList.add('active');
        ui.modalImage.src = btn.dataset.perspective === 'back' ? product.backView : product.frontView;
      });
    });

    ui.modal.classList.add('open');
  }

  function closeProductModal() {
    ui.modal.classList.remove('open');
  }

  ui.cards.forEach(card => card.addEventListener('click', () => openProductModal(card)));
  if (ui.modalClose) ui.modalClose.addEventListener('click', closeProductModal);
  if (ui.modalBackdrop) ui.modalBackdrop.addEventListener('click', closeProductModal);

  /* ==========================================================================
     6. CORE CART TRANSACTION PROCESSING UTILITIES
     ========================================================================== */
  function createCartId(item) {
    return `${item.name}|${item.size}|${item.color}`;
  }

  function getCartTotal() {
    return shoppingCart.reduce((total, item) => total + (item.price * item.quantity), 0);
  }

  // Completely redraws and matches the basket items to runtime modifications
  function updateCartUI() {
    const totalItems = shoppingCart.reduce((total, item) => total + item.quantity, 0);
    ui.cartCounterBadge.textContent = totalItems;
    ui.cartSumTotalElement.textContent = `R ${getCartTotal()}`;

    if (shoppingCart.length === 0) {
      ui.cartItemsContainer.innerHTML = `<p class="cart-empty">Your shopping bag is empty.</p>`;
      return;
    }

    ui.cartItemsContainer.innerHTML = shoppingCart.map(item => {
      return `
        <div class="cart-item">
          <img src="${item.image}" alt="${item.name}">
          <div class="cart-item-copy">
            <p class="cart-item-name">${item.name}</p>
            <p class="cart-item-meta">Size: ${item.size}</p>
            <p class="cart-item-price">R ${item.price * item.quantity}</p>
            <div class="cart-item-actions">
              <button type="button" class="qty-change" data-id="${createCartId(item)}" data-change="-1">−</button>
              <span>${item.quantity}</span>
              <button type="button" class="qty-change" data-id="${createCartId(item)}" data-change="1">+</button>
              <button type="button" class="cart-remove" data-id="${createCartId(item)}">Remove</button>
            </div>
          </div>
        </div>
      `;
    }).join('');

    // Quantity modifiers click tracking events handles incremental steps
    ui.cartItemsContainer.querySelectorAll('.qty-change').forEach(btn => {
      btn.addEventListener('click', () => {
        const itemId = btn.dataset.id;
        const changeAmount = parseInt(btn.dataset.change, 10);
        const cartItem = shoppingCart.find(item => createCartId(item) === itemId);
        
        if (cartItem) {
          cartItem.quantity += changeAmount;
          if (cartItem.quantity <= 0) {
            shoppingCart = shoppingCart.filter(item => createCartId(item) !== itemId);
          }
          updateCartUI();
        }
      });
    });

    // Immediate complete item drop filter trigger
    ui.cartItemsContainer.querySelectorAll('.cart-remove').forEach(btn => {
      btn.addEventListener('click', () => {
        shoppingCart = shoppingCart.filter(item => createCartId(item) !== btn.dataset.id);
        updateCartUI();
      });
    });
  }

  ui.addToBagTrigger.addEventListener('click', () => {
    playCartSound();
    
    const selectedSizeElement = ui.sizeContainer.querySelector('.size-token.active');
    const chosenSize = selectedSizeElement ? selectedSizeElement.dataset.size : 'M';
    const numericPrice = parseFloat(ui.modalPrice.textContent.replace(/[^0-9]/g, '')) || 0;
    
    const newItem = {
      name: ui.modalTitle.textContent,
      price: numericPrice,
      size: chosenSize,
      color: currentProductCard ? (currentProductCard.dataset.colors || 'Stone').split(',')[0].trim() : 'Core',
      image: ui.modalImage.src,
      quantity: 1
    };

    const existingItem = shoppingCart.find(item => createCartId(item) === createCartId(newItem));
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      shoppingCart.push(newItem);
    }

    updateCartUI();
    
    ui.addToBagTrigger.textContent = 'Added!';
    setTimeout(() => { ui.addToBagTrigger.textContent = 'Add To Shopping Bag'; }, 1000);
  });

  function toggleCartDrawer(show) {
    ui.cartDrawer.classList.toggle('open', show);
  }

  ui.cartToggle.addEventListener('click', () => toggleCartDrawer(true));
  if (ui.cartClose) ui.cartClose.addEventListener('click', () => toggleCartDrawer(false));
  if (ui.cartBackdrop) ui.cartBackdrop.addEventListener('click', () => toggleCartDrawer(false));

  /* ==========================================================================
     7. DISPATCH CART ORDER METADATA TO WHATSAPP API GATEWAYS
     ========================================================================== */
  ui.checkoutTrigger.addEventListener('click', () => {
    if (!shoppingCart.length) {
      alert("Your shopping bag is empty!");
      return;
    }

    // Compiles catalog entries into clean, readable text strings
    const messageLines = [
      '⚡ *NEW ORDER - MAJITA STORE* ⚡',
      '________________________________',
      '',
      ...shoppingCart.map(item => `• *${item.quantity}x ${item.name}* \n  Size: ${item.size} \n  Price: R ${item.price * item.quantity}`),
      '________________________________',
      `*TOTAL AMOUNT:* R ${getCartTotal()}`,
      '',
      'Please check if these items are available. Thanks!'
    ];

    const encodedMessage = encodeURIComponent(messageLines.join('\n'));
    window.open(`https://wa.me/27111234567?text=${encodedMessage}`, '_blank');
    
    // Clear out cart instances local state configurations post transmission actions
    shoppingCart = [];
    updateCartUI();
    toggleCartDrawer(false);
  });

  /* ==========================================================================
     8. EXTRA ACCESSIBILITY FRAMEWORKS (KEYBOARD ACCESSIBILITY ESC CLUTCH)
     ========================================================================== */
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeProductModal();
      toggleCartDrawer(false);
      toggleAuthPopup(false);
    }
  });

  // Mobile drawer links mapping handler utilities
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