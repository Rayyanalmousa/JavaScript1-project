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
    price: 1.0,
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
    category: "Food",
    icon: "🍅",
    style: "tomato",
  },
  {
    id: 10,
    name: "Potato",
    price: 0.4,
    category: "Food",
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
const customProductModal = document.getElementById("customProductModal");
const customImageInput = document.getElementById("customImage");
const customImagePreview = document.getElementById("customImagePreview");
const historyModal = document.getElementById("historyModal");
const saleHistory = [];
let cart = [];
let activeCategory = "All";
let compactMode = false;
let discountRate = 0;
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

// function displayProducts() {

//     const query = searchInput.value.trim().toLowerCase();

//     let html = "";
//     let count = 0;

//     for (let i = 0; i < products.length; i++) {

//         const product = products[i];

//         const matchesCategory =
//             activeCategory === "All" ||
//             product.category === activeCategory;

//         const matchesSearch =
//             product.name.toLowerCase().includes(query) ||
//             product.category.toLowerCase().includes(query);

//         if (matchesCategory && matchesSearch) {

//             count++;

//             html += `
//                 <article class="product-card"
//                     data-category="${escapeHTML(product.category)}">

//                     <div class="product-visual ${escapeHTML(product.style)}">
//                         ${escapeHTML(product.icon)}
//                     </div>

//                     <h3>${escapeHTML(product.name)}</h3>

//                     <p class="product-price">
//                         ${money(product.price)}
//                         <small>/ item</small>
//                     </p>

//                     <button class="add-btn"
//                         data-id="${product.id}"
//                         type="button">
//                         + Add to order
//                     </button>

//                 </article>
//             `;
//         }
//     }

//     if (count === 0) {
//         html = `<div class="no-results">No products found</div>`;
//     }

//     productGrid.innerHTML = html;

//     document.querySelector(".product-count").textContent =
//         count + (count === 1 ? " Product" : " Products");
// }

function displayProducts() {
  const query = searchInput.value.trim().toLowerCase();
  const filtered = products.filter((product) => {
    const matchesCategory =
      activeCategory === "All" || product.category === activeCategory;
    const matchesSearch =
      product.name.toLowerCase().includes(query) ||
      product.category.toLowerCase().includes(query);
    return matchesCategory && matchesSearch;
  });

  document.querySelector(".product-count").textContent = `${filtered.length} ${
    filtered.length === 1 ? "Product" : "Products"
  }`;
  productGrid.innerHTML = filtered.length
    ? filtered
        .map(
          (product, index) => `
    <article class="product-card" data-category="${escapeHTML(
      product.category
    )}" style="--card-index:${index}">
      <div class="product-visual ${escapeHTML(
        product.style
      )}" aria-hidden="true">${product.image ? `<img class="product-image" src="${escapeHTML(product.image)}" alt="">` : escapeHTML(product.icon)}</div>
      <h3>${escapeHTML(product.name)}</h3>
      <p class="product-price">${money(product.price)} <small>/ item</small></p>
      <button class="add-btn" data-id="${
        product.id
      }" type="button"><span aria-hidden="true">＋</span> Add to order</button>
    </article>`
        )
        .join("")
    : `<div class="no-results"><span>🔎</span><strong>No products found</strong><p>Try another search or category.</p></div>`;
}

function renderCart() {
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const discount = subtotal * discountRate;
  const total = subtotal - discount;

  document.getElementById("orderCount").textContent = `${count} ${
    count === 1 ? "item" : "items"
  }`;
  document.getElementById("totalItems").textContent = count;
  document.getElementById("subtotal").textContent = money(subtotal);
  document.getElementById("discount").textContent = money(discount);
  document.getElementById("finalTotal").textContent = money(total);
  document.getElementById("changeAmount").textContent = money(
    Math.max(0, Number(amountPaid.value || 0) - total)
  );
  document.getElementById("completeSaleBtn").disabled = cart.length === 0;

  cartItems.innerHTML = cart.length
    ? cart
        .map(
          (item) => `
    <div class="cart-row">
      <div><div class="cart-product-name">${escapeHTML(
        item.name
      )}</div><div class="cart-unit-price">${money(item.price)} each</div></div>
      <div class="quantity-control">
        <button class="qty-btn" data-action="decrease" data-id="${
          item.id
        }" aria-label="Decrease ${escapeHTML(item.name)} quantity">−</button>
        <span>${item.quantity}</span>
        <button class="qty-btn" data-action="increase" data-id="${
          item.id
        }" aria-label="Increase ${escapeHTML(item.name)} quantity">+</button>
      </div>
      <div class="cart-line-total">${money(item.price * item.quantity)}</div>
      <button class="remove-btn" data-action="remove" data-id="${
        item.id
      }" aria-label="Remove ${escapeHTML(item.name)}">×</button>
    </div>`
        )
        .join("")
    : `<div class="empty-cart"><div class="empty-icon">🛒</div><h3>Your order is empty</h3><p>Select a product to start a sale.</p></div>`;
}

function animateProductToCart(id, sourceButton) {
  if (
    !sourceButton ||
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  )
    return;
  const visual = sourceButton
    .closest(".product-card")
    ?.querySelector(".product-visual");
  const cartTarget = document.querySelector(".order-header h2");
  if (!visual || !cartTarget) return;

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
  flyer.addEventListener("animationend", () => flyer.remove(), { once: true });
  window.setTimeout(() => flyer.remove(), 850);
}

function addToCart(id, sourceButton) {
  const product = products.find((item) => item.id === Number(id));
  if (!product) return;
  animateProductToCart(id, sourceButton);
  const existing = cart.find((item) => item.id === product.id);
  if (existing) existing.quantity += 1;
  else cart.push({ ...product, quantity: 1 });
  const cartTitle = document.querySelector(".order-header h2");
  cartTitle.classList.remove("cart-arrival");
  void cartTitle.offsetWidth;
  cartTitle.classList.add("cart-arrival");
  statusMessage.textContent = `${product.name} added to order`;
  renderCart();
  window.setTimeout(() => {
    statusMessage.textContent = "";
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
  if (button) addToCart(button.dataset.id, button);
});

cartItems.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-action]");
  if (!button) return;
  const item = cart.find((entry) => entry.id === Number(button.dataset.id));
  if (!item) return;
  if (button.dataset.action === "increase") item.quantity += 1;
  if (button.dataset.action === "decrease") item.quantity -= 1;
  if (button.dataset.action === "remove" || item.quantity <= 0)
    cart = cart.filter((entry) => entry.id !== item.id);
  renderCart();
});

