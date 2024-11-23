document.addEventListener("DOMContentLoaded", () => {
    fetch("session.php")
        .then(response => response.json())
        .then(data => {
            if (data.loggedIn) {
                currentUser = { username: data.username };
                toggleAuthButtons(true);
                updateUserGreeting();
            } else {
                currentUser = null;
            }
            showPage("homePage");
            loadSampleProducts();
            loadProducts();
        });
});

// Global Variables
let cart = [];
let orders = [];
let products = [];
let users = [];
let currentUser = null;
let sellerData = {};

//search bar
function navigateToProduct() {
    const searchQuery = document.getElementById("searchBar").value.toLowerCase();
    const productsContainer = document.getElementById("products-container");
    const products = Array.from(productsContainer.children);
    const noResult = document.getElementById("no-result");

    let productFound = false;

    if (searchQuery === "") {
        // If the search bar is empty, show all products
        products.forEach(product => product.style.display = "block");
        noResult.style.display = "none";
    } else {
        // Search for a specific product
        products.forEach(product => {
            const productName = product.querySelector("h3").textContent.toLowerCase();
            if (productName.includes(searchQuery)) {
                product.style.display = "block";
                productFound = true;
            } else {
                product.style.display = "none";
            }
        });

        noResult.style.display = productFound ? "none" : "block";
    }
}


// Section 1: Page Navigation
function showPage(pageId) {
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => {
        page.classList.remove('active');
    });
    const targetPage = document.getElementById(pageId);
    if (targetPage) {
        targetPage.classList.add('active');
    }
}




// Section 2: User Authentication
function loginUser(event) {
    event.preventDefault();
    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;

    // Mock user authentication
    const user = users.find(u => u.email === email && u.password === password);

    if (user) {
        currentUser = user;
        toggleAuthButtons(true);
        updateUserGreeting();
        loadProducts();
        showPage("homePage");
    } else {
        alert("Invalid email or password.");
    }
}


function logoutUser() {
    currentUser = null;
    toggleAuthButtons(false);
    document.getElementById("user-id").textContent = "";
    loadProducts();
    showPage("homePage");

    document.getElementById("becomeSellerBtn").style.display = "inline-block";
    document.getElementById("loginBtn").style.display = "inline-block";
    document.getElementById("registerBtn").style.display = "inline-block";

    document.getElementById("accountBtn").style.display = "none";
    document.getElementById("addProductBtn").style.display = "none";

    fetch("logout.php")
        .then(response => response.json())
        .then(data => console.log(data.message))
        .catch(error => console.error("Error logging out:", error));
}

// Function to update button visibility based on user state
function updateButtonVisibility(userStatus, userRole) {
    const isLoggedIn = userStatus === 'loggedIn';
    const isSeller = isLoggedIn && userRole === 'seller';

    document.getElementById("loginBtn").style.display = isLoggedIn ? "none" : "inline-block";
    document.getElementById("registerBtn").style.display = isLoggedIn ? "none" : "inline-block";
    document.getElementById("logoutBtn").style.display = isLoggedIn ? "inline-block" : "none";
    document.getElementById("accountBtn").style.display = isLoggedIn ? "inline-block" : "none";
    document.getElementById("addProductBtn").style.display = isSeller ? "inline-block" : "none";

    document.getElementById("becomeSellerBtn").style.display = !isLoggedIn || userRole === 'buyer' ? "inline-block" : "none";
    document.getElementById("cartBtn").style.display = isLoggedIn && userRole === 'buyer' ? "inline-block" : "none";
    document.getElementById("ordersBtn").style.display = isLoggedIn && userRole === 'buyer' ? "inline-block" : "none";
    document.querySelector("button[onclick=\"showPage('homePage')\"]").style.display = "inline-block";
    document.getElementById("shopBtn").style.display = "inline-block";
}

function updateUserGreeting() {
    const greetingSection = document.getElementById("greeting-section");
    const userIdElement = document.getElementById("user-id");
    if (currentUser) {
        userIdElement.textContent = `Welcome ${currentUser.username}`;
        greetingSection.style.display = "block";
    } else {
        greetingSection.style.display = "none";
    }
}

function displayAccountDetails() {
    const container = document.getElementById("sellerDetailsBox");
    container.innerHTML = `
        <p>Email: <input value="${currentUser.email}" id="emailInput"></p>
        <p>Company: <input value="${currentUser.company}" id="companyInput"></p>
        <button onclick="saveAccountDetails()">Save</button>
    `;
}

