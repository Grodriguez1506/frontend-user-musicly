"use strict";

const welcomeText = document.querySelector(".welcomeText");
const errorAlert = document.querySelector(".errorAlert");
const sideInfoBar = document.querySelector(".sideInfoBar");
const profilePicture = document.querySelector(".profilePicture");
const username = document.querySelector(".username");
const names = document.querySelector(".names");
const musicPlayer = document.querySelector(".musicPlayer");
const songTitle = document.querySelector(".songTitle");
const albumInfo = document.querySelector(".albumInfo");
const searchSection = document.querySelector(".searchSection");
const searchForm = document.getElementById("searchForm");
const searchInput = document.getElementById("searchInput");
const songSelected = document.getElementById("songSelected");
const user = JSON.parse(localStorage.getItem("user"));
const fileInput = document.getElementById("fileInput");
const logoutBtn = document.getElementById("logoutBtn");
const newPlaylist = document.querySelector(".newPlaylist");
const playlistCover = document.querySelector(".playlistCover");

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
      window.location.href = "/user/login.html";
    }
  } catch (error) {
    window.location.href = "/user/login.html";
  }
};

if (token) {
  // TRAER LA INFORMACIÓN PERSONAL DEL USUARIO
  const populatePersonalInfo = () => {
    profilePicture.setAttribute("src", `${API_URL}/user/avatar/${user.avatar}`);
    username.innerHTML = `@${user.username}`;
    names.innerHTML = `${user.name} ${user.surname}`;
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

  const playSong = async (id) => {
    try {
      let response = await fetch(`${API_URL}/song/media/${id}`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status == 401) {
        const newToken = await refreshToken();
        if (newToken) {
          response = await fetch(`${API_URL}/song/media/${id}`, {
            method: "GET",
            headers: { Authorization: `Bearer ${token}` },
          });
        }
      }

      const blob = await response.blob();
      const audioUrl = URL.createObjectURL(blob);

      return audioUrl;
    } catch (error) {
      console.log(error);
    }
  };

  const returnUrl = async (song) => {
    try {
      let response = await fetch(`${API_URL}/song/media/${song}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status == 401) {
        const newToken = refreshToken();
        if (newToken) {
          response = await fetch(`${API_URL}/song/media/${song}`, {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
        }
      }

      const blob = await response.blob();

      return URL.createObjectURL(blob);
    } catch (error) {
      window.location.href = "/user/login.html";
    }
  };

  const getAllUrls = async (playlist) => {
    const urls = await Promise.all(playlist.map((song) => returnUrl(song._id)));
    return urls;
  };

  // TRAER TODAS LAS PLAYLISTS DEL USUARIO
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
        const newToken = refreshToken();
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

      const playlists = data.playlists;

      // CREAR EL ACORDION PARA LAS PLAYLISTS EXISTENTES DEL USUARIO

      const playlistsContainer = document.createElement("div");
      playlistsContainer.classList.add("accordion", "playlistsAccordion");
      playlistsContainer.style.width = "90%";

      // CREAR CADA ITEM SEGUN EL NUMERO DE PLAYLISTS PARA AÑADIRLOS AL ACORDION

      playlists.forEach((playlist, index) => {
        const playlistsItem = document.createElement("div");
        playlistsItem.classList.add("accordion-item");

        const accordionHeader = document.createElement("h2");
        accordionHeader.classList.add("accordion-header");

        const accordionBtn = document.createElement("button");
        accordionBtn.classList.add("accordion-button");
        accordionBtn.setAttribute("type", "button");
        accordionBtn.setAttribute("data-bs-toggle", "collapse");
        accordionBtn.setAttribute("data-bs-target", `#collapse${index}`);
        accordionBtn.setAttribute("aria-expanded", "true");
        accordionBtn.setAttribute("aria-controls", `collapse${index}`);
        accordionBtn.innerHTML = playlist.name;

        const collapseOne = document.createElement("div");
        collapseOne.classList.add("accordion-collapse", "collapse");
        collapseOne.setAttribute("data-bs-parent", "#accordionExample");
        collapseOne.setAttribute("id", `collapse${index}`);

        const accordionBody = document.createElement("div");
        accordionBody.classList.add("accordion-body");

        const playAll = document.createElement("a");

        if (playlist.songs.length > 0) {
          const playIcon = document.createElement("i");
          playIcon.classList.add("bx", "bx-play-circle");
          playAll.classList.add("playAll");
          playAll.innerHTML = `Play all `;
          playAll.append(playIcon);
          accordionBody.append(playAll);
        } else {
          const playlistWarning = document.createElement("p");
          playlistWarning.innerHTML = "There aren't songs yet";
          accordionBody.append(playlistWarning);
        }

        // AÑADIR FUNCIONALIDAD PARA REPRODUCIR TODA LA PLAYLIST

        playAll.addEventListener("click", async () => {
          var currentIndex = 0;
          const urlArray = await getAllUrls(playlist.songs);

          musicPlayer.style.display = "flex";
          // if (playlist.image) {
          //   playlistCover.setAttribute(
          //     "src",
          //     `${API_URL}/playlist/cover/${playlist._id}`
          //   );
          // }
          songTitle.innerHTML = `${playlist.songs[currentIndex].name} - ${playlist.songs[currentIndex].artist.artisticName}`;
          if (playlist.songs[currentIndex].album) {
            albumInfo.innerHTML = `${playlist.songs[currentIndex].album.title} - ${playlist.songs[currentIndex].album.year}`;
          } else {
            albumInfo.innerHTML = "It doesn't have album";
          }
          songSelected.setAttribute("src", urlArray[currentIndex]);

          do {
            songSelected.addEventListener("ended", () => {
              currentIndex++;
              if (currentIndex < urlArray.length) {
                songTitle.innerHTML = `${playlist.songs[currentIndex].name} - ${playlist.songs[currentIndex].artist.artisticName}`;
                if (playlist.songs[currentIndex].album) {
                  albumInfo.innerHTML = `${playlist.songs[currentIndex].album.title} - ${playlist.songs[currentIndex].album.year}`;
                } else {
                  albumInfo.innerHTML = "It doesn't have album";
                }
                songSelected.setAttribute("src", urlArray[currentIndex]);
              }
            });
          } while (currentIndex == urlArray.length);
        });

        const listSong = document.createElement("ul");
        listSong.classList.add("songList");

        playlist.songs.forEach((song) => {
          // INCLUIR TODAS LAS CANCIONES DE CADA PLAYLIST

          const list = document.createElement("li");
          const linkSong = document.createElement("a");
          linkSong.classList.add("linkSong");
          linkSong.innerHTML = song.name;
          linkSong.setAttribute("title", `Play ${song.name}`);
          linkSong.addEventListener("click", async () => {
            const urlSong = await playSong(song._id);

            // MOSTRAR Y POBLAR LA INFO DE LA CANCIÓN
            // if (playlist.image) {
            //   playlistCover.setAttribute(
            //     "src",
            //     `${API_URL}/playlist/cover/${playlist._id}`
            //   );
            // }
            musicPlayer.style.display = "flex";
            songTitle.innerHTML = `${song.name} - ${song.artist.artisticName}`;
            if (song.album) {
              albumInfo.innerHTML = `${song.album.title} - ${song.album.year}`;
            } else {
              albumInfo.innerHTML = "It doesn't have album";
            }
            songSelected.setAttribute("src", urlSong);
          });
          list.append(linkSong);
          listSong.append(list);
        });

        playlistsContainer.append(playlistsItem);
        playlistsItem.append(accordionHeader);
        accordionHeader.append(accordionBtn);
        playlistsItem.append(collapseOne);
        collapseOne.append(accordionBody);
        accordionBody.append(listSong);
      });

      sideInfoBar.append(playlistsContainer);
    } catch (error) {
      console.log(error);
      // window.location.href = "/user/login.html";
    }
  };

  // FUNCION PARA CAMBIAR FOTO DE PERFIL

  const uploadAvatar = async (formData) => {
    try {
      let response = await fetch(`${API_URL}/user/upload/avatar`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.status == 401) {
        const newToken = refreshToken();
        if (newToken) {
          response = await fetch(`${API_URL}/user/upload/avatar`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: formData,
          });
        }
      }

      const data = await response.json();

      if (data.status == "success") {
        profilePicture.setAttribute(
          "src",
          `${API_URL}/user/avatar/${data.user.avatar}`
        );

        localStorage.setItem("user", JSON.stringify(data.user));
      } else {
        errorAlert.style.display = "block";
        errorAlert.innerHTML = data.message;
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
        musicPlayer.style.display = "none";
        songSelected.pause();
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

  // CAMBIAR FOTO DE PERFIL

  fileInput.addEventListener("change", () => {
    const avatar = fileInput.files[0];

    const formData = new FormData();

    formData.append("avatar", avatar);

    uploadAvatar(formData);
  });

  searchForm.addEventListener("submit", (e) => {
    e.preventDefault();
    search();
  });

  newPlaylist.addEventListener("click", () => {
    window.location.href = "/user/create-playlist.html";
  });

  populatePersonalInfo();

  populatePlaylists();
} else {
  document.location.href = "/user/login.html";
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
