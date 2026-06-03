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
const modalBackdrop = document.getElementById('modal-backdrop');
const modalTitle = modal.querySelector('.modal-title');
const modalCategory = modal.querySelector('.modal-category');
const modalDescription = modal.querySelector('.modal-description');
const modalPreview = modal.querySelector('.modal-preview');
const sizeSelect = document.getElementById('size-select');
const colorOptions = document.getElementById('color-options');
const modalPrice = document.getElementById('modal-price');
const addToBag = document.getElementById('add-to-bag');

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
  addToBag.textContent = 'Added';
  setTimeout(() => { addToBag.textContent = 'Add to Bag'; }, 1400);
});
