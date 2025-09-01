document.addEventListener("DOMContentLoaded", () => {
  const loader = document.getElementById("loader");
  const productList = document.getElementById("product-list");
  const cartButton = document.getElementById("open-cart-btn");
  const cartCountElement = document.getElementById("cart-count");
  const closeCartBtn = document.getElementById("close-cart-btn");
  const cartSidebar = document.getElementById("cart-sidebar");
  const cartOverlay = document.getElementById("cart-overlay");
  const cartItemsContainer = document.getElementById("cart-items");
  const totalPriceElement = document.getElementById("total-price");
  const whatsappOrderBtn = document.getElementById("whatsapp-order-btn");
  const whatsappNumber = "905011597423";
  const productPopup = document.getElementById("product-popup");
  const popupOverlay = document.getElementById("product-popup-overlay");
  const closePopupBtn = document.getElementById("close-popup-btn");
  const popupContent = document.getElementById("popup-content");
  const popupAddToCartBtn = document.getElementById("popup-add-to-cart-btn");

  let cart = [];
  let allProducts = [];

  async function fetchProducts() {
    try {
      const response = await fetch("shop/shop.json");
      if (!response.ok) throw new Error("Network response was not ok");
      const products = await response.json();
      allProducts = products;
      displayProducts(products);
    } catch (error) {
      console.error("Ürünler yüklenirken hata oluştu:", error);
      productList.innerHTML = `
            <p>Kurabiyeler yolda kurabiye canavarı tarafından pusuya düştü, maalesef savaşı kaybettiler 😓 Lütfen daha sonra tekrar deneyiniz veya sayfayı yenileyiniz. </br><img src="assets/kirik-kurabiye.png" class="kirik-kurabiye" alt="Kurabiyeler Pusuya Düştü"/></p>
        `;
    }
  }

  function displayProducts(products) {
    productList.innerHTML = "";
    products.forEach((product, index) => {
      const productCard = document.createElement("div");
      productCard.className = "product-card";
      productCard.dataset.id = product.id;
      productCard.style.animationDelay = `${index * 100}ms`;
      productCard.innerHTML = `
                <img src="${product.image}" alt="${product.name}" class="product-image">
                <h3 class="product-name">${product.name}</h3>
                <div class="product-price">${product.price} TL</div>
                <button class="add-to-cart-btn" data-id="${product.id}">+</button>
            `;
      productList.appendChild(productCard);
    });
  }

  function updateCart() {
    renderCartItems();
    updateCartCount();
    updateTotalPrice();
  }

  function openProductPopup(productId) {
    const product = allProducts.find((p) => p.id === productId);
    if (!product) return;
    popupContent.querySelector(".popup-image").src = product.image;
    popupContent.querySelector(".popup-image").alt = product.name;
    popupContent.querySelector(".popup-name").textContent = product.name;
    popupContent.querySelector(
      ".popup-price"
    ).textContent = `${product.price} TL`;
    const ingredientsList = popupContent.querySelector("#ingredients-list");
    ingredientsList.innerHTML = "";
    if (product.ingredients && product.ingredients.length > 0) {
      const ingredients = product.ingredients
        .split(",")
        .map((item) => item.trim());
      ingredients.forEach((ingredient) => {
        const li = document.createElement("li");
        li.textContent = ingredient;
        ingredientsList.appendChild(li);
      });
      popupContent.querySelector(".popup-ingredients").style.display = "block";
    } else {
      popupContent.querySelector(".popup-ingredients").style.display = "none";
    }
    popupAddToCartBtn.dataset.id = product.id;
    productPopup.classList.add("show");
    popupOverlay.classList.add("show");
  }

  function closeProductPopup() {
    productPopup.classList.remove("show");
    popupOverlay.classList.remove("show");
  }

  function renderCartItems() {
    if (cart.length === 0) {
      cartItemsContainer.innerHTML =
        '<p class="empty-cart-message">Sepetiniz şimdilik boş.</p>';
      return;
    }
    cartItemsContainer.innerHTML = "";
    cart.forEach((item) => {
      const cartItem = document.createElement("div");
      cartItem.className = "cart-item";
      cartItem.innerHTML = `
                <img src="${item.image}" alt="${
        item.name
      }" class="cart-item-img">
                <div class="cart-item-info">
                    <p class="cart-item-name">${item.name}</p>
                    <div class="quantity-controls">
                        <button class="quantity-btn" data-id="${
                          item.id
                        }" data-action="decrease">-</button>
                        <span>${item.quantity}</span>
                        <button class="quantity-btn" data-id="${
                          item.id
                        }" data-action="increase">+</button>
                    </div>
                </div>
                <p class="cart-item-price">${item.price * item.quantity} TL</p>
            `;
      cartItemsContainer.appendChild(cartItem);
    });
  }

  function updateCartCount() {
    const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCountElement.textContent = totalCount;
  }

  function updateTotalPrice() {
    const totalPrice = cart.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    totalPriceElement.textContent = `${totalPrice} TL`;
  }

  function animateCartButton() {
    cartButton.classList.add("shake");
    setTimeout(() => {
      cartButton.classList.remove("shake");
    }, 500);
  }

  function addToCart(productId) {
    const existingItem = cart.find((item) => item.id === productId);
    if (existingItem) {
      existingItem.quantity++;
    } else {
      const productToAdd = allProducts.find((p) => p.id === productId);
      if (productToAdd) {
        cart.push({ ...productToAdd, quantity: 1 });
      }
    }
    updateCart();
    animateCartButton();
  }

  function changeQuantity(productId, action) {
    const itemInCart = cart.find((item) => item.id === productId);
    if (!itemInCart) return;

    if (action === "increase") {
      itemInCart.quantity++;
    } else if (action === "decrease") {
      itemInCart.quantity--;
      if (itemInCart.quantity <= 0) {
        cart = cart.filter((item) => item.id !== productId);
      }
    }
    updateCart();
  }

  function generateWhatsAppMessage() {
    let message = "";
    if (cart.length === 0) {
      message =
        "Merhaba, bir sipariş vermek istiyorum fakat kararsız kaldım, yardımcı olabilir misiniz?";
    } else {
      message = "Merhaba, bir sipariş vermek istiyorum;\n\n";
    }
    cart.forEach((item) => {
      message += `*${item.name}* - (${item.quantity} adet)\n`;
    });

    const encodedMessage = encodeURIComponent(message);
    window.open(
      `https://wa.me/${whatsappNumber}?text=${encodedMessage}`,
      "_blank"
    );
  }

  productList.addEventListener("click", (e) => {
    const addToCartBtn = e.target.closest(".add-to-cart-btn");
    const productCard = e.target.closest(".product-card");

    if (addToCartBtn) {
      const productId = parseInt(addToCartBtn.dataset.id);
      addToCart(productId);
    } else if (productCard) {
      const productId = parseInt(productCard.dataset.id);
      openProductPopup(productId);
    }
  });

  function openCart() {
    cartSidebar.classList.add("show");
    cartOverlay.classList.add("show");
  }

  closePopupBtn.addEventListener("click", closeProductPopup);
  popupOverlay.addEventListener("click", closeProductPopup);
  popupAddToCartBtn.addEventListener("click", (e) => {
    const productId = parseInt(e.currentTarget.dataset.id);
    addToCart(productId);
    closeProductPopup();
  });

  function closeCart() {
    cartSidebar.classList.remove("show");
    cartOverlay.classList.remove("show");
  }

  cartButton.addEventListener("click", openCart);
  closeCartBtn.addEventListener("click", closeCart);
  cartOverlay.addEventListener("click", closeCart);

  cartItemsContainer.addEventListener("click", (e) => {
    if (e.target.classList.contains("quantity-btn")) {
      const productId = parseInt(e.target.getAttribute("data-id"));
      const action = e.target.getAttribute("data-action");
      changeQuantity(productId, action);
    }
  });

  whatsappOrderBtn.addEventListener("click", generateWhatsAppMessage);

  fetchProducts().finally(() => {
    setTimeout(() => {
      loader.style.opacity = "0";
      loader.style.visibility = "hidden";
    }, 1000);
  });

  const heroBtn = document.querySelector(".hero-btn");
  const productSection = document.getElementById("section-title-kurabis");

  if (heroBtn && productSection) {
    heroBtn.addEventListener("click", (e) => {
      e.preventDefault();
      productSection.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }
});
