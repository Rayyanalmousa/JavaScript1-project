/* ==========================================
   AURAMART POS - OOP VERSION
   Vanilla JavaScript
========================================== */

// ==========================================
// PRODUCT CLASS
// OOP: Class, Constructor, this, Methods
// ==========================================

class Product {
  constructor(id, name, price, category, icon, style) {
    this.id = id;
    this.name = name;
    this.price = price;
    this.category = category;
    this.icon = icon;
    this.style = style;
  }

  getVisualHTML() {
    return escapeHTML(this.icon);
  }
}

// ==========================================
// CUSTOM PRODUCT
// OOP: Inheritance and Polymorphism
// ==========================================

class CustomProduct extends Product {
  constructor(id, name, price, image) {
    super(id, name, price, "Custom", "🛍️", "custom");
    this.image = image;
  }

  getVisualHTML() {
    if (this.image) {
      return `<img class="product-image"
        src="${escapeHTML(this.image)}" alt="">`;
    }

    return escapeHTML(this.icon);
  }
}

// ==========================================
// PRODUCTS
// OOP: Objects created using new
// ==========================================

const products = [
  new Product(1, "Fresh Apple", 0.8, "Fruits", "🍎", "apple"),
  new Product(2, "Banana", 0.5, "Fruits", "🍌", "banana"),
  new Product(3, "Orange", 0.7, "Fruits", "🍊", "orange"),
  new Product(4, "Milk", 1.5, "Dairy", "🥛", "milk"),
  new Product(5, "Bread", 1, "Bakery", "🍞", "bread"),
  new Product(6, "Eggs (6)", 2.5, "Dairy", "🥚", "eggs"),
  new Product(7, "Cola", 1.2, "Drinks", "🥤", "cola"),
  new Product(8, "Potato Chips", 1.8, "Snacks", "🍿", "chips"),
  new Product(9, "Tomato", 0.6, "Vegetables", "🍅", "tomato"),
  new Product(10, "Potato", 0.4, "Vegetables", "🥔", "potato"),
  new Product(11, "Cheese", 3.5, "Dairy", "🧀", "cheese"),
  new Product(12, "Water", 0.5, "Drinks", "💧", "water"),
];

// ==========================================
// ORDER LINE
// OOP: Composition
// ==========================================

class OrderLine {
  constructor(product, quantity = 1) {
    this.product = product;
    this.quantity = quantity;
  }

  getSubtotal() {
    return this.product.price * this.quantity;
  }
}

// ==========================================
// ORDER CLASS
// OOP: Encapsulation, Composition, Abstraction
// ==========================================

class Order {
  #lines = [];

  getLines() {
    return this.#lines;
  }

  /*
  OLD CODE USING find():

  const existing = cart.find(
    (item) => item.id === product.id
  );
  */

  findLine(id) {
    for (let i = 0; i < this.#lines.length; i++) {
      if (this.#lines[i].product.id === Number(id)) {
        return this.#lines[i];
      }
    }

    return null;
  }

  addProduct(product) {
    const existing = this.findLine(product.id);

    if (existing) {
      existing.quantity += 1;
    } else {
      this.#lines.push(new OrderLine(product));
    }
  }

  increaseQuantity(id) {
    const line = this.findLine(id);

    if (line) {
      line.quantity += 1;
    }
  }

  decreaseQuantity(id) {
    const line = this.findLine(id);

    if (!line) {
      return;
    }

    line.quantity -= 1;

    if (line.quantity <= 0) {
      this.removeProduct(id);
    }
  }

  /*
  OLD CODE USING filter():

  cart = cart.filter(
    (item) => item.id !== Number(id)
  );
  */

