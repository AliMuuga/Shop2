/* Navigation controls: sticky nav, mobile toggle, and link behavior */
const nav = document.getElementById('main-nav');
const navToggle = document.getElementById('nav-toggle');
const navLinks = document.querySelector('.nav-links');

window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 60);
});

navToggle.addEventListener('click', () => {
  navLinks.classList.toggle('open');
});

navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
  });
});

/* Hero slideshow: slides + dot navigation */
const slides = document.querySelectorAll('.slide');
const dots = document.querySelectorAll('.dot');
let current = 0;
let timer;

function goTo(n) {
  slides[current].classList.remove('active');
  dots[current].classList.remove('active');
  current = n;
  slides[current].classList.add('active');
  dots[current].classList.add('active');
}

function next() {
  goTo((current + 1) % slides.length);
}

function startTimer() {
  timer = setInterval(next, 5000);
}

dots.forEach(dot => {
  dot.addEventListener('click', () => {
    clearInterval(timer);
    goTo(parseInt(dot.dataset.index, 10));
    startTimer();
  });
});

startTimer();

const productCards = document.querySelectorAll('.product-card');
const modal = document.getElementById('product-modal');
const modalClose = document.getElementById('modal-close');
const modalCloseText = document.getElementById('modal-close-text');
const modalBackdrop = document.getElementById('modal-backdrop');
const modalTitle = modal.querySelector('.modal-title');
const modalCategory = modal.querySelector('.modal-category');
const modalDescription = modal.querySelector('.modal-description');
const modalPreview = modal.querySelector('.modal-preview');
const sizeSelect = document.getElementById('size-select');
const colorOptions = document.getElementById('color-options');
const modalPrice = document.getElementById('modal-price');
const addToBag = document.getElementById('add-to-bag');
const cartToggle = document.getElementById('cart-toggle');
const cartDrawer = document.getElementById('cart-drawer');
const cartClose = document.getElementById('cart-close');
const cartBackdrop = document.getElementById('cart-backdrop');
const cartItemsElement = document.getElementById('cart-items');
const cartCount = document.getElementById('cart-count');
const cartSummary = document.getElementById('cart-summary');
const cartTotal = document.getElementById('cart-total');
const checkoutOrder = document.getElementById('checkout-order');

let cart = [];

function formatPrice(value) {
  return `R ${value.toFixed(0)}`;
}

function getCartKey(item) {
  return `${item.product}|${item.size}|${item.color}`;
}

function calculateCartTotal() {
  return cart.reduce((sum, item) => sum + item.quantity * item.price, 0);
}

function updateCartSummary() {
  const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  cartCount.textContent = totalCount;
  cartSummary.textContent = `${totalCount} item${totalCount === 1 ? '' : 's'}`;
  cartTotal.textContent = formatPrice(calculateCartTotal());
}

