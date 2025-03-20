"use strict";

const welcomeText = document.querySelector(".welcomeText");
const errorAlert = document.querySelector(".errorAlert");
const sideInfoBar = document.querySelector(".sideInfoBar");
const profilePicture = document.querySelector(".profilePicture");
const username = document.querySelector(".username");
const names = document.querySelector(".names");
const searchSection = document.querySelector(".searchSection");
const searchForm = document.getElementById("searchForm");
const searchInput = document.getElementById("searchInput");
const artist = JSON.parse(localStorage.getItem("artist"));
const logoutBtn = document.getElementById("logoutBtn");
const albumList = document.querySelector(".albumList");
const musicsList = document.querySelector(".musicsList");
const albumSection = document.querySelector(".albumSection");
const albumSongs = document.querySelector(".albumSongs");
const albumPhoto = document.querySelector(".albumPhoto");
const albumTitle = document.querySelector(".albumTitle");
const albumDescription = document.querySelector(".albumDescription");

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
    profilePicture.setAttribute(
      "src",
      `${API_URL}/artist/avatar/${artist.avatar}`
    );
    username.innerHTML = `@${artist.artisticName}`;
    names.innerHTML = `${artist.name} ${artist.surname}`;
    welcomeText.innerHTML = `Welcome ${artist.artisticName}`;
  };

  const populateAlbums = async () => {
    const id = artist._id;

    try {
      let response = await fetch(`${API_URL}/album/list-by-artist/${id}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-type": "application/json",
        },
      });

      if (response.status == 401) {
        const newToken = await refreshToken();
        if (newToken) {
          response = await fetch(`${API_URL}/album/list-by-artist/${id}`, {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-type": "application/json",
            },
          });
        }
      }

      const data = await response.json();

      if (data.albums) {
        const albums = data.albums;

        albums.forEach((album) => {
          const list = document.createElement("li");
          const linkAlbum = document.createElement("a");
          linkAlbum.innerHTML = album.title;
          linkAlbum.addEventListener("click", () => {
            albumTitle.innerHTML = album.title;
            albumPhoto.setAttribute(
              "src",
              `${API_URL}/album/media/${album._id}`
            );
            albumDescription.innerHTML = album.description;

            populateAlbumSongs(album);

            albumSection.style.display = "flex";
          });
          list.appendChild(linkAlbum);
          albumList.appendChild(list);
        });
      }
    } catch (error) {
      console.log(error);
    }
  };

  const populateAlbumSongs = async (album) => {
    try {
      let response = await fetch(`${API_URL}/song/list-by-album/${album._id}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-type": "application/json",
        },
      });

      if (response.status == 401) {
        const newToken = await refreshToken();
        if (newToken) {
          response = await fetch(`${API_URL}/song/list-by-album/${album._id}`, {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-type": "application/json",
            },
          });
        }
      }

      const data = await response.json();

      if (data.songs) {
        const songs = data.songs;

        albumSongs.innerHTML = "";

        songs.forEach((song) => {
          const list = document.createElement("li");
          const linkSong = document.createElement("a");
          linkSong.innerHTML = song.name;
          linkSong.addEventListener("click", () => {
            console.log(song);
            localStorage.setItem("song", JSON.stringify(song));
            window.location.href = "/music-player.html";
          });
          list.appendChild(linkSong);
          albumSongs.appendChild(list);
        });
      }
    } catch (error) {
      console.log(error);
    }
  };

  const populateSongs = async () => {
    const id = artist._id;

    try {
      let response = await fetch(`${API_URL}/song/list-by-artist/${id}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-type": "application/json",
        },
      });

      if (response.status == 401) {
        const newToken = await refreshToken();
        if (newToken) {
          response = await fetch(`${API_URL}/songs/list-by-artist/${id}`, {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-type": "application/json",
            },
          });
        }
      }

      const data = await response.json();

      if (data.songs) {
        const songs = data.songs;

        songs.forEach((song) => {
          const list = document.createElement("li");
          const linkSong = document.createElement("a");
          linkSong.innerHTML = song.name;
          linkSong.addEventListener("click", () => {
            localStorage.setItem("song", JSON.stringify(song));
            window.location.href = "/music-player.html";
          });
          list.appendChild(linkSong);
          musicsList.appendChild(list);
        });
      }
    } catch (error) {
      console.log(error);
    }
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
        albumSection.style.display = "none";
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

  searchForm.addEventListener("submit", (e) => {
    e.preventDefault();
    search();
  });

  populatePersonalInfo();
  populateAlbums();
  populateSongs();
} else {
  document.location.href = "/login.html";
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
