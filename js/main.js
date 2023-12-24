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
