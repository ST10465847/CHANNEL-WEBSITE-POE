// ======= GLOBAL STATE ======= //
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let currentPopupItems = [];
let currentPopupIndex = 0;

// ======= INIT ON DOM READY ======= //
document.addEventListener('DOMContentLoaded', () => {
  initContactForm();
  initLightbox();
  initShoppingCart();
  initEnhancedPopup();
  updateCartUI();
});

// ======== ENHANCED POPUP ========== //
function initEnhancedPopup() {
  // Initialize all collection items with enhanced popup
  document.querySelectorAll('.collection-item, .campaign-item, .gallery-item').forEach((item, index) => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      // Get all items in the current section
      const section = item.closest('.campaigns, .collection-grid');
      const items = section ? Array.from(section.querySelectorAll('.collection-item, .campaign-item, .gallery-item')) : [item];
      
      // Get product information
      const name = item.querySelector('.campaign-name')?.innerText || 'Product';
      const price = item.querySelector('.product-price')?.innerText || 'Price on request';
      const image = item.querySelector('img')?.src || '';
      
      // Create product data
      const productData = {
        name: name,
        price: price,
        image: image,
        description: getProductDescription(name)
      };
      
      // Show enhanced popup
      showEnhancedPopup([productData], 0);
    });
  });

  // Close popup events
  document.querySelector('.enhanced-popup-close').addEventListener('click', closeEnhancedPopup);
  document.querySelector('.enhanced-popup').addEventListener('click', (e) => {
    if (e.target === document.querySelector('.enhanced-popup')) {
      closeEnhancedPopup();
    }
  });

  // Navigation events
  document.querySelector('.enhanced-popup-prev').addEventListener('click', showPrevPopup);
  document.querySelector('.enhanced-popup-next').addEventListener('click', showNextPopup);

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    const popup = document.querySelector('.enhanced-popup');
    if (popup && popup.classList.contains('active')) {
      if (e.key === 'Escape') closeEnhancedPopup();
      if (e.key === 'ArrowLeft') showPrevPopup();
      if (e.key === 'ArrowRight') showNextPopup();
    }
  });
}

