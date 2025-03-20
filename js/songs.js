"use strict";

const welcomeText = document.querySelector(".welcomeText");
const errorAlert = document.querySelector(".errorAlert");
const searchForm = document.getElementById("searchForm");
const searchInput = document.getElementById("searchInput");
const searchSection = document.querySelector(".searchSection");
const user = JSON.parse(localStorage.getItem("user"));
const logoutBtn = document.getElementById("logoutBtn");
const songsSection = document.querySelector(".songsSection");
const listOfSongs = document.querySelector(".listOfSongs");
const searchTitle = document.getElementById("searchTitle");
const searchSongForm = document.getElementById("searchSongForm");
const songInput = document.getElementById("songInput");
const pagination = document.querySelector(".pagination");
const previous = document.querySelector(".previous");
const next = document.querySelector(".next");
const currentPage = document.querySelector(".currentPage");

const API_URL = "http://localhost:3900/api";

var token = localStorage.getItem("access_token");

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
      window.location.href = "/login.html";
    }
  } catch (error) {
    window.location.href = "/login.html";
  }
};

if (token) {
  // TRAER LA INFORMACIÓN PERSONAL DEL USUARIO
  const populatePersonalInfo = () => {
    welcomeText.innerHTML = `Welcome ${user.username}`;
  };

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
          const newToken = await refreshToken();
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
        songsSection.style.display = "none";
        searchSection.style.display = "flex";

        searchSection.innerHTML = "";

        searchTitle.innerHTML = "Artists Found";
        searchSection.appendChild(searchTitle);

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
            window.location.href = "/artist-profile.html";
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
        window.location.href = "/login.html";
      }
    }
  };

  const searchSong = async () => {
    const song = songInput.value;

    if (song) {
      try {
        let response = await fetch(`${API_URL}/song/search/${song}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-type": "application/json",
          },
        });

        if (response.status == 401) {
          const newToken = await refreshToken();
          if (newToken) {
            response = await fetch(`${API_URL}/song/search/${song}`, {
              method: "GET",
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-type": "application/json",
              },
            });
          }
        }

        const data = await response.json();

        if (!data.songs) {
          searchSection.innerHTML = "";
          errorAlert.style.display = "block";
          return (errorAlert.innerHTML = data.message);
        }

        const songs = data.songs;

        errorAlert.innerHTML = "";
        errorAlert.style.display = "none";
        songsSection.style.display = "none";
        searchSection.style.display = "block";
        searchSection.innerHTML = "";

        songs.forEach((song) => {
          const card = document.createElement("div");
          card.classList.add("card", "text-bg-light", "songCard");
          const cardHeader = document.createElement("a");
          cardHeader.classList.add("card-header");
          cardHeader.innerHTML = song.artist.artisticName;
          const cardBody = document.createElement("div");
          cardBody.classList.add("card-body");
          const cardTitle = document.createElement("h5");
          cardTitle.classList.add("card-title");
          cardTitle.innerHTML = song.name;
          const date = document.createElement("span");
          date.classList.add("songDate");
          const created_at = new Date(song.created_at);
          const options = { day: "2-digit", month: "2-digit", year: "numeric" };
          const formatedDate = created_at.toLocaleDateString("es-ES", options);
          date.innerHTML = `Uploaded on ${formatedDate}`;
          const goListen = document.createElement("a");
          goListen.classList.add("btn", "btn-outline-dark");
          goListen.innerHTML = "Go to listen";
          goListen.addEventListener("click", () => {
            localStorage.setItem("song", JSON.stringify(song));
            window.location.href = "/music-player.html";
          });

          cardBody.appendChild(cardTitle);
          cardBody.appendChild(date);
          cardBody.appendChild(goListen);
          card.appendChild(cardHeader);
          card.appendChild(cardBody);
          searchSection.appendChild(card);
        });
      } catch (error) {
        console.log(error);
      }
    } else {
      errorAlert.innerHTML = "";
      errorAlert.style.display = "none";
      songsSection.style.display = "flex";
      searchSection.style.display = "none";
      listOfSongs.innerHTML = "";
      populateSongs();
    }
  };

  const populateSongs = async () => {
    try {
      let response = await fetch(`${API_URL}/song/list`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-type": "application/json",
        },
      });

      if (response.status == 401) {
        const newToken = await refreshToken();
        if (newToken) {
          response = await fetch(`${API_URL}/song/list`, {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-type": "application/json",
            },
          });
        }
      }

      const data = await response.json();

      const songs = data.songs;

      songs.forEach((song) => {
        const card = document.createElement("div");
        card.classList.add("card", "text-bg-light", "songCard");
        const cardHeader = document.createElement("a");
        cardHeader.classList.add("card-header");
        cardHeader.innerHTML = song.artist.artisticName;
        cardHeader.addEventListener("click", () => {
          localStorage.setItem("artist", JSON.stringify(song.artist));
          window.location.href = "/artist-profile.html";
        });
        const cardBody = document.createElement("div");
        cardBody.classList.add("card-body");
        const cardTitle = document.createElement("h5");
        cardTitle.classList.add("card-title");
        cardTitle.innerHTML = song.name;
        const date = document.createElement("span");
        date.classList.add("songDate");
        const created_at = new Date(song.created_at);
        const options = { day: "2-digit", month: "2-digit", year: "numeric" };
        const formatedDate = created_at.toLocaleDateString("es-ES", options);
        date.innerHTML = `Uploaded on ${formatedDate}`;
        const goListen = document.createElement("a");
        goListen.classList.add("btn", "btn-outline-dark");
        goListen.innerHTML = "Go to listen";
        goListen.addEventListener("click", () => {
          localStorage.setItem("song", JSON.stringify(song));
          window.location.href = "/music-player.html";
        });

        cardBody.appendChild(cardTitle);
        cardBody.appendChild(date);
        cardBody.appendChild(goListen);
        card.appendChild(cardHeader);
        card.appendChild(cardBody);
        listOfSongs.appendChild(card);
      });

      if (!data.prev) {
        previous.classList.add("disabled");
        previous.removeEventListener("click", previousPage);
        previous.style.cursor = "default";
      }

      if (!data.next) {
        next.classList.add("disabled");
        next.removeEventListener("click", next);
        next.style.cursor = "default";
      }

      currentPage.innerHTML = data.currentPage;
    } catch (error) {
      console.log(error);
    }
  };

  const previousPage = async () => {
    const newValue = parseInt(currentPage.value) - 1;

    try {
      let response = await fetch(`${API_URL}/song/list/${newValue}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-type": "application/json",
        },
      });

      if (response.status == 401) {
        const newToken = await refreshToken();
        if (newToken) {
          response = await fetch(`${API_URL}/song/list/${newValue}`, {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-type": "application/json",
            },
          });
        }
      }

      const data = await response.json();

      const songs = data.songs;

      listOfSongs.innerHTML = "";

      songs.forEach((song) => {
        const card = document.createElement("div");
        card.classList.add("card", "text-bg-light", "songCard");
        const cardHeader = document.createElement("a");
        cardHeader.classList.add("card-header");
        cardHeader.innerHTML = song.artist.artisticName;
        const cardBody = document.createElement("div");
        cardBody.classList.add("card-body");
        const cardTitle = document.createElement("h5");
        cardTitle.classList.add("card-title");
        cardTitle.innerHTML = song.name;
        const date = document.createElement("span");
        date.classList.add("songDate");
        const created_at = new Date(song.created_at);
        const options = { day: "2-digit", month: "2-digit", year: "numeric" };
        const formatedDate = created_at.toLocaleDateString("es-ES", options);
        date.innerHTML = `Uploaded on ${formatedDate}`;
        const goListen = document.createElement("a");
        goListen.classList.add("btn", "btn-outline-dark");
        goListen.innerHTML = "Go to listen";
        goListen.addEventListener("click", () => {
          localStorage.setItem("song", JSON.stringify(song));
          window.location.href = "/music-player.html";
        });

        cardBody.appendChild(cardTitle);
        cardBody.appendChild(date);
        cardBody.appendChild(goListen);
        card.appendChild(cardHeader);
        card.appendChild(cardBody);
        listOfSongs.appendChild(card);
      });

      if (data.prev) {
        previous.classList.remove("disabled");
        previous.style.cursor = "pointer";
        previous.addEventListener("click", previousPage);
      } else {
        previous.classList.add("disabled");
        previous.style.cursor = "default";
        previous.removeEventListener("click", previousPage);
      }

      if (data.next) {
        next.classList.remove("disabled");
        next.style.cursor = "pointer";
        next.addEventListener("click", nextPage);
      } else {
        next.classList.add("disabled");
        next.style.cursor = "default";
        next.removeEventListener("click", nextPage);
      }

      currentPage.innerHTML = data.currentPage;
    } catch (error) {
      console.log(error);
    }
  };

  const nextPage = async () => {
    const newValue = parseInt(currentPage.textContent) + 1;

    try {
      let response = await fetch(`${API_URL}/song/list/${newValue}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-type": "application/json",
        },
      });

      if (response.status == 401) {
        const newToken = await refreshToken();
        if (newToken) {
          response = await fetch(`${API_URL}/song/list/${newValue}`, {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-type": "application/json",
            },
          });
        }
      }

      const data = await response.json();

      const songs = data.songs;

      listOfSongs.innerHTML = "";

      songs.forEach((song) => {
        const card = document.createElement("div");
        card.classList.add("card", "text-bg-light", "songCard");
        const cardHeader = document.createElement("a");
        cardHeader.classList.add("card-header");
        cardHeader.innerHTML = song.artist.artisticName;
        const cardBody = document.createElement("div");
        cardBody.classList.add("card-body");
        const cardTitle = document.createElement("h5");
        cardTitle.classList.add("card-title");
        cardTitle.innerHTML = song.name;
        const date = document.createElement("span");
        date.classList.add("songDate");
        const created_at = new Date(song.created_at);
        const options = { day: "2-digit", month: "2-digit", year: "numeric" };
        const formatedDate = created_at.toLocaleDateString("es-ES", options);
        date.innerHTML = `Uploaded on ${formatedDate}`;
        const goListen = document.createElement("a");
        goListen.classList.add("btn", "btn-outline-dark");
        goListen.innerHTML = "Go to listen";
        goListen.addEventListener("click", () => {
          localStorage.setItem("song", JSON.stringify(song));
          window.location.href = "/music-player.html";
        });

        cardBody.appendChild(cardTitle);
        cardBody.appendChild(date);
        cardBody.appendChild(goListen);
        card.appendChild(cardHeader);
        card.appendChild(cardBody);
        listOfSongs.appendChild(card);
      });

      if (data.prev) {
        previous.classList.remove("disabled");
        previous.style.cursor = "pointer";
        previous.addEventListener("click", previousPage);
      } else {
        previous.classList.add("disabled");
        previous.style.cursor = "default";
        previous.removeEventListener("click", previousPage);
      }

      if (data.next) {
        next.classList.remove("disabled");
        next.style.cursor = "pointer";
        next.addEventListener("click", nextPage);
      } else {
        next.classList.add("disabled");
        next.style.cursor = "default";
        next.removeEventListener("click", nextPage);
      }

      currentPage.innerHTML = data.currentPage;
    } catch (error) {
      console.log(error);
    }
  };

  populatePersonalInfo();

  populateSongs();

  searchForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    search();
  });

  searchSongForm.addEventListener("submit", (e) => {
    e.preventDefault();

    searchSong();
  });

  previous.addEventListener("click", previousPage);
  next.addEventListener("click", nextPage);
} else {
  window.location.href = "/login.html";
}

const logout = async () => {
  try {
    await fetch(`${API_URL}/user/logout`);
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    localStorage.removeItem("song");
    localStorage.removeItem("artist");

    document.location.href = "/login.html";
  } catch (error) {
    console.log(error);
  }
};

logoutBtn.addEventListener("click", logout);