function saveAccountDetails() {
    currentUser.email = document.getElementById("emailInput").value;
    currentUser.company = document.getElementById("companyInput").value;
    alert("Details updated!");
}


// Section 3: Seller Registration
function registerSeller(event) {
    event.preventDefault();

    sellerData = {
        name: document.getElementById("Name").value,
        email: document.getElementById("email").value,
        phone: document.getElementById("phone").value,
        address: document.getElementById("address").value,
        companyName: document.getElementById("companyName").value,
        companyLocation: document.getElementById("companyLocation").value,
        zoomMeetingId: document.getElementById("zoomMeetingId").value
    };

    console.log("Seller Data:", sellerData);

    displayAccountInfo();
    showPage("accountPage");

    document.getElementById("becomeSellerBtn").style.display = "none";
    document.getElementById("loginBtn").style.display = "none";
    document.getElementById("registerBtn").style.display = "none";
    document.getElementById("accountBtn").style.display = "inline-block";
    document.getElementById("addProductBtn").style.display = "inline-block";
}

// Section 4: Product Management
function loadProducts() {
    const productsContainer = document.getElementById("products-container");
    productsContainer.innerHTML = products.map(product => `
        <div class="product">
            <img src="${product.image}" alt="${product.name}" class="product-image" />
            <h3>${product.name}</h3>
            <p>Price: ${product.price}</p>
            <input type="number" id="quantity${product.id}" placeholder="Quantity" min="1" max="${product.quantity}" />
            <button onclick="addToCart(${product.id})">Add to Cart</button>
            ${currentUser ? `<button onclick="openVideoCall('${sellerData.zoomMeetingId}')">Video Call</button>` : ''}
        </div>
    `).join("");
}

// Toggle the visibility of the Add Product form
function toggleAddProductForm() {

    const formContainer = document.getElementById("addProductFormContainer");
    const addProductBtn = document.getElementById("addProductBtn");

    if (formContainer.style.display === "none") {
        formContainer.style.display = "block";
        addProductBtn.style.display = "none";
    } else {
        formContainer.style.display = "none";
        addProductBtn.style.display = "block";
    }
}


// Example function to handle the form submission
function addProduct(event) {
    event.preventDefault();

    const productName = document.getElementById("productName").value;
    const productPrice = parseFloat(document.getElementById("productPrice").value);
    const productQuantity = parseInt(document.getElementById("productQuantity").value);
    const productImage = URL.createObjectURL(document.getElementById("productImage").files[0]);
    const productDescription = document.getElementById("productDescription").value;

    const newProduct = {
        id: products.length + 1,
        name: productName,
        price: productPrice,
        quantity: productQuantity,
        sold: 0,
        image: productImage,
        description: productDescription,
        seller: currentUser.username,
    };

    products.push(newProduct);
    saveProducts();
    loadProducts();
    displayUserProducts();
    toggleAddProductForm();
}


function displayUserProducts() {
    const userProducts = products.filter(p => p.seller === currentUser.username);
    const container = document.getElementById("userProductsContainer");

    container.innerHTML = userProducts.map(product => `
        <div class="product">
            <img src="${product.image}" alt="${product.name}" />
            <h3>${product.name}</h3>
            <p>Price: Rs${product.price}</p>
            <p>Sold: ${product.sold}</p>
            <p>Remaining: ${product.quantity}</p>
            ${product.quantity === 0 ? '<button onclick="restockProduct(' + product.id + ')">Restock</button>' : ''}
        </div>
    `).join("");
}

function restockProduct(productId) {
    const product = products.find(p => p.id === productId);
    if (product) {
        const restockAmount = parseInt(prompt("Enter quantity to restock:", "10"));
        if (restockAmount > 0) {
            product.quantity += restockAmount;
            saveProducts();
            loadProducts();
            displayUserProducts();
        }
    }
}

function editProduct(productId) {
    const product = products.find(p => p.id === productId);
    if (product) {
        const newPrice = parseFloat(prompt("Enter new price:", product.price));
        const newDescription = prompt("Enter new description:", product.description);
        if (newPrice > 0) {
            product.price = newPrice;
            product.description = newDescription;
            saveProducts();
            loadProducts();
            displayUserProducts();
        }
    }
}


