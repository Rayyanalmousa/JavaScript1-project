const products = [
  {
    id: 1,
    name: "Fresh Apple",
    price: 0.8,
    category: "Fruits",
    icon: "🍎",
    style: "apple",
  },
  {
    id: 2,
    name: "Banana",
    price: 0.5,
    category: "Fruits",
    icon: "🍌",
    style: "banana",
  },
  {
    id: 3,
    name: "Orange",
    price: 0.7,
    category: "Fruits",
    icon: "🍊",
    style: "orange",
  },
  {
    id: 4,
    name: "Milk",
    price: 1.5,
    category: "Dairy",
    icon: "🥛",
    style: "milk",
  },
  {
    id: 5,
    name: "Bread",
    price: 1,
    category: "Bakery",
    icon: "🍞",
    style: "bread",
  },
  {
    id: 6,
    name: "Eggs (6)",
    price: 2.5,
    category: "Dairy",
    icon: "🥚",
    style: "eggs",
  },
  {
    id: 7,
    name: "Cola",
    price: 1.2,
    category: "Drinks",
    icon: "🥤",
    style: "cola",
  },
  {
    id: 8,
    name: "Potato Chips",
    price: 1.8,
    category: "Snacks",
    icon: "🍿",
    style: "chips",
  },
  {
    id: 9,
    name: "Tomato",
    price: 0.6,
    category: "Vegetables",
    icon: "🍅",
    style: "tomato",
  },
  {
    id: 10,
    name: "Potato",
    price: 0.4,
    category: "Vegetables",
    icon: "🥔",
    style: "potato",
  },
  {
    id: 11,
    name: "Cheese",
    price: 3.5,
    category: "Dairy",
    icon: "🧀",
    style: "cheese",
  },
  {
    id: 12,
    name: "Water",
    price: 0.5,
    category: "Drinks",
    icon: "💧",
    style: "water",
  },
];

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

const saleHistory = [];
let cart = [];
let activeCategory = "All";
let compactMode = false;
let nextProductId = 13;
let customImageData = "";

const money = (value) => `$${value.toFixed(2)}`;

const escapeHTML = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (char) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      }[char])
  );

/*


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

  const productCount = document.querySelector(".product-count");

  if (productCount) {
    productCount.textContent = `${filtered.length} ${
      filtered.length === 1 ? "Product" : "Products"
    }`;
  }

  productGrid.innerHTML = filtered.length
    ? filtered
        .map(
          (product, index) => `
      <article class="product-card"
        data-category="${escapeHTML(product.category)}"
        style="--card-index:${index}">

        <div class="product-visual ${escapeHTML(product.style)}"
          aria-hidden="true">
          ${
            product.image
              ? `<img class="product-image"
                   src="${escapeHTML(product.image)}" alt="">`
              : escapeHTML(product.icon)
          }
        </div>

        <h3>${escapeHTML(product.name)}</h3>

        <p class="product-price">
          ${money(product.price)} <small>/ item</small>
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

/*


const count = cart.reduce(
  (sum, item) => sum + item.quantity, 0
);

const subtotal = cart.reduce(
  (sum, item) => sum + item.price * item.quantity, 0
);
*/