function showEnhancedPopup(items, index) {
  currentPopupItems = items;
  currentPopupIndex = index;
  
  const popup = document.querySelector('.enhanced-popup');
  const img = document.querySelector('.enhanced-popup-img');
  const name = document.querySelector('.enhanced-popup-name');
  const price = document.querySelector('.enhanced-popup-price');
  const description = document.querySelector('.enhanced-popup-description');
  
  const currentItem = items[index];
  
  img.src = currentItem.image;
  img.alt = currentItem.name;
  name.textContent = currentItem.name;
  price.textContent = currentItem.price;
  description.textContent = currentItem.description;
  
  // Update navigation visibility
  document.querySelector('.enhanced-popup-prev').style.display = 
    items.length > 1 ? 'flex' : 'none';
  document.querySelector('.enhanced-popup-next').style.display = 
    items.length > 1 ? 'flex' : 'none';
  
  popup.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeEnhancedPopup() {
  document.querySelector('.enhanced-popup').classList.remove('active');
  document.body.style.overflow = '';
  currentPopupItems = [];
  currentPopupIndex = 0;
}

function showPrevPopup() {
  if (currentPopupItems.length > 1) {
    currentPopupIndex = (currentPopupIndex - 1 + currentPopupItems.length) % currentPopupItems.length;
    showEnhancedPopup(currentPopupItems, currentPopupIndex);
  }
}

function showNextPopup() {
  if (currentPopupItems.length > 1) {
    currentPopupIndex = (currentPopupIndex + 1) % currentPopupItems.length;
    showEnhancedPopup(currentPopupItems, currentPopupIndex);
  }
}

function getProductDescription(productName) {
  const descriptions = {
    'LUXURY DRESS': 'Elegant and sophisticated dress crafted from premium materials with exquisite detailing.',
    'TAILORED SUIT': 'Expertly tailored suit featuring premium fabrics and impeccable craftsmanship.',
    'LEATHER JACKET': 'Luxurious leather jacket with superior craftsmanship and timeless design.',
    'CHANEL N°5': 'Iconic fragrance that embodies timeless elegance and sophisticated femininity.',
    'LUXURY MAKEUP': 'High-performance makeup collection with luxurious textures and long-lasting wear.',
    'SKINCARE SET': 'Comprehensive skincare regimen featuring advanced formulations for radiant skin.',
    'COCO MADEMOISELLE': 'Modern, fresh fragrance with vibrant and sophisticated character.',
    'ACCESSORIES': 'Elegant accessories designed to complement your sophisticated style.',
    'HANDBAG': 'Luxurious handbag crafted with premium materials and iconic Chanel design.',
    'FOOTWEAR': 'Exquisite footwear combining comfort with unparalleled style and craftsmanship.',
    'LUXURY WATCHES': 'Precision timepieces featuring elegant design and superior Swiss craftsmanship.'
  };
  
  return descriptions[productName] || 'A luxurious Chanel product featuring exceptional quality and timeless design.';
}

// ======== SHOPPING CART ========== //
function initShoppingCart() {
  // Add to cart from popup
  document.querySelector('.add-to-cart-popup').addEventListener('click', addCurrentItemToCart);
  
  // Add to cart from collection items
  document.querySelectorAll('.collection-item, .campaign-item').forEach(item => {
    item.addEventListener('click', (e) => {
      if (e.target.classList.contains('add-to-cart-btn')) return;
      
      const name = item.querySelector('.campaign-name')?.innerText || 'Item';
      const priceText = item.querySelector('.product-price')?.innerText || 'R0.00';
      const price = parseFloat(priceText.replace(/[R,]/g, ''));
      const image = item.querySelector('img')?.src || '';
      
      addItemToCart({ name, price, image });
    });
  });

  document.querySelector('.cart-icon')?.addEventListener('click', toggleCart);
  document.querySelector('.close-cart')?.addEventListener('click', toggleCart);
  document.querySelector('.checkout-btn')?.addEventListener('click', checkout);
}

function addCurrentItemToCart() {
  if (currentPopupItems.length > 0) {
    const currentItem = currentPopupItems[currentPopupIndex];
    const price = parseFloat(currentItem.price.replace(/[R,]/g, ''));
    
    addItemToCart({
      name: currentItem.name,
      price: price || 100, // Default price if parsing fails
      image: currentItem.image
    });
    
    showNotification(`🛍️ ${currentItem.name} added to cart!`, 'success');
  }
}

function addItemToCart(item) {
  cart.push(item);
  saveCart();
  updateCartUI();
  showNotification(`🛍️ ${item.name} added to cart!`, 'success');
}

function removeItemFromCart(index) {
  const removed = cart.splice(index, 1);
  saveCart();
  updateCartUI();
  showNotification(`🗑️ Removed ${removed[0].name} from cart`, 'info');
}

function saveCart() {
  localStorage.setItem('cart', JSON.stringify(cart));
}

function updateCartUI() {
  const badge = document.querySelector('.cart-count');
  if (badge) badge.innerText = cart.length;

  const listContainer = document.querySelector('.cart-items');
  const totalContainer = document.querySelector('.cart-total h4');
  if (!listContainer || !totalContainer) return;

  listContainer.innerHTML = '';
  let total = 0;

  cart.forEach((item, index) => {
    total += item.price;
    const itemDiv = document.createElement('div');
    itemDiv.className = 'cart-item';
    itemDiv.innerHTML = `
      <img src="${item.image}" class="cart-item-img" alt="${item.name}">
      <div class="cart-item-details">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-price">R${item.price.toFixed(2)}</div>
      </div>
      <button class="remove-item" data-index="${index}">×</button>
    `;
    listContainer.appendChild(itemDiv);
  });

  totalContainer.innerText = `Total: R${total.toFixed(2)}`;

  listContainer.querySelectorAll('.remove-item').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.dataset.index);
      removeItemFromCart(idx);
    });
  });
}

function toggleCart() {
  document.querySelector('.cart-sidebar')?.classList.toggle('active');
}

function checkout() {
  if (cart.length === 0) {
    showNotification('🛒 Your cart is empty!', 'error');
    return;
  }
  
  showNotification('✅ Checkout successful! Thank you for your purchase.', 'success');
  cart = [];
  saveCart();
  updateCartUI();
  toggleCart();
}

// ======== CONTACT FORM ========== //
function initContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  form.addEventListener('submit', e => {
    e.preventDefault();
    if (validateForm(form)) {
      document.getElementById('confirmationMessage').style.display = 'block';
      form.reset();
      clearErrors(form);
      document.getElementById('confirmationMessage').scrollIntoView({ behavior: 'smooth' });
      showNotification('✅ Your message has been sent! We will contact you soon.', 'success');
    } else {
      showNotification('❌ Please fix the errors in the form.', 'error');
    }
  });
}

