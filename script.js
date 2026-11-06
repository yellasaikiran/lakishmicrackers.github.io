document.addEventListener("DOMContentLoaded", () => {
  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();

  // Mobile navigation
  const toggle = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".nav");
  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      const open = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!open));
      nav.classList.toggle("open", !open);
    });
    nav.querySelectorAll("a").forEach(link => link.addEventListener("click", () => {
      nav.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
    }));
  }

  const grid = document.getElementById("product-grid");
  const search = document.getElementById("product-search");
  const count = document.getElementById("product-count");
  const empty = document.getElementById("product-empty");
  const cartItemsEl = document.getElementById("cart-items");
  const cartCountEl = document.getElementById("cart-count");
  const cartTotalEl = document.getElementById("cart-total");
  const form = document.getElementById("customer-form");
  const feedback = document.getElementById("cart-feedback");
  const products = (Array.isArray(window.LAKISHMI_PRODUCTS) ? window.LAKISHMI_PRODUCTS : [])
    .filter(p => p && p.available === true && Number.isFinite(Number(p.sellingPrice)));
  const cart = new Map();
  const money = value => `₹${Number(value).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;

  function renderProducts() {
    if (!grid) return;
    const query = (search?.value || "").trim().toLowerCase();
    const shown = products.filter(p => String(p.name || "").toLowerCase().includes(query));
    if (count) count.textContent = `${shown.length} of ${products.length} available products`;
    if (empty) {
      empty.hidden = shown.length > 0;
      empty.textContent = products.length === 0
        ? "Catalogue data could not be loaded. Check that products.js is in the repository root."
        : "No products match your search. Try another name.";
    }
    grid.replaceChildren();
    shown.forEach(product => {
      const card = document.createElement("article");
      card.className = "product-card";
      const name = document.createElement("h3"); name.textContent = product.name || "Product";
      const unit = document.createElement("p"); unit.className = "product-unit"; unit.textContent = `Price per ${product.unit || "unit"}`;
      const price = document.createElement("strong"); price.className = "product-price"; price.textContent = money(product.sellingPrice);
      const add = document.createElement("button"); add.type = "button"; add.className = "add-cart-button";
      add.textContent = cart.has(String(product.id)) ? "Add another +" : "Add to cart +";
      add.addEventListener("click", () => {
        const key = String(product.id); const current = cart.get(key);
        cart.set(key, { product, quantity: (current?.quantity || 0) + 1 });
        renderCart(); add.textContent = "Added ✓";
        window.setTimeout(() => { add.textContent = cart.has(key) ? "Add another +" : "Add to cart +"; }, 900);
      });
      card.append(name, unit, price, add); grid.append(card);
    });
  }

  function renderCart() {
    if (!cartItemsEl) return;
    cartItemsEl.replaceChildren();
    let quantityTotal = 0, amountTotal = 0;
    if (!cart.size) {
      const msg = document.createElement("p"); msg.className = "cart-empty"; msg.textContent = "Your cart is empty. Add products above to get started."; cartItemsEl.append(msg);
    }
    cart.forEach(({ product, quantity }, key) => {
      quantityTotal += quantity; amountTotal += Number(product.sellingPrice) * quantity;
      const row = document.createElement("div"); row.className = "cart-row";
      const details = document.createElement("div"); details.className = "cart-product-details";
      const title = document.createElement("strong"); title.textContent = product.name;
      const unit = document.createElement("small"); unit.textContent = `${money(product.sellingPrice)} / ${product.unit || "unit"}`;
      details.append(title, unit);
      const controls = document.createElement("div"); controls.className = "quantity-controls";
      const minus = document.createElement("button"); minus.type = "button"; minus.textContent = "−"; minus.setAttribute("aria-label", `Decrease ${product.name}`);
      minus.addEventListener("click", () => { if (quantity <= 1) cart.delete(key); else cart.set(key, { product, quantity: quantity - 1 }); renderCart(); renderProducts(); });
      const qty = document.createElement("span"); qty.textContent = String(quantity);
      const plus = document.createElement("button"); plus.type = "button"; plus.textContent = "+"; plus.setAttribute("aria-label", `Increase ${product.name}`);
      plus.addEventListener("click", () => { cart.set(key, { product, quantity: quantity + 1 }); renderCart(); });
      controls.append(minus, qty, plus);
      const line = document.createElement("strong"); line.className = "cart-line-total"; line.textContent = money(Number(product.sellingPrice) * quantity);
      const remove = document.createElement("button"); remove.type = "button"; remove.className = "remove-item"; remove.textContent = "Remove";
      remove.addEventListener("click", () => { cart.delete(key); renderCart(); renderProducts(); });
      row.append(details, controls, line, remove); cartItemsEl.append(row);
    });
    if (cartCountEl) cartCountEl.textContent = `${quantityTotal} item${quantityTotal === 1 ? "" : "s"}`;
    if (cartTotalEl) cartTotalEl.textContent = money(amountTotal);
  }

  if (search) search.addEventListener("input", renderProducts);
  if (form) form.addEventListener("submit", event => {
    event.preventDefault();
    if (!cart.size) { feedback.textContent = "Please add at least one product to your cart."; return; }
    const name = document.getElementById("customer-name").value.trim();
    const phone = document.getElementById("customer-phone").value.trim();
    if (!name || !/^[6-9][0-9]{9}$/.test(phone)) { feedback.textContent = "Enter your name and a valid 10-digit Indian mobile number."; return; }
    const lines = ["LAKISHMI CRACKERS — PRODUCT ENQUIRY", "", `Customer name: ${name}`, `Customer phone: ${phone}`, "", "Selected products:"];
    let total = 0;
    cart.forEach(({ product, quantity }) => {
      const lineTotal = Number(product.sellingPrice) * quantity; total += lineTotal;
      lines.push(`• ${product.name} | Qty: ${quantity} ${product.unit || "unit"} | ${money(product.sellingPrice)} each | Line total: ${money(lineTotal)}`);
    });
    lines.push("", `Catalogue total: ${money(total)}`, "", "Please confirm current availability, pack details, applicable permissions and final terms. This is an enquiry only, not a confirmed order.");
    const url = `https://wa.me/918897117835?text=${encodeURIComponent(lines.join("\n"))}`;
    const opened = window.open(url, "_blank");
    if (!opened) window.location.href = url;
    feedback.textContent = "WhatsApp opened with your enquiry. Review it and tap Send to share.";
  });

  renderProducts(); renderCart();
});
