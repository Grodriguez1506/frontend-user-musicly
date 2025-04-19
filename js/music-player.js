"use strict";

const songTitle = document.querySelector(".songTitle");
const albumInfo = document.querySelector(".albumInfo");
const songSelected = document.getElementById("songSelected");
var song = JSON.parse(localStorage.getItem("song"));
var user = JSON.parse(localStorage.getItem("user"));
const token = localStorage.getItem("access_token");
const searchForm = document.getElementById("searchForm");
const searchInput = document.getElementById("searchInput");
const errorAlert = document.querySelector(".errorAlert");
const mainPlayer = document.querySelector(".mainPlayer");
const searchSection = document.querySelector(".searchSection");
const searchTitle = document.getElementById("searchTitle");
const addToPlaylist = document.getElementById("addToPlaylist");
const like = document.getElementById("like");
const unlike = document.getElementById("unlike");
const likes = document.querySelector(".likes");
const logoutBtn = document.getElementById("logoutBtn");
const welcomeText = document.querySelector(".welcomeText");
const deleteFromPlaylist = document.getElementById("deleteFromPlaylist");

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
    }
  } catch (error) {
    console.log(error);
    // window.location.href = "/user/login.html";
  }
};

if (token) {
  welcomeText.innerHTML = `Welcome ${user.username}`;

  songTitle.innerHTML = `${song.name} - ${song.artist.artisticName}`;

  if (song.album) {
    albumInfo.innerHTML = `${song.album.title} - ${song.album.year}`;
  }

  if (song.likes.length == 1) {
    likes.innerHTML = `<i class='bx bxs-like' ></i> ${song.likes.length} like`;
  } else if (song.likes.length > 1) {
    likes.innerHTML = `<i class='bx bxs-like' ></i> ${song.likes.length} likes`;
  }

  if (song.likes.includes(user._id)) {
    like.style.display = "none";
    unlike.style.display = "block";
  } else {
    unlike.style.display = "none";
  }

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

  const playSong = async () => {
    try {
      let response = await fetch(`${API_URL}/song/media/${song._id}`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status == 401) {
        const newToken = await refreshToken();
        if (newToken) {
          response = await fetch(`${API_URL}/song/media/${song._id}`, {
            method: "GET",
            headers: { Authorization: `Bearer ${token}` },
          });
        }
      }

      const blob = await response.blob();

      const audioUrl = URL.createObjectURL(blob);

      songSelected.setAttribute("src", audioUrl);
      songSelected.load();
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
            response = await fetch(`${API_URL}/artist/search`, {
              method: "GET",
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-type": "application/json",
              },
              body: JSON.stringify({ search }),
            });
          }
        }

        const data = await response.json();

        if (!data.artists) {
          mainPlayer.style.display = "flex";
          errorAlert.innerHTML = data.message;
          searchSection.innerHTML = "";
          return (errorAlert.style.display = "block");
        }

        errorAlert.innerHTML = "";
        errorAlert.style.display = "none";
        mainPlayer.style.display = "none";
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

          songSelected.pause();
          searchSection.appendChild(artistList);
        });
      } catch (error) {
        console.log(error);
      }
    }
  };

  searchForm.addEventListener("submit", (e) => {
    e.preventDefault();
    search();
  });

  addToPlaylist.addEventListener("click", () => {
    console.log("añadiendo a playlist...");
  });

  like.addEventListener("click", async () => {
    const id = song._id;

    try {
      let response = await fetch(`${API_URL}/song/like`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-type": "application/json",
        },
        body: JSON.stringify({ song: id }),
      });

      if (response.status == 401) {
        const newToken = await refreshToken();
        if (newToken) {
          response = await fetch(`${API_URL}/song/like`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ song: id }),
          });
        }
      }

      const data = await response.json();

      if (data.likes.length == 1) {
        likes.innerHTML = `<i class='bx bxs-like' ></i> ${data.likes.length} like`;
      } else if (data.likes.length > 1) {
        likes.innerHTML = `<i class='bx bxs-like' ></i> ${data.likes.length} likes`;
      }

      like.style.display = "none";
      unlike.style.display = "block";

      localStorage.setItem("song", JSON.stringify(data.song));
    } catch (error) {
      console.log(error);
    }
  });

  unlike.addEventListener("click", async () => {
    const id = song._id;

    try {
      const response = await fetch(`${API_URL}/song/dislike`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-type": "application/json",
        },
        body: JSON.stringify({ song: id }),
      });

      if (response.status == 401) {
        const newToken = refreshToken();
        if (newToken) {
          response = await fetch(`${API_URL}/song/dislike`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-type": "application/json",
            },
            body: JSON.stringify({ song: id }),
          });
        }
      }

      const data = await response.json();

      console.log(data);

      if (data.likes.length == 1) {
        likes.innerHTML = `<i class='bx bxs-like' ></i> ${data.likes.length} like`;
      } else if (data.likes.length > 1) {
        likes.innerHTML = `<i class='bx bxs-like' ></i> ${data.likes.length} likes`;
      }

      like.style.display = "block";
      unlike.style.display = "none";

      localStorage.setItem("song", JSON.stringify(data.song));
    } catch (error) {
      console.log(error);
    }
  });

  addToPlaylist.addEventListener("click", async () => {
    window.location.href = "/user/add-to-playlist.html";
  });

  deleteFromPlaylist.addEventListener("click", () => {
    window.location.href = "/user/delete-from-playlist.html";
  });

  playSong();
} else {
  console.log("error");
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
