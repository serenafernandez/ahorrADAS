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

const defaultCategories = [
  { id: randomId(), categoryName: "comida" },
  { id: randomId(), categoryName: "servicios" },
  { id: randomId(), categoryName: "salud" },
  { id: randomId(), categoryName: "educación" },
  { id: randomId(), categoryName: "transporte" },
  { id: randomId(), categoryName: "trabajo" },
];

/* LOCAL STORAGE */
const setInfo = (key, info) => localStorage.setItem(key, JSON.stringify(info));
const getInfo = (key) => JSON.parse(localStorage.getItem(key));

let loadedCategoriesFromLocalStorage = getInfo("categories") || [];
let loadedOperationsFromLocalStorage = getInfo("operations") || [];

/* Muestra formulario para editar categoría y actualiza el valor editado */
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

/* Renderizo tabla de categorías */
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

/* Cancelar operación editar */
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

const applyFilters = () => {
  const operations = getInfo("operations");
  const type = $("#type-filter").value;
  const categories = $("#categories-filter").value;
  const sortBy = $("#sortby-filter").value;
  const since = Number(
    transformCurrentDate($("#since-filter").value).split("/").join("")
  );

  const filterByType = operations.filter((operation) => {
    if (type === "Todos") {
      return operation;
    }
    return operation.type === type;
  });

  const filterByCategories = filterByType.filter((operation) => {
    if (!categories) {
      return operation;
    }
    return operation.categories === categories;
  });

  let filterByDate = filterByCategories.filter((operation) => {
    const dateOperation = Number(
      transformCurrentDate(operation.date).split("/").join("")
    );

    return since <= dateOperation;
  });

  let finalFilter = [];

  if (!filterByDate.length) {
    filterByDate = filterByCategories;
  }

  if (sortBy === "mas-reciente") {
    finalFilter = filterByDate.sort((a, b) => {
      let aDate = Number(transformCurrentDate(a.date).split("/").join(""));
      let bDate = Number(transformCurrentDate(b.date).split("/").join(""));
      return bDate - aDate;
    });
  }

  const order = $("#order-filter").value;

  if (order === "menos-reciente") {
    finalFilter = filterByDate.sort((a, b) => {
      let bDate = Number(transformCurrentDate(b.date).split("/").join(""));
      let aDate = Number(transformCurrentDate(a.date).split("/").join(""));

      return aDate - bDate;
    });
  }

  if (order === "mayor-monto") {
    finalFilter = filterByDate.sort((a, b) => b.amount - a.amount);
  }

  if (order === "menor-monto") {
    finalFilter = filterByDate.sort((a, b) => a.amount - b.amount);
  }

  if (order === "a-z") {
    finalFilter = filterByDate.sort((a, b) =>
      a.description.localeCompare(b.description)
    );
  }

  if (order === "z-a") {
    finalFilter = filterByDate.sort((a, b) =>
      b.description.localeCompare(a.description)
    );
  }

  if (!finalFilter.length) {
    hideElement("#new-operation");
    showElement("");
  } else {
    showElement("#new-operation");
    hideElement("");
  }

  renderOperations(finalFilter);
};