function renderCartItems() {
  if (cart.length === 0) {
    cartItemsElement.innerHTML = '<p class="cart-empty">Your cart is empty. Add a product to get started.</p>';
    return;
  }

  cartItemsElement.innerHTML = cart.map(item => {
    const subtotal = formatPrice(item.price * item.quantity);
    return `
      <div class="cart-item" data-key="${getCartKey(item)}">
        <div class="cart-item-preview">
          <img src="${item.image}" alt="${item.product}" />
        </div>
        <div class="cart-item-copy">
          <p class="cart-item-name">${item.product}</p>
          <p class="cart-item-meta">${item.size} · ${item.color}</p>
          <p class="cart-item-price">${subtotal}</p>
          <div class="cart-item-actions">
            <button type="button" class="qty-btn" data-action="decrease" data-key="${getCartKey(item)}">−</button>
            <span>${item.quantity}</span>
            <button type="button" class="qty-btn" data-action="increase" data-key="${getCartKey(item)}">+</button>
            <button type="button" class="cart-remove" data-key="${getCartKey(item)}">Remove</button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function updateCartUI() {
  updateCartSummary();
  renderCartItems();
}

function addToCart(item) {
  const existingItem = cart.find(cartItem => getCartKey(cartItem) === getCartKey(item));
  if (existingItem) {
    existingItem.quantity += item.quantity;
  } else {
    cart.push(item);
  }
  updateCartUI();
}

function changeCartQuantity(key, delta) {
  const item = cart.find(cartItem => getCartKey(cartItem) === key);
  if (!item) return;
  item.quantity = Math.max(1, item.quantity + delta);
  cart = cart.filter(cartItem => cartItem.quantity > 0);
  updateCartUI();
}

function removeCartItem(key) {
  cart = cart.filter(cartItem => getCartKey(cartItem) !== key);
  updateCartUI();
}

function toggleCartDrawer(open) {
  cartDrawer.classList.toggle('open', open);
  cartDrawer.setAttribute('aria-hidden', open ? 'false' : 'true');
}

cartToggle.addEventListener('click', () => toggleCartDrawer(true));
cartClose.addEventListener('click', () => toggleCartDrawer(false));
cartBackdrop.addEventListener('click', () => toggleCartDrawer(false));
window.addEventListener('keydown', event => {
  if (event.key === 'Escape' && cartDrawer.classList.contains('open')) {
    toggleCartDrawer(false);
  }
});

cartItemsElement.addEventListener('click', event => {
  const button = event.target.closest('button[data-action], button.cart-remove');
  if (!button) return;
  const key = button.dataset.key;
  const action = button.dataset.action;
  if (action === 'increase') changeCartQuantity(key, 1);
  if (action === 'decrease') changeCartQuantity(key, -1);
  if (button.classList.contains('cart-remove')) removeCartItem(key);
});

checkoutOrder.addEventListener('click', () => {
  if (cart.length === 0) {
    alert('Your cart is empty. Add something first.');
    return;
  }
  alert(`Thanks for your order!\nTotal: ${formatPrice(calculateCartTotal())}`);
  cart = [];
  updateCartUI();
  toggleCartDrawer(false);
});

// Open product modal and populate with data from the clicked product card
function openModal(card) {
  const product = card.dataset.product || 'Product';
  const category = card.dataset.category || 'Style';
  const description = card.dataset.description || 'A refined piece from the collection.';
  const price = card.dataset.price || 'R 0';
  const sizes = (card.dataset.sizes || 'One Size').split(',');
  const colors = (card.dataset.colors || 'Black').split(',');

  modalTitle.textContent = product;
  modalCategory.textContent = category;
  modalDescription.textContent = description;
  modalPrice.textContent = price;
  sizeSelect.innerHTML = sizes.map(size => `<option value="${size.trim()}">${size.trim()}</option>`).join('');
  colorOptions.innerHTML = colors.map((color, index) => {
    const safeColor = color.trim();
    const background = `var(--black)`;
    return `<button type="button" class="color-swatch${index === 0 ? ' selected' : ''}" data-color="${safeColor}" style="background: rgba(255,255,255,0.08);">${safeColor}</button>`;
  }).join('');

  // If the product card contains an image, clone it into the modal preview
  const img = card.querySelector('img.product-placeholder');
  modalPreview.innerHTML = '';
  if (img) {
    const clone = img.cloneNode(true);
    clone.classList.add('modal-preview-img');
    modalPreview.appendChild(clone);
  }

  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
}

// Close product modal and restore ARIA state
function closeModal() {
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden', 'true');
}

productCards.forEach(card => {
  card.addEventListener('click', () => openModal(card));
});

modalClose.addEventListener('click', closeModal);
modalCloseText.addEventListener('click', closeModal);
modalBackdrop.addEventListener('click', closeModal);
window.addEventListener('keydown', event => {
  if (event.key === 'Escape' && modal.classList.contains('open')) {
    closeModal();
  }
});

colorOptions.addEventListener('click', event => {
  const button = event.target.closest('.color-swatch');
  if (!button) return;
  colorOptions.querySelectorAll('.color-swatch').forEach(swatch => swatch.classList.remove('selected'));
  button.classList.add('selected');
});

addToBag.addEventListener('click', () => {
  const product = modalTitle.textContent;
  const size = sizeSelect.value;
  const selectedColorButton = colorOptions.querySelector('.color-swatch.selected');
  const color = selectedColorButton ? selectedColorButton.dataset.color : 'Default';
  const price = parseFloat(modalPrice.textContent.replace(/[^0-9.]/g, '')) || 0;
  const img = modalPreview.querySelector('img.modal-preview-img');
  const imageUrl = img ? img.src : '';

  addToCart({
    product,
    category: modalCategory.textContent,
    price,
    size,
    color,
    quantity: 1,
    image: imageUrl,
  });

  addToBag.textContent = 'Added';
  setTimeout(() => { addToBag.textContent = 'Add to Bag'; }, 1200);
});
