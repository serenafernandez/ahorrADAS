// FUNCIONES AUXILIARES
const $ = (selector) => document.querySelector(selector);
const $$ = (selectors) => document.querySelectorAll(selectors);

// Funcionalidad secciones - botones
const displaySection = (hiddenSection) => {
  const sections = [
    $("#balance-section"),
    $("#categories-section"),
    $("#edit-category-section"),
    $("#reports-section"),
    $("#new-operation-section"),
    $("#edit-operation-section"),
  ];

  for (const section of sections) {
    if (section === hiddenSection) {
      section.classList.remove("hidden");
    } else {
      section.classList.add("hidden");
    }
  }
};

$("#balance-nav").addEventListener("click", () => {
  displaySection($("#balance-section"));
});

$("#categories-nav").addEventListener("click", () => {
  displaySection($("#categories-section"));
});

// $("#edit-category-button").addEventListener("click", () => {

// });

$("#reports-nav").addEventListener("click", () => {
  displaySection($("#reports-section"));
});

$("#new-operation-button").addEventListener("click", () => {
  displaySection($("#new-operation-section"));
});

$("#cancel-operation-button").addEventListener("click", () => {
  $("#new-operation-section").classList.add("hidden");
  $("#balance-section").classList.remove("hidden");
});

// Ocultar - mostrar filtros
$("#hide-show-filters").addEventListener("click", () => {
  if ($("#filters-content").classList.contains("hidden")) {
    $("#filters-content").classList.remove("hidden");
    $("#hide-show-filters").innerText = "Ocultar filtros";
  } else {
    $("#filters-content").classList.add("hidden");
    $("#hide-show-filters").innerText = "Mostrar filtros";
  }
});