// Section 5: Cart Management
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    const quantityInput = document.getElementById(`quantity${productId}`);
    const quantity = parseInt(quantityInput ? quantityInput.value : 1);

    if (product && product.quantity >= quantity && quantity > 0) {
        const existingItem = cart.find(item => item.id === productId);

        if (!existingItem) {
            cart.push({ ...product, quantity, totalPrice: product.price * quantity });
            product.quantity -= quantity;
            product.sold += quantity;
            updateCartCount();
            loadProducts();
            displayCart();
        } else {
            alert("Product is already in the cart.");
        }
    } else {
        alert("Invalid quantity selected.");
    }
}

function updateCartCount() {
    document.getElementById("cart-count").innerText = cart.length;
}

function displayCart() {
    const cartContainer = document.getElementById("cart-container");
    const totalPrice = cart.reduce((sum, item) => sum + item.totalPrice, 0);

    cartContainer.innerHTML = cart.length ? cart.map(item => `
        <div class="cart-item">
            <h3>${item.name}</h3>
            <p>Price: Rs${item.price}</p><br>
            <p>Quantity: ${item.quantity}</p>
            <p>Total: $${item.totalPrice}</p>
        </div>
    `).join("") + `<p><strong>Total Cart Price:</strong> ${totalPrice}</p>` : "<p>Your cart is empty.</p>";

    document.getElementById("checkout-form").style.display = cart.length > 0 ? "block" : "none";
}

// Section 6: Orders Management
function checkout(event) {
    event.preventDefault();

    cart.forEach(item => {
        const product = products.find(p => p.id === item.id);
        if (product) {
            product.sold += item.quantity;
            product.quantity -= item.quantity;

            // Add order to the orders array
            const order = {
                ...item,
                date: new Date().toLocaleDateString(),
            };
            orders.push(order);

            // Save orders to sessionStorage
            sessionStorage.setItem("orders", JSON.stringify(orders));
        }
    });

    cart = [];
    updateCartCount();
    displayCart();
    displayOrders();
}

function loadOrdersFromSession() {
    const storedOrders = sessionStorage.getItem("orders");
    if (storedOrders) {
        orders = JSON.parse(storedOrders);
    }
    displayOrders();
}

document.addEventListener("DOMContentLoaded", () => {
    loadProductsFromStorage();
    loadSampleProducts();
    loadOrdersFromSession();
});


function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    updateCartCount();
    displayCart();
}

function displayOrders() {
    const ordersContainer = document.getElementById("orders-container");

    if (orders.length === 0) {
        ordersContainer.innerHTML = "<p>No orders yet.</p>";
        return;
    }

    ordersContainer.innerHTML = orders.map(order => `
        <div class="order-box">
            <div class="order-details">
                <h3>${order.name}</h3>
                <p><strong>Price:</strong> Rs${order.price}</p>
                <p><strong>Quantity:</strong> ${order.quantity}</p>
                <p><strong>Date:</strong> ${order.date}</p>
            </div>
        </div>
    `).join("");
}

// Section 7: Utility Functions
function openVideoCall(zoomMeetingId) {
    if (zoomMeetingId) {
        window.open(`https://zoom.us/j/${zoomMeetingId}`, "_blank");
    } else {
        alert("Zoom Meeting ID not provided.");
    }
}

function loadSampleProducts() {
    const sampleProducts = [
        { id: 1, name: "Oreo",  image: "oreo.jpg", price: 70, quantity: 10, sold: 0  },
        { id: 2, name: "Cheese Ball",  image: "cheeseball.jpg", price: 60, quantity: 10, sold: 0  },
        { id: 3, name: "Ramen", image: "Ramen.jpg", price: 150, quantity: 10, sold: 0  },
        { id: 4, name: "Fanta ",  image: "Fanta.jpg", price: 50, quantity: 10, sold: 0  },
        { id: 5, name: "Nescafe",  image: "Nescafe.jpg", price: 190, quantity: 10, sold: 0  },
        { id: 6, name: "Coke",  image: "Coke.jpg", price: 50, quantity: 10, sold: 0  },
        { id: 7, name: "Hershey's", image: "Hershey.jpeg", price: 100, quantity: 10, sold: 0  },
        { id: 8, name: "Dairymilk", image: "Dairymilk.jpg", price: 100, quantity: 10, sold: 0  },
        { id: 9, name: "Ice-cream", image: "icecream.jpg", price: 310, quantity: 10, sold: 0  }
    ];

    products.push(...sampleProducts);
    loadProducts();
}