function calculateTotals() {
  let count = 0;
  let subtotal = 0;

  for (let i = 0; i < cart.length; i++) {
    count += cart[i].quantity;
    subtotal += cart[i].price * cart[i].quantity;
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

function renderCart() {
  const totals = calculateTotals();

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

  document.getElementById("completeSaleBtn").disabled = cart.length === 0;

  cartItems.innerHTML = cart.length
    ? cart
        .map(
          (item) => `
      <div class="cart-row">

        <div>
          <div class="cart-product-name">
            ${escapeHTML(item.name)}
          </div>
          <div class="cart-unit-price">
            ${money(item.price)} each
          </div>
        </div>

        <div class="quantity-control">
          <button class="qty-btn"
            data-action="decrease"
            data-id="${item.id}"
            aria-label="Decrease ${escapeHTML(item.name)} quantity">
            −
          </button>

          <span>${item.quantity}</span>

          <button class="qty-btn"
            data-action="increase"
            data-id="${item.id}"
            aria-label="Increase ${escapeHTML(item.name)} quantity">
            +
          </button>
        </div>

        <div class="cart-line-total">
          ${money(item.price * item.quantity)}
        </div>

        <button class="remove-btn"
          data-action="remove"
          data-id="${item.id}"
          aria-label="Remove ${escapeHTML(item.name)}">
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

function clearOrder() {
  cart = [];
  amountPaid.value = "";
  statusMessage.textContent = "Order cleared.";
  renderCart();
}

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

/*


const product = products.find(
  (item) => item.id === Number(id)
);

const existing = cart.find(
  (item) => item.id === product.id
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

function findCartItem(id) {
  for (let i = 0; i < cart.length; i++) {
    if (cart[i].id === Number(id)) {
      return cart[i];
    }
  }

  return null;
}

function addToCart(id, sourceButton) {
  const product = findProduct(id);

  if (!product) {
    return;
  }

  animateProductToCart(id, sourceButton);

  const existing = findCartItem(product.id);

  if (existing) {
    existing.quantity += 1;
  } else {
    /*


    cart.push({ ...product, quantity: 1 });
    */

    cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      category: product.category,
      icon: product.icon,
      style: product.style,
      image: product.image || "",
      quantity: 1,
    });
  }

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

function showModal(modal) {
  modal.classList.remove("hidden");
  modal.querySelector("input")?.focus();
}

function hideModal(modal) {
  modal.classList.add("hidden");
}

productGrid.addEventListener("click", (event) => {
  const button = event.target.closest(".add-btn");

  if (button) {
    addToCart(button.dataset.id, button);
  }
});

cartItems.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-action]");

  if (!button) {
    return;
  }

  const item = findCartItem(button.dataset.id);

  if (!item) {
    return;
  }

  if (button.dataset.action === "increase") {
    item.quantity += 1;
  }

  if (button.dataset.action === "decrease") {
    item.quantity -= 1;
  }

  if (button.dataset.action === "remove" || item.quantity <= 0) {
    /*


    cart = cart.filter((entry) => entry.id !== item.id);
    */

    const updatedCart = [];

    for (let i = 0; i < cart.length; i++) {
      if (cart[i].id !== item.id) {
        updatedCart.push(cart[i]);
      }
    }

    cart = updatedCart;
  }

  renderCart();
});

document.getElementById("categories").addEventListener("click", (event) => {
  const button = event.target.closest(".category-btn");

  if (!button) {
    return;
  }

  activeCategory = button.dataset.category;

  /*
 using es6 favourite method

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

searchInput.addEventListener("input", displayProducts);
amountPaid.addEventListener("input", renderCart);

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

document.getElementById("viewBtn").addEventListener("click", (event) => {
  compactMode = !compactMode;

  productGrid.classList.toggle("compact", compactMode);

  event.currentTarget.textContent = compactMode
    ? "Comfortable View"
    : "Compact View";
});

document.getElementById("darkModeBtn").addEventListener("click", (event) => {
  const enabled = document.body.classList.toggle("dark-mode");

  event.currentTarget.textContent = enabled ? "Light Mode" : "Dark Mode";

  event.currentTarget.setAttribute("aria-pressed", String(enabled));
});

document.getElementById("customProductBtn").addEventListener("click", () => {
  showModal(customProductModal);
});

document.getElementById("closeCustomBtn").addEventListener("click", () => {
  hideModal(customProductModal);
});

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

  const newProduct = {
    id: nextProductId++,
    name: name,
    price: price,
    category: "Custom",
    icon: "🛍️",
    style: "custom",
    image: customImageData,
  };

  products.push(newProduct);

  activeCategory = "All";

  /*


  document.querySelectorAll(".category-btn").forEach(
    (item) => item.classList.toggle(
      "active", item.dataset.category === "All"
    )
  );
  */

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

document.getElementById("completeSaleBtn").addEventListener("click", () => {
  if (cart.length === 0) {
    statusMessage.textContent =
      "Add at least one product before completing the sale.";
    return;
  }

  const totals = calculateTotals();
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

  /*
  OLD CODE:

  const purchasedItems = cart.map((item) => ({ ...item }));
  */

  const purchasedItems = [];

  for (let i = 0; i < cart.length; i++) {
    const item = cart[i];

    purchasedItems.push({
      id: item.id,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
    });
  }

  const sale = {
    date: Date.now(),
    count: totals.count,
    subtotal: totals.subtotal,
    discount: totals.discount,
    total: totals.total,
    paid: paid,
    change: paid - totals.total,
    items: purchasedItems,
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
      <strong>${money(totals.subtotal)}</strong>
    </div>

    <div class="receipt-total">
      <span>Discount</span>
      <strong>${money(totals.discount)}</strong>
    </div>

    <div class="receipt-total">
      <span>Final amount</span>
      <strong>${money(totals.total)}</strong>
    </div>

    <div class="receipt-total">
      <span>Amount paid</span>
      <strong>${money(paid)}</strong>
    </div>

    <div class="receipt-total">
      <span>Change</span>
      <strong>${money(sale.change)}</strong>
    </div>
  `;

  showModal(receiptModal);
});

document.getElementById("newOrderBtn").addEventListener("click", () => {
  hideModal(receiptModal);

  cart = [];
  amountPaid.value = "";

  statusMessage.textContent = "Sale completed. Ready for the next order.";

  renderCart();
});

/*
OLD CODE USING forEach():

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
  /*
  OLD CODE:

  if (event.key === "Escape") {
    modals.forEach(hideModal);
  }
  */

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