const renderOperations = (operations) => {
  cleanContainer("#operations-table");
  if (operations.length) {
    hideElement("");
    showElement(["#new-operation"]);
    for (const {
      id,
      description,
      categories,
      date,
      amount,
      type,
    } of operations) {
      let className = type === "Ganancia" ? "text-green-500" : "text-red-600";
      let symbol = type === "Ganancia" ? "+" : "-";

      const categorySelected = getInfo("categories").find(
        (cat) => cat.id === categories
      );

      $(
        "#operations-table"
      ).innerHTML += `<tr class="flex-wrap flex md:justify-between">
          <td class="px-4 py-2 md:w-1/5 md:flex md:justify-start">${description}</td>
          <td class="px-4 py-2 md:w-1/5 md:flex md:justify-start">
              <span class="category-tag text-xs text-orange-400 bg-orange-100 rounded-md px-2 py-1">${
                categorySelected.categoryName
              }</span>
          </td>
          <td class="px-4 py-2 md:w-1/5 md:flex md:justify-start">${transformCurrentDate(
            date
          )}</td>
          <td class="px-4 py-2 md:w-1/5 md:flex md:justify-start font-bold ${className}">${symbol}$${amount}</td>
          <td class="px-4 py-2 md:w-1/5 md:flex md:justify-start">
              <button class="mr-2 text-xs text-blue-500 bg-rose-200 hover:text-black rounded-md px-2 py-1"
                  onclick="showFormEdit('${
                    operation.id
                  }')" id="edit-operation-button">
                  Editar
              </button>
              <button class="text-xs text-blue-500 bg-rose-200 hover:text-black rounded-md px-2 py-1" onclick="deleteOperation('${
                operation.id
              }')" id="deledescription-errorte-operation-button">
                  Eliminar
              </button>
          </td>
      </tr>`;
    }
  } else {
    showElement(""); //TODO
  }
};

const validateFormOperations = () => {
  const date = $("#date").value;
  const description = $("#description").value.trim();
  const amount = $("#amount").valueAsNumber;

  if (description === "") {
    showElement([".description-error"]);
    $("#description").classList.add("border-red-600");
  } else {
    hideElement([".description-error"]);
    $("#description").classList.remove("border-red-600");
  }

  if (isNaN(amount)) {
    showElement([".amount-error"]);
    $("#amount").classList.add("border-red-600");
  } else {
    hideElement([".amount-error"]);
    $("#amount").classList.remove("border-red-600");
  }

  if (date === "") {
    showElement([".date-error"]);
    $("#date").classList.add("border-red-600");
  } else {
    hideElement([".date-error"]);
    $("#date").classList.remove("border-red-600");
  }

  return description !== "" && !isNaN(amount) && date !== "";
};

const saveOperationsData = (operationId) => {
  return {
    id: operationId ? operationId : randomId(),
    description: $("#description").value,
    amount: $("#amount").valueAsNumber,
    type: $("#type").value,
    category: $("#category").value,
    date: $("#date").value,
  };
};

const sendNewData = (key, callback) => {
  const currentData = getInfo(key);
  const newData = callback();
  currentData.push(newData);
  setInfo(key, currentData);
};