  removeProduct(id) {
    const updatedLines = [];

    for (let i = 0; i < this.#lines.length; i++) {
      if (this.#lines[i].product.id !== Number(id)) {
        updatedLines.push(this.#lines[i]);
      }
    }

    this.#lines = updatedLines;
  }

  clear() {
    this.#lines = [];
  }

  isEmpty() {
    return this.#lines.length === 0;
  }

  /*
  OLD CODE USING reduce():

  const count = cart.reduce(
    (sum, item) => sum + item.quantity, 0
  );

  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity, 0
  );
  */

  getTotals() {
    let count = 0;
    let subtotal = 0;

    for (let i = 0; i < this.#lines.length; i++) {
      const line = this.#lines[i];

      count += line.quantity;
      subtotal += line.getSubtotal();
    }

    const discount = subtotal > 100 ? subtotal * 0.1 : 0;
    const total = subtotal - discount;

    return {
      count: count,
      subtotal: subtotal,
      discount: discount,
      total: total,
    };
  }

  getPurchasedItems() {
    const items = [];

    for (let i = 0; i < this.#lines.length; i++) {
      const line = this.#lines[i];

      items.push({
        id: line.product.id,
        name: line.product.name,
        price: line.product.price,
        quantity: line.quantity,
      });
    }

    return items;
  }
}

// ==========================================
// DOM ELEMENTS
// ==========================================

const productGrid = document.getElementById("productGrid");
const cartItems = document.getElementById("cartItems");
const searchInput = document.getElementById("searchInput");
const amountPaid = document.getElementById("amountPaid");
const statusMessage = document.getElementById("statusMessage");
const receiptModal = document.getElementById("receiptModal");
const clearConfirmModal = document.getElementById("clearConfirmModal");
const customProductModal = document.getElementById("customProductModal");
const customImageInput = document.getElementById("customImage");
const customImagePreview = document.getElementById("customImagePreview");
const historyModal = document.getElementById("historyModal");

// ==========================================
// APPLICATION DATA
// ==========================================

const order = new Order();
const saleHistory = [];

let activeCategory = "All";
let compactMode = false;
let nextProductId = 13;
let customImageData = "";

// ==========================================
// HELPER FUNCTIONS
// ==========================================

function money(value) {
  return `$${value.toFixed(2)}`;
}

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, (char) => {
    const characters = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };

    return characters[char];
  });
}

// ==========================================
// FIND PRODUCT
// ==========================================

/*
OLD CODE:

const product = products.find(
  (item) => item.id === Number(id)
);
*/

function findProduct(id) {
  for (let i = 0; i < products.length; i++) {
    if (products[i].id === Number(id)) {
      return products[i];
    }
  }

  return null;
}

// ==========================================
// DISPLAY PRODUCTS
// ==========================================

/*
OLD CODE USING filter():

const filtered = products.filter((product) => {
  const matchesCategory =
    activeCategory === "All" ||
    product.category === activeCategory;

  const matchesSearch =
    product.name.toLowerCase().includes(query) ||
    product.category.toLowerCase().includes(query);

  return matchesCategory && matchesSearch;
});
*/

function displayProducts() {
  const query = searchInput.value.trim().toLowerCase();
  const filtered = [];

  for (let i = 0; i < products.length; i++) {
    const product = products[i];

    const matchesCategory =
      activeCategory === "All" || product.category === activeCategory;

    const matchesSearch =
      product.name.toLowerCase().includes(query) ||
      product.category.toLowerCase().includes(query);

    if (matchesCategory && matchesSearch) {
      filtered.push(product);
    }
  }

  document.querySelector(".product-count").textContent = `${filtered.length} ${
    filtered.length === 1 ? "Product" : "Products"
  }`;

  productGrid.innerHTML = filtered.length
    ? filtered
        .map(
          (product, index) => `
      <article class="product-card"
        data-category="${escapeHTML(product.category)}"
        style="--card-index:${index}">

        <div class="product-visual ${escapeHTML(product.style)}"
          aria-hidden="true">
          ${product.getVisualHTML()}
        </div>

        <h3>${escapeHTML(product.name)}</h3>

        <p class="product-price">
          ${money(product.price)}
          <small>/ item</small>
        </p>

        <button class="add-btn"
          data-id="${product.id}" type="button">
          <span aria-hidden="true">＋</span>
          Add to order
        </button>
      </article>
    `
        )
        .join("")
    : `
      <div class="no-results">
        <span>🔎</span>
        <strong>No products found</strong>
        <p>Try another search or category.</p>
      </div>
    `;
}

// ==========================================
// RENDER CART
// ==========================================