// Function to toggle between Buyer and Seller forms
function toggleRegisterForm() {
    const userRole = document.getElementById("userRole").value;
    const buyerForm = document.getElementById("buyerForm");
    const sellerForm = document.getElementById("sellerForm");

    if (userRole === "seller") {
        buyerForm.style.display = "none"; // Hide buyer form
        sellerForm.style.display = "block"; // Show seller form
    } else {
        sellerForm.style.display = "none"; // Hide seller form
        buyerForm.style.display = "block"; // Show buyer form
    }
}

// Initialize the form based on default role selection (Buyer)
document.addEventListener("DOMContentLoaded", () => {
    toggleRegisterForm(); // Initialize based on default (Buyer)
});

function logoutUser() {
    currentUser = null;
    toggleAuthButtons(false);

    // Clear user-related data
    sessionStorage.removeItem("orders");
    orders = [];

    document.getElementById("user-id").textContent = "";
    loadProducts();
    showPage("homePage");

    document.getElementById("becomeSellerBtn").style.display = "inline-block";
    document.getElementById("loginBtn").style.display = "inline-block";
    document.getElementById("registerBtn").style.display = "inline-block";

    document.getElementById("accountBtn").style.display = "none";
    document.getElementById("addProductBtn").style.display = "none";

    fetch("logout.php")
        .then(response => response.json())
        .then(data => console.log(data.message))
        .catch(error => console.error("Error logging out:", error));
}

function displayOrders() {
    const ordersContainer = document.getElementById("orders-container");
    ordersContainer.innerHTML = orders.length
        ? orders.map(order => `
            <div class="order">
                <img src="${order.image}" alt="${order.name}" />
                <h3>${order.name}</h3>
                <p>Price: Rs${order.price}</p>
                <p>Quantity: ${order.quantity}</p>
                <p>Date: ${order.date}</p>
            </div>
        `).join("")
        : "<p>No orders yet.</p>";
}


function saveProducts() {
    localStorage.setItem("products", JSON.stringify(products));
}

function loadProductsFromStorage() {
    const storedProducts = localStorage.getItem("products");
    if (storedProducts) {
        products = JSON.parse(storedProducts);
    }
    loadProducts();
}

document.addEventListener("DOMContentLoaded", () => {
    loadProductsFromStorage();
    loadSampleProducts();
});


function removeProduct(productId) {
    products = products.filter(p => p.id !== productId);
    saveProducts();
    loadProducts();
    displayUserProducts();
}

function displayUserProducts() {
    const userProducts = products.filter(p => p.seller === currentUser.username);
    const container = document.getElementById("userProductsContainer");

    container.innerHTML = userProducts.length
        ? userProducts.map(product => `
            <div class="product">
                <img src="${product.image}" alt="${product.name}" />
                <h3>${product.name}</h3>
                <p>Price: Rs${product.price}</p>
                <p>Sold: ${product.sold}</p>
                <p>Remaining: ${product.quantity}</p>
                ${product.quantity === 0 ? '<button onclick="restockProduct(' + product.id + ')">Restock</button>' : ''}
                <button onclick="removeProduct(${product.id})">Remove Product</button>
                <button onclick="editProduct(${product.id})">Edit Product</button>
            </div>
        `).join("")
        : "<p>You have no products listed.</p>";
}


function displayUserProducts() {
    const userProducts = products.filter(p => p.seller === currentUser.username);
    const container = document.getElementById("userProductsContainer");

    container.innerHTML = userProducts.map(product => `
        <div class="product">
            <img src="${product.image}" alt="${product.name}" />
            <h3>${product.name}</h3>
            <p>Price: Rs${product.price}</p>
            <p>Sold: ${product.sold}</p>
            <p>Remaining: ${product.quantity}</p>
            ${product.quantity === 0 ? '<button onclick="restockProduct(' + product.id + ')">Restock</button>' : ''}
            <button onclick="removeProduct(${product.id})">Remove Product</button>
        </div>
    `).join("");
}

// Example: User's authentication and role status
const userStatus = "loggedOut"; // Change to "loggedIn" when logged in
const userRole = ""; // Set "buyer" or "seller" when logged in