/************************* REPORTS *********************************/
const calculateReportsData = (allOperations, allCategories) => {
  let data = {
    highestProfitCategory: { name: "", amount: 0 },
    highestSpendingCategory: { name: "", amount: 0 },
    highestBalanceCategory: { name: "", amount: 0 },
    highestProfitMonth: { month: "", amount: 0 },
    highestSpendingMonth: { month: "", amount: 0 },
    totalsByCategory: {},
    totalsByMonth: [],
  };

  const convertToYearMonth = (dateString) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    return `${year}-${month.toString()}`;
  };

  // CALCULOS CATEGORÍAS MAYOR GANANCIA Y MAYOR GASTO
  for (const { name, id } of allCategories) {
    const operationCategories = allOperations.filter(
      (operation) => operation.category === id
    );

    const totalProfit = operationCategories
      .filter((operation) => operation.type === "earnings")
      .reduce((acc, monto) => acc + monto.amount, 0);

    if (data.highestProfitCategory.amount < totalProfit) {
      data.highestProfitCategory = { name, amount: totalProfit };
    }

    const totalAmountSpending = operationCategories
      .filter((operation) => operation.type === "spent")
      .reduce(
        (accSpent, amountSpending) => accSpent + amountSpending.amount,
        0
      );

    if (data.highestSpendingCategory.amount < totalAmountSpending) {
      data.highestSpendingCategory = { name, amount: totalAmountSpending };
    }

    /* CALCULO DE BALANCE */
    const balance = totalProfit - totalAmountSpending;

    data.totalsByCategory[id] = {
      name,
      totalProfit,
      totalAmountSpending,
      balance,
    };

    if (data.highestBalanceCategory.amount < balance) {
      data.highestBalanceCategory = { name, amount: balance };
    }
  }

  // CALCULOS MESES MAYOR GANANCIA Y MAYOR GASTO
  for (const { date, type } of allOperations) {
    const dateYearMonth = convertToYearMonth(date);

    const operationFilteredByType = allOperations.filter(
      (operation) => operation.type === type
    );
    const forMonth = operationFilteredByType.filter(
      (operation) => convertToYearMonth(operation.date) === dateYearMonth
    );
    const totalForMonth = forMonth.reduce(
      (acc, operation) => acc + operation.amount,
      0
    );

    if (type === "earnings" && data.highestProfitMonth.amount < totalForMonth) {
      data.highestProfitMonth = { month: dateYearMonth, amount: totalForMonth };
    }

    if (type === "spent" && data.highestSpendingMonth.amount < totalForMonth) {
      data.highestSpendingMonth = {
        month: dateYearMonth,
        amount: totalForMonth,
      };
    }
  }

  // CALCULO TOTALES POR MES
  const totalsByMonth = {};
  allOperations.forEach((operation) => {
    const dateYearMonth = convertToYearMonth(operation.date);

    if (!totalsByMonth[dateYearMonth]) {
      totalsByMonth[dateYearMonth] = {
        totalSpendings: 0,
        totalEarnings: 0,
      };
    }

    if (operation.type === "spent") {
      totalsByMonth[dateYearMonth].totalSpendings += operation.amount;
    } else if (operation.type === "earnings") {
      totalsByMonth[dateYearMonth].totalEarnings += operation.amount;
    }
  });

  data.totalsByMonth = Object.entries(totalsByMonth).map(([month, amount]) => ({
    month,
    totalSpendings: amount.totalSpendings,
    totalEarnings: amount.totalEarnings,
    total: amount.totalEarnings - amount.totalSpendings,
  }));

  return data;
};

