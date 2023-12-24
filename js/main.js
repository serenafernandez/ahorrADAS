/* UTILITIES */
const $ = (selector) => document.querySelector(selector);
const $$ = (selectors) => document.querySelectorAll(selectors);

const showElement = (selectors) => {
  for (const selector of selectors) {
    $(selector).classList.remove("hidden");
  }
};

const hideElement = (selectors) => {
  for (const selector of selectors) {
    $(selector).classList.add("hidden");
  }
};

const cleanContainer = (selector) => {
  $(selector).innerHTML = "";
};

const randomId = () => self.crypto.randomUUID();

const setInfo = (key, info) => localStorage.setItem(key, JSON.stringify(info));
const getInfo = (key) => JSON.parse(localStorage.getItem(key));

let loadedCategoriesFromLocalStorage = getInfo("categories") || [];

// seteo las categorías default que quiero que se muestren automáticamente la primera vez que abro mi app
const defaultCategories = [
  { id: randomId(), categoryName: "comida" },
  { id: randomId(), categoryName: "servicios" },
  { id: randomId(), categoryName: "salud" },
  { id: randomId(), categoryName: "educación" },
  { id: randomId(), categoryName: "transporte" },
  { id: randomId(), categoryName: "trabajo" },
];

// Muestra formulario para editar categoría y actualiza el valor editado
const showFormEdit = (categoryId) => {
  hideElement(["#categories-section"]);
  showElement(["#edit-category-section"]);
  $("#edit-category-input").setAttribute("data-id", categoryId);
};

/* Eliminar */
const deleteCategory = (categoryId) => {
  const updatedCategories = loadedCategoriesFromLocalStorage.filter(
    (category) => category.id !== categoryId
  );
  setInfo("categories", updatedCategories);
  loadedCategoriesFromLocalStorage = updatedCategories;
  renderCategories(updatedCategories);
};

// mostrar lista de
const renderCategories = (categories) => {
  cleanContainer("#category-list");
  for (const category of categories) {
    $("#category-list").innerHTML += `<span
            class="category-tag text-xs text-orange-400 bg-orange-100 rounded-md px-2 py-1">${category.categoryName}</span>
    <!-- CATEGORY ACTIONS -->
    <div class="mb-2">
        <button class="mr-2 text-xs text-blue-500 bg-rose-200 hover:text-black rounded-md px-2 py-1"
            onclick="showFormEdit('${category.id}')" id="edit-category-button">
            Editar
        </button>
        <button class="text-xs text-blue-500 bg-rose-200 hover:text-black rounded-md px-2 py-1"
            onclick="deleteCategory('${category.id}')" id="delete-category-button">
            Eliminar
        </button>
    </div>`;
  }
};

/* Agregar */
const addCategory = () => {
  const categoryName = $("#add-category-input").value;
  if (categoryName !== "") {
    const newCategory = { id: randomId(), categoryName };
    loadedCategoriesFromLocalStorage.push(newCategory);
    setInfo("categories", loadedCategoriesFromLocalStorage);
    renderCategories(loadedCategoriesFromLocalStorage);
    $("#add-category-input").value = "";
  }
};

// Cancelar operación editar
const cancelEditCategory = () => {
  $("#edit-category-input").value = "";
  $("#edit-category-input").removeAttribute("data-id");
  hideElement(["#edit-category-section"]);
  showElement(["#categories-section"]);
};

/* Editar */
const editCategory = () => {
  const categoryId = $("#edit-category-input").dataset.id;
  const updatedName = $("#edit-category-input").value;
  if (categoryId && updatedName !== "") {
    const updatedCategories = loadedCategoriesFromLocalStorage.map((category) =>
      category.id === categoryId
        ? { ...category, categoryName: updatedName }
        : category
    );
    setInfo("categories", updatedCategories);
    renderCategories(updatedCategories);
  }
};

/************************* RENDERS *************************/
const initialize = () => {
  // chequeo si hay categorías por defecto, si no están las agrego
  const hasDefaultCategories = getInfo("hasDefaultCategories");
  if (!hasDefaultCategories) {
    // falso, por lo tanto agrego mi array predeterminado
    setInfo("categories", defaultCategories);
    setInfo("hasDefaultCategories", true);
  }

  loadedCategoriesFromLocalStorage = hasDefaultCategories
    ? loadedCategoriesFromLocalStorage
    : [...defaultCategories];

  renderCategories(loadedCategoriesFromLocalStorage);

  $("#balance-nav").addEventListener("click", () => {
    showElement(["#balance-section"]);
    hideElement(["#categories-section", "#reports-section"]);
  });

  $("#categories-nav").addEventListener("click", () => {
    console.log("Categories button clicked");
    showElement(["#categories-section"]);
    hideElement([
      "#balance-section",
      "#reports-section",
      "#new-operation-section",
    ]);
  });

  $("#reports-nav").addEventListener("click", () => {
    showElement(["#reports-section"]);
    hideElement(["#balance-section", "#categories-section"]);
  });

  $("#add-operation-button").addEventListener("click", () => {
    showElement(["#new-operation-section"]);
    hideElement(["#balance-section"]);
  });

  $("#cancel-newoperation-button").addEventListener("click", () => {
    hideElement(["#edit-operation-section"]);
    showElement(["#balance-section"]);
  });

  $("#add-category-button").addEventListener("click", () => {
    addCategory();
  });

  $("#confirm-edit-button").addEventListener("click", () => {
    hideElement(["#edit-category-section"]);
    showElement(["#categories-section"]);
    cancelEditCategory();
  });

  $("#cancel-category-button").addEventListener("click", () => {
    cancelEditCategory();
  });
};

window.addEventListener("load", initialize);
