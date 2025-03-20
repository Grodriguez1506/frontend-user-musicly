"use strict";

const loader = document.querySelector(".loader");
const loginForm = document.getElementById("loginForm");
const inputEmail = document.querySelector(".inputEmail");
const inputPassword = document.querySelector(".inputPassword");
const loginError = document.querySelector(".loginError");

const API_URL = "http://localhost:3900/api";

const loadingFunction = () => {
  loginForm.style.display = "none";
  loader.style.display = "flex";
};

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  loadingFunction();

  const email = inputEmail.value;
  const password = inputPassword.value;

  try {
    const response = await fetch(`${API_URL}/user/login`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (data.status == "error") {
      loginForm.style.display = "flex";
      loader.style.display = "none";
      loginError.style.display = "block";
      return (loginError.innerHTML = data.message);
    }

    localStorage.setItem("access_token", data.token);

    document.location.href = "/homepage.html";
  } catch (error) {
    console.log(error);
  }
});