// Function to load account details from the database
async function loadAccountDetails() {
    if (userStatus === "loggedIn") {
        try {
            const response = await fetch("getUserDetails.php", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ role: userRole })
            });
            const data = await response.json();

            if (data.success) {
                document.getElementById("displayEmail").textContent = data.details.email || "";
                document.getElementById("displayCompanyName").textContent = data.details.companyName || "";
                document.getElementById("displayCompanyLocation").textContent = data.details.companyLocation || "";
                document.getElementById("displayZoomMeetingId").textContent = data.details.zoomMeetingId || "";
            } else {
                console.warn("Failed to load account details. Please try again.");
            }
        } catch (error) {
            console.error("Error loading account details:", error);
            alert("An error occurred while fetching account details. Please try again later.");
        }
    } else {
        console.log("User is not logged in. Skipping account details fetch.");
    }
}

// Enable edit mode
function enableEditMode() {
    if (userStatus === "loggedIn") {
        document.getElementById("sellerDetailsBox").style.display = "none";
        document.getElementById("editForm").style.display = "block";

        // Pre-fill form inputs with current details
        document.getElementById("emailInput").value = document.getElementById("displayEmail").textContent || "";
        document.getElementById("companyNameInput").value = document.getElementById("displayCompanyName").textContent || "";
        document.getElementById("companyLocationInput").value = document.getElementById("displayCompanyLocation").textContent || "";
        document.getElementById("zoomMeetingIdInput").value = document.getElementById("displayZoomMeetingId").textContent || "";
    } else {
        alert("You must be logged in to edit your details.");
    }
}

// Update account details
async function updateDetails(event) {
    event.preventDefault();

    if (userStatus === "loggedIn") {
        const updatedDetails = {
            email: document.getElementById("emailInput").value,
            companyName: document.getElementById("companyNameInput").value,
            companyLocation: document.getElementById("companyLocationInput").value,
            zoomMeetingId: document.getElementById("zoomMeetingIdInput").value,
            role: userRole
        };

        try {
            const response = await fetch("updateUserDetails.php", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updatedDetails)
            });
            const data = await response.json();

            if (data.success) {
                alert("Details updated successfully!");
                loadAccountDetails();

                // Switch back to display mode
                document.getElementById("sellerDetailsBox").style.display = "block";
                document.getElementById("editForm").style.display = "none";
            } else {
                alert("Failed to update details. Please try again.");
            }
        } catch (error) {
            console.error("Error updating account details:", error);
            alert("An error occurred while updating account details. Please try again later.");
        }
    } else {
        alert("You must be logged in to update your details.");
    }
}

// Load account details on page load
document.addEventListener("DOMContentLoaded", () => {
    if (userStatus === "loggedIn") {
        loadAccountDetails();
    }
});

//
document.addEventListener("DOMContentLoaded", function () {
    // Mock data for orders
    var orders = [
        { id: 1, name: "Product A", time: "10:00 AM", location: "New York", date: "2024-11-22", quantity: 2 },
        { id: 2, name: "Product B", time: "11:30 AM", location: "Los Angeles", date: "2024-11-21", quantity: 1 },
        { id: 3, name: "Product C", time: "12:15 PM", location: "Chicago", date: "2024-11-22", quantity: 5 },
    ];

    // Function to populate orders
    function populateOrders() {
        var ordersByTimeTable = document.getElementById("ordersByTime").querySelector("tbody");
        var ordersByLocationTable = document.getElementById("ordersByLocation").querySelector("tbody");
        var ordersByDateTable = document.getElementById("ordersByDate").querySelector("tbody");

        // Sort and populate orders by time
        orders.sort(function (a, b) {
            return a.time.localeCompare(b.time);
        }).forEach(function (order) {
            var row = "<tr><td>" + order.id + "</td><td>" + order.name + "</td><td>" + order.time + "</td><td>" + order.quantity + "</td></tr>";
            ordersByTimeTable.innerHTML += row;
        });

        // Sort and populate orders by location
        orders.sort(function (a, b) {
            return a.location.localeCompare(b.location);
        }).forEach(function (order) {
            var row = "<tr><td>" + order.id + "</td><td>" + order.name + "</td><td>" + order.location + "</td><td>" + order.quantity + "</td></tr>";
            ordersByLocationTable.innerHTML += row;
        });

        // Sort and populate orders by date
        orders.sort(function (a, b) {
            return new Date(a.date) - new Date(b.date);
        }).forEach(function (order) {
            var row = "<tr><td>" + order.id + "</td><td>" + order.name + "</td><td>" + order.date + "</td><td>" + order.quantity + "</td></tr>";
            ordersByDateTable.innerHTML += row;
        });
    }

    // Populate orders on page load
    populateOrders();
});