function renderCart() {
  const totals = order.getTotals();
  const lines = order.getLines();

  document.getElementById("orderCount").textContent = `${totals.count} ${
    totals.count === 1 ? "item" : "items"
  }`;

  document.getElementById("totalItems").textContent = totals.count;
  document.getElementById("subtotal").textContent = money(totals.subtotal);
  document.getElementById("discount").textContent = money(totals.discount);
  document.getElementById("finalTotal").textContent = money(totals.total);

  document.getElementById("changeAmount").textContent = money(
    Math.max(0, Number(amountPaid.value || 0) - totals.total)
  );

  document.getElementById("completeSaleBtn").disabled = order.isEmpty();

  cartItems.innerHTML = lines.length
    ? lines
        .map(
          (line) => `
      <div class="cart-row">

        <div>
          <div class="cart-product-name">
            ${escapeHTML(line.product.name)}
          </div>
          <div class="cart-unit-price">
            ${money(line.product.price)} each
          </div>
        </div>

        <div class="quantity-control">
          <button class="qty-btn"
            data-action="decrease"
            data-id="${line.product.id}"
            aria-label="Decrease ${escapeHTML(line.product.name)} quantity">
            −
          </button>

          <span>${line.quantity}</span>

          <button class="qty-btn"
            data-action="increase"
            data-id="${line.product.id}"
            aria-label="Increase ${escapeHTML(line.product.name)} quantity">
            +
          </button>
        </div>

        <div class="cart-line-total">
          ${money(line.getSubtotal())}
        </div>

        <button class="remove-btn"
          data-action="remove"
          data-id="${line.product.id}"
          aria-label="Remove ${escapeHTML(line.product.name)}">
          ×
        </button>

      </div>
    `
        )
        .join("")
    : `
      <div class="empty-cart">
        <div class="empty-icon">🛒</div>
        <h3>Your order is empty</h3>
        <p>Select a product to start a sale.</p>
      </div>
    `;
}

// ==========================================
// CLEAR ORDER
// ==========================================

function clearOrder() {
  order.clear();
  amountPaid.value = "";
  statusMessage.textContent = "Order cleared.";
  renderCart();
}

// ==========================================
// PRODUCT ANIMATION
// ==========================================

function animateProductToCart(id, sourceButton) {
  if (
    !sourceButton ||
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  ) {
    return;
  }

  const visual = sourceButton
    .closest(".product-card")
    ?.querySelector(".product-visual");

  const cartTarget = document.querySelector(".order-header h2");

  if (!visual || !cartTarget) {
    return;
  }

  const start = visual.getBoundingClientRect();
  const end = cartTarget.getBoundingClientRect();
  const flyer = visual.cloneNode(true);

  flyer.classList.add("product-flyer");

  flyer.style.left = `${start.left}px`;
  flyer.style.top = `${start.top}px`;
  flyer.style.width = `${start.width}px`;
  flyer.style.height = `${start.height}px`;

  flyer.style.setProperty(
    "--fly-x",
    `${end.left + end.width / 2 - (start.left + start.width / 2)}px`
  );

  flyer.style.setProperty(
    "--fly-y",
    `${end.top + end.height / 2 - (start.top + start.width / 2)}px`
  );

  // Correct target movement for the animation
  flyer.style.setProperty(
    "--fly-y",
    `${end.top + end.height / 2 - (start.top + start.height / 2)}px`
  );

  flyer.style.setProperty(
    "--fly-rotate",
    `${start.left < end.left ? "12deg" : "-12deg"}`
  );

  document.body.appendChild(flyer);

  flyer.addEventListener(
    "animationend",
    () => {
      flyer.remove();
    },
    { once: true }
  );

  window.setTimeout(() => flyer.remove(), 850);
}

// ==========================================
// ADD PRODUCT TO CART
// ==========================================

function addToCart(id, sourceButton) {
  const product = findProduct(id);

  if (!product) {
    return;
  }

  animateProductToCart(id, sourceButton);

  order.addProduct(product);

  const cartTitle = document.querySelector(".order-header h2");

  if (cartTitle) {
    cartTitle.classList.remove("cart-arrival");
    void cartTitle.offsetWidth;
    cartTitle.classList.add("cart-arrival");
  }

  statusMessage.textContent = `${product.name} added to order`;

  renderCart();

  window.setTimeout(() => {
    if (statusMessage.textContent === `${product.name} added to order`) {
      statusMessage.textContent = "";
    }
  }, 1800);
}

// ==========================================
// MODALS
// ==========================================

function showModal(modal) {
  modal.classList.remove("hidden");
  modal.querySelector("input")?.focus();
}

function hideModal(modal) {
  modal.classList.add("hidden");
}

// ==========================================
// ADD BUTTON EVENT
// ==========================================

productGrid.addEventListener("click", (event) => {
  const button = event.target.closest(".add-btn");

  if (button) {
    addToCart(button.dataset.id, button);
  }
});

// ==========================================
// CART BUTTON EVENTS
// ==========================================