function validateForm(form) {
  let valid = true;
  clearErrors(form);
  const requiredFields = form.querySelectorAll('[required]');
  requiredFields.forEach(field => {
    if (!field.value.trim()) {
      showError(field, 'This field is required');
      valid = false;
    } else if (field.type === 'email' && !isValidEmail(field.value.trim())) {
      showError(field, 'Invalid email address');
      valid = false;
    } else if (field.type === 'tel' && !isValidPhone(field.value.trim())) {
      showError(field, 'Invalid phone number');
      valid = false;
    }
  });
  return valid;
}

function showError(input, message) {
  input.classList.add('error');
  const errorDiv = document.createElement('div');
  errorDiv.className = 'error-message';
  errorDiv.innerText = message;
  input.parentNode.appendChild(errorDiv);
}

function clearErrors(form) {
  form.querySelectorAll('.error-message').forEach(node => node.remove());
  form.querySelectorAll('.error').forEach(node => node.classList.remove('error'));
}

const isValidEmail = email => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const isValidPhone = phone => /^[+]?[1-9][\d\s\-\(\)]{7,15}$/.test(phone);

// ======== LIGHTBOX ========== //
function initLightbox() {
  // Keep lightbox for gallery images if needed, but enhanced popup is primary
}

// ======== NOTIFICATIONS ======= //
function showNotification(message, type='info') {
  const notif = document.createElement('div');
  notif.className = 'notification';
  notif.innerHTML = message;
  if (type === 'success') {
    notif.style.borderLeft = '4px solid #4caf50';
  } else if (type === 'error') {
    notif.style.borderLeft = '4px solid #f44336';
  } else {
    notif.style.borderLeft = '4px solid #ffd700';
  }

  document.body.appendChild(notif);
  setTimeout(() => notif.classList.add('show'), 100);
  setTimeout(() => {
    notif.classList.remove('show');
    setTimeout(() => notif.remove(), 500);
  }, 3000);
}
// ======== LIGHTBOX ========== //
function initLightbox() {
  // Initialize lightbox for gallery images
  document.querySelectorAll('.gallery-img, .campaign-img, .collection-img').forEach((img, index) => {
    img.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      // Get all images in the current section for navigation
      const section = img.closest('.campaigns, .collection-grid, .gallery-grid');
      const images = section ? 
        Array.from(section.querySelectorAll('.gallery-img, .campaign-img, .collection-img')) : 
        [img];
      
      const currentIndex = images.indexOf(img);
      
      showLightbox(images, currentIndex);
    });
  });

  // Lightbox navigation
  document.addEventListener('keydown', (e) => {
    const lightbox = document.querySelector('.lightbox');
    if (lightbox && lightbox.style.display === 'flex') {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') navigateLightbox('prev');
      if (e.key === 'ArrowRight') navigateLightbox('next');
    }
  });

  // Close lightbox when clicking outside image
  document.querySelector('.lightbox').addEventListener('click', (e) => {
    if (e.target === document.querySelector('.lightbox')) {
      closeLightbox();
    }
  });
}

function showLightbox(images, startIndex = 0) {
  const lightbox = document.querySelector('.lightbox');
  const lightboxImg = document.querySelector('.lightbox-content');
  const prevBtn = document.querySelector('.lightbox-prev');
  const nextBtn = document.querySelector('.lightbox-next');
  
  let currentIndex = startIndex;
  
  function updateImage() {
    lightboxImg.src = images[currentIndex].src;
    lightboxImg.alt = images[currentIndex].alt;
    
    // Update navigation button visibility
    prevBtn.style.display = images.length > 1 ? 'block' : 'none';
    nextBtn.style.display = images.length > 1 ? 'block' : 'none';
  }
  
  function navigate(direction) {
    if (direction === 'prev') {
      currentIndex = (currentIndex - 1 + images.length) % images.length;
    } else {
      currentIndex = (currentIndex + 1) % images.length;
    }
    updateImage();
  }
  
  // Set up navigation
  prevBtn.onclick = () => navigate('prev');
  nextBtn.onclick = () => navigate('next');
  
  // Update image and show lightbox
  updateImage();
  lightbox.style.display = 'flex';
  document.body.style.overflow = 'hidden';
  
  // Store current navigation function for external access
  window.currentLightboxNavigate = navigate;
}

function navigateLightbox(direction) {
  if (window.currentLightboxNavigate) {
    window.currentLightboxNavigate(direction);
  }
}

function closeLightbox() {
  const lightbox = document.querySelector('.lightbox');
  lightbox.style.display = 'none';
  document.body.style.overflow = '';
  window.currentLightboxNavigate = null;
}