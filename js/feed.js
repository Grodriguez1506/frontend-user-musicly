"use strict";

const welcomeText = document.querySelector(".welcomeText");
const errorAlert = document.querySelector(".errorAlert");
const searchForm = document.getElementById("searchForm");
const searchInput = document.getElementById("searchInput");
const searchSection = document.querySelector(".searchSection");
const feedSection = document.querySelector(".feedSection");
const user = JSON.parse(localStorage.getItem("user"));
const logoutBtn = document.getElementById("logoutBtn");
const searchTitle = document.getElementById("searchTitle");

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

  const populateFeed = async () => {
    try {
      let response = await fetch(`${API_URL}/follow/feed`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-type": "application/json",
        },
      });

      if (response.status == 401) {
        const newToken = await refreshToken();
        if (newToken) {
          response = await fetch(`${API_URL}/follow/feed`, {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-type": "application/json",
            },
          });
        }
      }

      const data = await response.json();

      const feed = data.feed;

      feed.forEach((publication) => {
        if (publication.type == "album") {
          const card = document.createElement("div");
          card.classList.add("card", "mb-5");
          const row = document.createElement("div");
          row.classList.add("row", "g-0");
          const col4 = document.createElement("div");
          col4.classList.add("col-md-4");
          const albumCover = document.createElement("img");
          albumCover.classList.add("img-fluid", "rounded-start");
          albumCover.setAttribute(
            "src",
            `${API_URL}/album/media/${publication._id}`
          );
          const col8 = document.createElement("div");
          col8.classList.add("col-md-8");
          const cardBody = document.createElement("div");
          cardBody.classList.add("card-body");
          const artistName = document.createElement("a");
          artistName.classList.add("card-title");
          artistName.innerHTML = publication.artist.artisticName;
          artistName.addEventListener("click", () => {
            localStorage.setItem("artist", JSON.stringify(publication.artist));
            window.location.href = "/artist-profile.html";
          });
          const albumName = document.createElement("h3");
          albumName.classList.add("card-text");
          albumName.innerHTML = `${publication.title} - ${publication.year}`;
          const type = document.createElement("h5");
          type.classList.add("card-text");
          type.innerHTML = publication.type;
          const date = document.createElement("p");
          date.classList.add("card-text", "text-body-secondary");
          const options = { day: "2-digit", month: "2-digit", year: "numeric" };
          const created_at = new Date(publication.created_at);
          const formatedDate = created_at.toLocaleDateString("es-ES", options);
          date.innerHTML = `Uploaded at ${formatedDate}`;

          cardBody.appendChild(albumName);
          cardBody.appendChild(artistName);
          cardBody.appendChild(type);
          cardBody.appendChild(date);

          col8.appendChild(cardBody);
          col4.appendChild(albumCover);
          row.appendChild(col4);
          row.appendChild(col8);
          card.appendChild(row);
          feedSection.appendChild(card);
        } else {
          const card = document.createElement("div");
          card.classList.add("card", "mb-5");
          const row = document.createElement("div");
          row.classList.add("row", "g-0");
          const col4 = document.createElement("div");
          col4.classList.add("col-md-4");
          const songCover = document.createElement("img");
          songCover.classList.add("img-fluid", "rounded-start");
          songCover.setAttribute("src", "../css/images/songImage.jpg");
          const col8 = document.createElement("div");
          col8.classList.add("col-md-8");
          const cardBody = document.createElement("div");
          cardBody.classList.add("card-body");
          const artistName = document.createElement("a");
          artistName.classList.add("card-title");
          artistName.innerHTML = publication.artist.artisticName;
          const songName = document.createElement("h3");
          songName.classList.add("card-text");
          songName.innerHTML = publication.name;

          const type = document.createElement("h5");
          type.classList.add("card-text");
          type.innerHTML = publication.type;
          const date = document.createElement("p");
          date.classList.add("card-text", "text-body-secondary");
          const options = { day: "2-digit", month: "2-digit", year: "numeric" };
          const created_at = new Date(publication.created_at);
          const formatedDate = created_at.toLocaleDateString("es-ES", options);
          date.innerHTML = `Uploaded at ${formatedDate}`;

          cardBody.appendChild(songName);
          cardBody.appendChild(artistName);
          cardBody.appendChild(type);
          cardBody.appendChild(date);

          col8.appendChild(cardBody);
          col4.appendChild(songCover);
          row.appendChild(col4);
          row.appendChild(col8);
          card.appendChild(row);
          feedSection.appendChild(card);
        }
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
        feedSection.style.display = "none";
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

  searchForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    search();
  });

  populateFeed();
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