cartItems.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-action]");

  if (!button) {
    return;
  }

  const id = Number(button.dataset.id);

  if (button.dataset.action === "increase") {
    order.increaseQuantity(id);
  }

  if (button.dataset.action === "decrease") {
    order.decreaseQuantity(id);
  }

  if (button.dataset.action === "remove") {
    order.removeProduct(id);
  }

  renderCart();
});

// ==========================================
// CATEGORIES
// ==========================================

document.getElementById("categories").addEventListener("click", (event) => {
  const button = event.target.closest(".category-btn");

  if (!button) {
    return;
  }

  activeCategory = button.dataset.category;

  /*
  OLD CODE USING forEach():

  document.querySelectorAll(".category-btn").forEach(
    (item) => item.classList.toggle("active", item === button)
  );
  */

  const buttons = document.querySelectorAll(".category-btn");

  for (let i = 0; i < buttons.length; i++) {
    buttons[i].classList.toggle("active", buttons[i] === button);
  }

  displayProducts();
});

// ==========================================
// SEARCH AND PAYMENT INPUTS
// ==========================================

searchInput.addEventListener("input", displayProducts);
amountPaid.addEventListener("input", renderCart);

// ==========================================
// CLEAR CONFIRMATION
// ==========================================

document.getElementById("clearBtn").addEventListener("click", () => {
  showModal(clearConfirmModal);
});

document.getElementById("confirmClearBtn").addEventListener("click", () => {
  clearOrder();
  hideModal(clearConfirmModal);
});

document.getElementById("cancelClearBtn").addEventListener("click", () => {
  hideModal(clearConfirmModal);
});

// ==========================================
// COMPACT VIEW
// ==========================================

document.getElementById("viewBtn").addEventListener("click", (event) => {
  compactMode = !compactMode;

  productGrid.classList.toggle("compact", compactMode);

  event.currentTarget.textContent = compactMode
    ? "Comfortable View"
    : "Compact View";
});

// ==========================================
// DARK MODE
// ==========================================

document.getElementById("darkModeBtn").addEventListener("click", (event) => {
  const enabled = document.body.classList.toggle("dark-mode");

  event.currentTarget.textContent = enabled ? "Light Mode" : "Dark Mode";

  event.currentTarget.setAttribute("aria-pressed", String(enabled));
});

// ==========================================
// CUSTOM PRODUCT MODAL
// ==========================================

document.getElementById("customProductBtn").addEventListener("click", () => {
  showModal(customProductModal);
});

document.getElementById("closeCustomBtn").addEventListener("click", () => {
  hideModal(customProductModal);
});

// ==========================================
// CUSTOM PRODUCT IMAGE
// ==========================================

customImageInput.addEventListener("change", () => {
  const file = customImageInput.files[0];

  customImageData = "";
  customImagePreview.removeAttribute("src");
  customImagePreview.classList.add("hidden");

  if (!file) {
    return;
  }

  if (!file.type.startsWith("image/")) {
    statusMessage.textContent = "Choose an image file.";
    customImageInput.value = "";
    return;
  }

  if (file.size > 5 * 1024 * 1024) {
    statusMessage.textContent = "Please choose an image smaller than 5 MB.";

    customImageInput.value = "";
    return;
  }

  const reader = new FileReader();

  reader.addEventListener("load", () => {
    customImageData = String(reader.result || "");
    customImagePreview.src = customImageData;
    customImagePreview.classList.remove("hidden");
  });

  reader.addEventListener("error", () => {
    statusMessage.textContent =
      "This image could not be opened. Try another one.";

    customImageInput.value = "";
  });

  reader.readAsDataURL(file);
});

// ==========================================
// SAVE CUSTOM PRODUCT
// ==========================================

document.getElementById("saveCustomBtn").addEventListener("click", () => {
  const nameInput = document.getElementById("customName");
  const priceInput = document.getElementById("customPrice");

  const name = nameInput.value.trim();
  const price = Number(priceInput.value);

  if (customImageInput.files.length && !customImageData) {
    statusMessage.textContent =
      "Wait for the picture preview to finish loading.";
    return;
  }

  if (!name || !Number.isFinite(price) || price <= 0) {
    statusMessage.textContent =
      "Enter a product name and a price greater than zero.";
    return;
  }

  const newProduct = new CustomProduct(
    nextProductId++,
    name,
    price,
    customImageData
  );

  products.push(newProduct);

  activeCategory = "All";

  const buttons = document.querySelectorAll(".category-btn");

  for (let i = 0; i < buttons.length; i++) {
    buttons[i].classList.toggle(
      "active",
      buttons[i].dataset.category === "All"
    );
  }

  nameInput.value = "";
  priceInput.value = "";
  customImageInput.value = "";
  customImageData = "";

  customImagePreview.removeAttribute("src");
  customImagePreview.classList.add("hidden");

  hideModal(customProductModal);
  displayProducts();
  addToCart(newProduct.id);
});

