"use strict";

const loader = document.querySelector(".loader");
const registerForm = document.getElementById("registerForm");
const inputName = document.querySelector(".inputName");
const inputSurname = document.querySelector(".inputSurname");
const inputUsername = document.querySelector(".inputUsername");
const inputEmail = document.querySelector(".inputEmail");
const inputPassword = document.querySelector(".inputPassword");
const registerError = document.querySelector(".registerError");

const API_URL = "http://localhost:3900/api";

const loadingFunction = () => {
  registerForm.style.display = "none";
  loader.style.display = "flex";
};

registerForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  loadingFunction();

  try {
    const response = await fetch(`${API_URL}/user/register`, {
      method: "POST",
      headers: { "Content-type": "application/json" },
      body: JSON.stringify({
        name: inputName.value,
        surname: inputSurname.value,
        username: inputUsername.value,
        email: inputEmail.value,
        password: inputPassword.value,
      }),
    });

    const data = await response.json();

    if (data.status == "error") {
      registerForm.style.display = "flex";
      loader.style.display = "none";
      registerError.style.display = "block";
      return (registerError.innerHTML = data.message);
    }

    document.location.href = "/login.html";
  } catch (error) {
    console.log(error);
  }
});
