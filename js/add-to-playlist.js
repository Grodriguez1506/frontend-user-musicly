"use strict";

var user = JSON.parse(localStorage.getItem("user"));
var song = JSON.parse(localStorage.getItem("song"));
var token = localStorage.getItem("access_token");
const logoutBtn = document.getElementById("logoutBtn");
const welcomeText = document.querySelector(".welcomeText");
const errorAlert = document.querySelector(".errorAlert");
const formAlert = document.querySelector(".formAlert");
const select = document.getElementById("playlistsSelect");
const playlistForm = document.getElementById("addPlaylistForm");
const searchSection = document.querySelector(".searchSection");
const searchForm = document.getElementById("searchForm");
const searchInput = document.getElementById("searchInput");
const API_URL = "http://127.0.0.1:3900/api";

const refreshToken = async () => {
  try {
    const response = await fetch(`${API_URL}/user/refresh`, {
      method: "POST",
      credentials: "include",
    });
    const data = await response.json();
    if (data.status === "success") {
      // ESTABLECER EL NUEVO ACCESS TOKEN EN EL LOCAL STORAGE
      localStorage.setItem("access_token", data.token);
      // MODIFICAR LA VARIABLE TOKEN CON EL NUEVO ACCESS TOKEN
      token = localStorage.getItem("access_token");

      return data.token;
    } else {
      window.location.href = "/user/login.html";
    }
  } catch (error) {
    window.location.href = "/user/login.html";
  }
};

if (token) {
  welcomeText.innerHTML = `Welcome ${user.username}`;

  const follow = async (btn, id) => {
    try {
      let response = await fetch(`${API_URL}/follow/save`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-type": "application/json",
        },
        body: JSON.stringify({ artist: id }),
      });

      if (response.status == 401) {
        const newToken = await refreshToken();
        if (newToken) {
          response = await fetch(`${API_URL}/follow/save`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-type": "application/json",
            },
            body: JSON.stringify({ artist: id }),
          });
        }
      }

      const data = await response.json();

      if (data.status == "success") {
        btn.classList.replace("btn-primary", "btn-danger");
        btn.innerHTML = "Unfollow";
      }
    } catch (error) {
      console.log(error);
    }
  };

  const unfollow = async (btn, id) => {
    try {
      let response = await fetch(`${API_URL}/follow/unfollow`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-type": "application/json",
        },
        body: JSON.stringify({ id }),
      });

      if (response.status == 401) {
        const newToken = await refreshToken();
        if (newToken) {
          response = await fetch(`${API_URL}/follow/unfollow`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-type": "application/json",
            },
            body: JSON.stringify({ id }),
          });
        }
      }

      const data = await response.json();

      if (data.status == "success") {
        btn.classList.replace("btn-danger", "btn-primary");
        btn.innerHTML = "Follow";
      }
    } catch (error) {
      console.log(error);
    }
  };

  const populatePlaylists = async () => {
    try {
      let response = await fetch(`${API_URL}/playlist/list`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-type": "application/json",
        },
      });

      if (response.status == 401) {
        const newToken = await refreshToken();
        if (newToken) {
          response = await fetch(`${API_URL}/playlist/list`, {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-type": "application/json",
            },
          });
        }
      }

      const data = await response.json();

      if (!data.playlists) {
        errorAlert.innerHTML = data.message;
        return (errorAlert.style.display = "block");
      }

      const playlists = data.playlists;

      playlists.forEach((playlist) => {
        const option = document.createElement("option");
        option.setAttribute("value", playlist._id);
        option.innerHTML = playlist.name;
        select.appendChild(option);
      });
    } catch (error) {
      console.log(error);
    }
  };

  const search = async () => {
    const search = searchInput.value;

    if (search) {
      try {
        let response = await fetch(`${API_URL}/artist/search/${search}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-type": "application/json",
          },
        });

        if (response.status == 401) {
          const newToken = refreshToken();
          if (newToken) {
            response = await fetch(`${API_URL}/artist/search/${search}`, {
              method: "GET",
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-type": "application/json",
              },
            });
          }
        }

        const data = await response.json();

        if (!data.artists) {
          errorAlert.innerHTML = data.message;
          searchSection.innerHTML = "";
          return (errorAlert.style.display = "block");
        }

        errorAlert.innerHTML = "";
        errorAlert.style.display = "none";
        playlistForm.style.display = "none";
        searchSection.style.display = "flex";

        searchSection.innerHTML = "";

        const follows = data.follows;

        const artists = data.artists;

        artists.forEach((artist) => {
          const artistList = document.createElement("div");
          artistList.classList.add("artistList");
          const artistPicture = document.createElement("div");
          artistPicture.classList.add("artistPicture");
          const avatar = document.createElement("img");
          avatar.setAttribute(
            "src",
            `${API_URL}/artist/avatar/${artist.avatar}`
          );
          const artistName = document.createElement("div");
          artistName.classList.add("artisticName");
          const linkProfile = document.createElement("a");
          linkProfile.classList.add("artistProfile");
          linkProfile.innerHTML = artist.artisticName;
          linkProfile.addEventListener("click", () => {
            localStorage.setItem("artist", JSON.stringify(artist));
            window.location.href = "/user/artist-profile.html";
          });
          const addBtn = document.createElement("a");
          addBtn.classList.add("followArtist");
          if (follows.includes(artist._id)) {
            addBtn.classList.add("btn", "btn-danger");
            addBtn.innerHTML = "Unfollow";
          } else {
            addBtn.classList.add("btn", "btn-primary");
            addBtn.innerHTML = "Follow";
          }
          addBtn.addEventListener("click", () => {
            if (addBtn.innerHTML == "Follow") {
              follow(addBtn, artist._id);
            } else {
              unfollow(addBtn, artist._id);
            }
          });

          artistPicture.appendChild(avatar);
          artistName.appendChild(linkProfile);
          artistList.appendChild(artistPicture);
          artistList.appendChild(artistName);
          artistList.appendChild(addBtn);

          searchSection.appendChild(artistList);
        });
      } catch (error) {
        window.location.href = "/user/login.html";
      }
    }
  };

  populatePlaylists();

  playlistForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const playlist = select.value;
    const songId = song._id;

    try {
      let response = await fetch(`${API_URL}/playlist/add-song`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-type": "application/json",
        },
        body: JSON.stringify({ playlist, song: songId }),
      });

      if (response.status == 401) {
        const newToken = await refreshToken();
        if (newToken) {
          response = await fetch(`${API_URL}/playlist/add-song`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-type": "application/json",
            },
            body: JSON.stringify({ playlist, song }),
          });
        }
      }

      const data = await response.json();

      if (data.status == "error") {
        formAlert.innerHTML = data.message;
        formAlert.classList.add("alert-danger");
        return (formAlert.style.display = "block");
      }

      formAlert.innerHTML = data.message;
      formAlert.classList.add("alert-success");
      formAlert.style.display = "block";

      select.value = "";
    } catch (error) {
      console.log(error);
    }
  });

  searchForm.addEventListener("submit", (e) => {
    e.preventDefault();
    search();
  });
} else {
  window.location.href = "/user/login.html";
}

const logout = async () => {
  try {
    await fetch(`${API_URL}/user/logout`);
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    localStorage.removeItem("song");
    localStorage.removeItem("artist");

    document.location.href = "/user/login.html";
  } catch (error) {
    console.log(error);
  }
};

logoutBtn.addEventListener("click", logout);