// ==========================================
// SALES HISTORY
// ==========================================

document.getElementById("historyBtn").addEventListener("click", () => {
  const historyContent = document.getElementById("historyContent");

  historyContent.innerHTML = saleHistory.length
    ? saleHistory
        .map(
          (sale, index) => `
      <article class="history-entry">
        <strong>Sale #${index + 1}</strong>
        <span>${new Date(sale.date).toLocaleString()}</span>
        <div>${sale.count} items · ${money(sale.total)}</div>
      </article>
    `
        )
        .join("")
    : "No completed sales yet.";

  showModal(historyModal);
});

document.getElementById("closeHistoryBtn").addEventListener("click", () => {
  hideModal(historyModal);
});

// ==========================================
// COMPLETE SALE
// ==========================================

document.getElementById("completeSaleBtn").addEventListener("click", () => {
  if (order.isEmpty()) {
    statusMessage.textContent =
      "Add at least one product before completing the sale.";
    return;
  }

  const totals = order.getTotals();
  const paid = Number(amountPaid.value);

  if (
    !amountPaid.value.trim() ||
    !Number.isFinite(paid) ||
    paid < 0 ||
    paid < totals.total
  ) {
    statusMessage.textContent = "Amount paid must cover the final amount.";

    amountPaid.focus();
    return;
  }

  const sale = {
    date: Date.now(),
    count: totals.count,
    subtotal: totals.subtotal,
    discount: totals.discount,
    total: totals.total,
    paid: paid,
    change: paid - totals.total,
    items: order.getPurchasedItems(),
  };

  saleHistory.unshift(sale);

  document.getElementById("receiptContent").innerHTML = `
    <div class="receipt-lines">
      ${sale.items
        .map(
          (item) => `
        <div>
          <span>
            ${escapeHTML(item.name)} · ${money(item.price)}
            × ${item.quantity}
          </span>
          <strong>${money(item.price * item.quantity)}</strong>
        </div>
      `
        )
        .join("")}
    </div>

    <p class="receipt-date">
      ${new Date(sale.date).toLocaleString()}
    </p>

    <div class="receipt-total">
      <span>Subtotal</span>
      <strong>${money(sale.subtotal)}</strong>
    </div>

    <div class="receipt-total">
      <span>Discount</span>
      <strong>${money(sale.discount)}</strong>
    </div>

    <div class="receipt-total">
      <span>Final amount</span>
      <strong>${money(sale.total)}</strong>
    </div>

    <div class="receipt-total">
      <span>Amount paid</span>
      <strong>${money(sale.paid)}</strong>
    </div>

    <div class="receipt-total">
      <span>Change</span>
      <strong>${money(sale.change)}</strong>
    </div>
  `;

  showModal(receiptModal);
});

// ==========================================
// NEW ORDER
// ==========================================

document.getElementById("newOrderBtn").addEventListener("click", () => {
  hideModal(receiptModal);

  order.clear();
  amountPaid.value = "";

  statusMessage.textContent = "Sale completed. Ready for the next order.";

  renderCart();
});

/*


[receiptModal, clearConfirmModal, customProductModal, historyModal]
  .forEach((modal) => {
    modal.addEventListener("click", (event) => {
      if (event.target === modal) hideModal(modal);
    });
  });
*/

const modals = [
  receiptModal,
  clearConfirmModal,
  customProductModal,
  historyModal,
];

for (let i = 0; i < modals.length; i++) {
  const modal = modals[i];

  modal.addEventListener("click", (event) => {
    if (event.target === modal) {
      hideModal(modal);
    }
  });
}

document.getElementById("receiptPrintBtn").addEventListener("click", () => {
  window.print();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    for (let i = 0; i < modals.length; i++) {
      hideModal(modals[i]);
    }
  }

  if (event.key === "F2") {
    event.preventDefault();
    document.getElementById("completeSaleBtn").click();
  }

  if (event.key === "F5") {
    event.preventDefault();
    document.getElementById("clearBtn").click();
  }

  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "f") {
    event.preventDefault();
    searchInput.focus();
  }
});

displayProducts();
renderCart();
