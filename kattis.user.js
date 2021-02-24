// ==UserScript==
// @name         Non-contest link
// @version      0.1
// @description  Get a non-contest link for Kattis
// @author       Matt
// @match        https://open.kattis.com/contests/*/problems/*
// ==/UserScript==

(function() {
  'use strict';
  function getProblemName() {
      return window.location.href.split("/").pop()
  }
  var buttonGroup = document.getElementsByClassName("alt-buttons")[0]
  var newButton = buttonGroup.children[0].cloneNode()
  newButton.setAttribute("href", "/problems/" + getProblemName())
  newButton.innerText = "Non-contest link"
  buttonGroup.appendChild(newButton)
})();