document.getElementById("categories").addEventListener("click", (event) => {
  const button = event.target.closest(".category-btn");
  if (!button) return;
  activeCategory = button.dataset.category;
  document
    .querySelectorAll(".category-btn")
    .forEach((item) => item.classList.toggle("active", item === button));
  displayProducts();
});
searchInput.addEventListener("input", displayProducts);
amountPaid.addEventListener("input", renderCart);
document.getElementById("clearBtn").addEventListener("click", () => {
  cart = [];
  amountPaid.value = "";
  statusMessage.textContent = "Order cleared.";
  renderCart();
});
document.getElementById("viewBtn").addEventListener("click", (event) => {
  compactMode = !compactMode;
  productGrid.classList.toggle("compact", compactMode);
  event.currentTarget.textContent = compactMode
    ? "Comfortable View"
    : "Compact View";
});
document
  .getElementById("customProductBtn")
  .addEventListener("click", () => showModal(customProductModal));
document
  .getElementById("closeCustomBtn")
  .addEventListener("click", () => hideModal(customProductModal));
customImageInput.addEventListener("change", () => {
  const file = customImageInput.files[0];
  customImageData = "";
  customImagePreview.removeAttribute("src");
  customImagePreview.classList.add("hidden");
  if (!file) return;
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
    customImageData = reader.result;
    customImagePreview.src = customImageData;
    customImagePreview.classList.remove("hidden");
  });
  reader.addEventListener("error", () => {
    statusMessage.textContent = "This image could not be opened. Try another one.";
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
    statusMessage.textContent = "Wait for the picture preview to finish loading.";
    return;
  }
  if (!name || !Number.isFinite(price) || price <= 0) {
    statusMessage.textContent =
      "Enter a product name and a price greater than zero.";
    return;
  }
  products.push({
    id: nextProductId++,
    name,
    price,
    category: "Custom",
    icon: "🛍️",
    style: "custom",
    image: customImageData,
  });
  activeCategory = "All";
  document
    .querySelectorAll(".category-btn")
    .forEach((item) =>
      item.classList.toggle("active", item.dataset.category === "All")
    );
  nameInput.value = "";
  priceInput.value = "";
  customImageInput.value = "";
  customImageData = "";
  customImagePreview.removeAttribute("src");
  customImagePreview.classList.add("hidden");
  hideModal(customProductModal);
  displayProducts();
  addToCart(products.at(-1).id);
});

document.getElementById("historyBtn").addEventListener("click", () => {
  const historyContent = document.getElementById("historyContent");
  historyContent.innerHTML = saleHistory.length
    ? saleHistory
        .map(
          (sale, index) => `
    <article class="history-entry"><strong>Sale #${
      index + 1
    }</strong><span>${new Date(sale.date).toLocaleTimeString()}</span><div>${
            sale.count
          } items · ${money(sale.total)}</div></article>`
        )
        .join("")
    : "No completed sales yet.";
  showModal(historyModal);
});
document
  .getElementById("closeHistoryBtn")
  .addEventListener("click", () => hideModal(historyModal));
document.getElementById("completeSaleBtn").addEventListener("click", () => {
  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const total = subtotal * (1 - discountRate);
  const paid = Number(amountPaid.value || 0);
  if (paid < total) {
    statusMessage.textContent = "Amount paid must cover the final amount.";
    amountPaid.focus();
    return;
  }
  const sale = {
    date: Date.now(),
    count: cart.reduce((sum, item) => sum + item.quantity, 0),
    total,
    items: cart.map((item) => ({ ...item })),
  };
  saleHistory.unshift(sale);
  document.getElementById("receiptContent").innerHTML = `
    <div class="receipt-lines">${sale.items
      .map(
        (item) =>
          `<div><span>${escapeHTML(item.name)} × ${
            item.quantity
          }</span><strong>${money(item.price * item.quantity)}</strong></div>`
      )
      .join("")}</div>
    <div class="receipt-total"><span>Total paid</span><strong>${money(
      total
    )}</strong></div>
    <div class="receipt-total"><span>Change</span><strong>${money(
      paid - total
    )}</strong></div>`;
  showModal(receiptModal);
});
document.getElementById("newOrderBtn").addEventListener("click", () => {
  hideModal(receiptModal);
  cart = [];
  amountPaid.value = "";
  statusMessage.textContent = "Sale completed. Ready for the next order.";
  renderCart();
});

[receiptModal, customProductModal, historyModal].forEach((modal) => {
  modal.addEventListener("click", (event) => {
    if (event.target === modal) hideModal(modal);
  });
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape")
    [receiptModal, customProductModal, historyModal].forEach(hideModal);
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
