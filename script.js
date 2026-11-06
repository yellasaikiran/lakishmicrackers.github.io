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

  // Product catalogue (products.js must be in the same repository folder)
  const grid = document.getElementById("product-grid");
  const search = document.getElementById("product-search");
  const count = document.getElementById("product-count");
  const empty = document.getElementById("product-empty");
  const allProducts = Array.isArray(window.LAKISHMI_PRODUCTS) ? window.LAKISHMI_PRODUCTS : [];
  const products = allProducts.filter(product => product && product.available === true);

  function renderProducts() {
    if (!grid) return;
    const query = (search?.value || "").trim().toLowerCase();
    const shown = products.filter(product => String(product.name || "").toLowerCase().includes(query));
    if (count) count.textContent = `${shown.length} of ${products.length} available products`;
    if (empty) {
      empty.hidden = shown.length > 0;
      empty.textContent = products.length === 0
        ? "The catalogue data could not be loaded. Please refresh later or contact the store."
        : "No products match your search. Try another name.";
    }
    grid.replaceChildren();
    shown.forEach(product => {
      const card = document.createElement("article");
      card.className = "product-card";
      const name = document.createElement("h3");
      name.textContent = product.name || "Product";
      const unit = document.createElement("p");
      unit.className = "product-unit";
      unit.textContent = `Price per ${product.unit || "unit"}`;
      const price = document.createElement("strong");
      price.className = "product-price";
      const amount = Number(product.sellingPrice);
      price.textContent = Number.isFinite(amount)
        ? `₹${amount.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`
        : "Contact store";
      card.append(name, unit, price);
      grid.append(card);
    });
  }

  if (search) search.addEventListener("input", renderProducts);
  renderProducts();
});