const renderReports = (hasReports, data) => {
  if (hasReports) {
    showElement(["#with-reports-section"]);
    hideElement(["#no-reports-section"]);

    $("#categoria-mayor-ganancia").innerHTML = `
      <div class="flex items-center justify-between">
        <div class="w-2/3">
          <span class="text-xs text-orange-400 bg-orange-100 px-2 py-1 rounded-md whitespace-nowrap overflow-hidden">
            ${data.highestProfitCategory.name}
          </span>
        </div>
        <div class="w-1/3 flex items-end justify-end">
          <span class="whitespace-nowrap overflow-hidden text-green-600">
            $${data.highestProfitCategory.amount}
          </span>
        </div>
      </div>
    `;

    $("#categoria-mayor-gasto").innerHTML = `
      <div class="flex items-center justify-between">
        <div class="w-2/3">
          <span class="px-2 py-1 text-xs text-orange-400 bg-orange-100 rounded-md whitespace-nowrap overflow-hidden">
            ${data.highestSpendingCategory.name}
          </span>
        </div>
        <div class="w-1/3 flex items-end justify-end">
          <span class="whitespace-nowrap overflow-hidden text-red-600" id="categoria-mayor-gasto-total">
            $${data.highestSpendingCategory.amount}
          </span>
        </div>
      </div>
    `;

    $("#categoria-mayor-balance").innerHTML = `
      <div class="flex items-center justify-between">
        <div class="w-2/3">
          <span class="px-2 py-1 text-xs text-orange-400 bg-orange-100 rounded-md whitespace-nowrap overflow-hidden">
            ${data.highestBalanceCategory.name}
          </span>
        </div>
        <div class="w-1/3 flex items-end justify-end">
          <span class="whitespace-nowrap overflow-hidden">$${data.highestBalanceCategory.amount}</span>
        </div>
      </div>
    `;

    $("#mes-mayor-ganancia").innerHTML = `
      <div class="flex items-center justify-between">
        <div class="w-2/3">
          <span class="whitespace-nowrap overflow-hidden">${data.highestProfitMonth.month}</span>
        </div>
        <div class="w-1/3 flex items-end justify-end">
          <span class="whitespace-nowrap overflow-hidden text-green-600" id="mes-mayor-ganancia-total">
            $${data.highestProfitMonth.amount}
          </span>
        </div>
      </div>
    `;

    $("#mes-mayor-gasto").innerHTML = `
      <div class="flex items-center justify-between">
        <div class="w-2/3">
          <span class="whitespace-nowrap overflow-hidden">${data.highestSpendingMonth.month}</span>
        </div>
        <div class="w-1/3 flex items-end justify-end">
          <span class="whitespace-nowrap overflow-hidden text-red-600" id="mes-mayor-gasto-total">
            -$${data.highestSpendingMonth.amount}
          </span>
        </div>
      </div>
    `;

    $("#totales-por-categoria").innerHTML = `
      <span class="px-2 py-1 text-xs text-orange-400 bg-orange-100 rounded-md whitespace-nowrap overflow-hidden">
        ${data.totalsByCategory.name}
      </span>
    `;

    $("#totales-categoria-ganancias").innerHTML = `
      +${data.totalsByCategory.totalEarnings}
    `;

    $("#totales-categoria-gastos").innerHTML = `
      -${data.totalsByCategory.totalSpendings}
    `;

    $("#totales-categoria-balance").innerHTML = `
      ${data.totalsByCategory.total}
    `;

    $("#totales-mes").innerHTML = `
      ${data.totalsByMonth[0].month}
    `;

    $("#totales-mes-ganancias").innerHTML = `
      +$${data.totalsByMonth[0].totalEarnings}
    `;

    $("#totales-mes-gastos").innerHTML = `
      -$${data.totalsByMonth[0].totalSpendings}
    `;

    $("#totales-mes-balance").innerHTML = `
      $${data.totalsByMonth[0].total}
    `;
  } else {
    hideElement(["#with-reports-section"]);
    showElement(["#no-reports-section"]);
  }
};

const addOperation = () => {
  if (validateFormOperations()) {
    const newOperation = saveOperationsData();
    sendNewData("operations", () => newOperation);

    const updatedOperations = getInfo("operations");
    renderOperations(updatedOperations);
    renderReports(true, updatedOperations);

    hideElement(["#new-operation-section"]);
    showElement(["#balance-section"]);
  }
};

/************************* INICIALIZAR APP *************************/
const initialize = () => {
  const hasDefaultCategories = getInfo("hasDefaultCategories");
  if (!hasDefaultCategories) {
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
    hideElement(["#new-operation-section"]);
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

  $("#add-newoperation-button").addEventListener("click", () => {
    addOperation();
  });

  // ABRIR DROPDOWN EN MOBILE
  $(".bars").addEventListener("click", () => {
    showElement([".xmark", "#menu-dropdown"]);
    hideElement([".bars"]);
  });

  // CERRAR DROPDOWN EN MOBILE
  $(".xmark").addEventListener("click", () => {
    showElement([".bars"]);
    hideElement([".xmark", "#menu-dropdown"]);
  });

  // OCULTAR FILTROS
  $("#hide-filters").addEventListener("click", () => {
    showElement(["#show-filters"]);
    hideElement(["#hide-filters", "#filters-content"]);
  });
  // MOSTRAR FILTROS
  $("#show-filters").addEventListener("click", () => {
    showElement(["#hide-filters", "#filters-content"]);
    hideElement(["#show-filters"]);
  });

  $("#type-filter").addEventListener("change", applyFilters);

  $("#categories-filter").addEventListener("change", applyFilters);

  $("#since-filter").addEventListener("change", applyFilters);

  $("#sortby-filter").addEventListener("change", applyFilters);

  $("#add-operation-button").addEventListener("click", (e) => {
    e.preventDefault();
    $("#form").reset();
  });
};

window.addEventListener("load", initialize);
