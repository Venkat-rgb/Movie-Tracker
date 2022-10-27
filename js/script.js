import MOVIE_API_KEY from "./apikey.js";

// ALL API LINKS.
const API_KEY = MOVIE_API_KEY;

const API_URL = `https://api.themoviedb.org/3/discover/movie?sort_by=popularity.desc&api_key=${API_KEY}`;

const IMG_URL = `https://image.tmdb.org/t/p/w500`;

const SEARCH_URL = `https://api.themoviedb.org/3/search/movie?&api_key=${API_KEY}&query=`;

const GENRE_DETAILS = `https://api.themoviedb.org/3/genre/movie/list?api_key=${API_KEY}&language=en-US`;

// ALL VARIABLE DECLARATIONS.
const cards = document.querySelector(".cards");
const textBox = document.querySelector(".text-box");
const inputFieldDiv = document.querySelector(".input-field");
const genres = document.querySelector(".genres");
const prevBtn = document.querySelector(".prev__btn");
const nextBtn = document.querySelector(".next__btn");
const currBtn = document.querySelector(".current__btn");
const pagination = document.querySelector(".pagination");
const pTag = document.createElement("p");

// changing colors for imdb rating.
function changeColor(rating) {
  if (rating >= 8) return "green";
  else if (rating >= 5) return "orange";
  else return "red";
}

function renderError(message) {
  pTag.className = "error__message";
  pTag.innerText = message;
  pTag.classList.add("active");
  inputFieldDiv.appendChild(pTag);
}

let currentPage = 1,
  prevPage = 2,
  nextPage = 3,
  totalPages = 4,
  lastUrl = "";

// getting movie data.
async function getData(url = API_URL) {
  try {
    cards.innerHTML = "";
    textBox.value = "";

    const res = await fetch(url);
    if (!res.ok) throw new Error("No Results Found!");

    const data = await res.json();
    let currMovie = data.results;
    if (currMovie.length === 0) {
      genres.style.display = "none";
      pagination.style.display = "none";
      renderError("No Results Found!");
    } else {
      genres.style.display = "flex";
      pagination.style.display = "flex";
      if (pTag.classList.contains("active")) {
        inputFieldDiv.removeChild(document.querySelector(".error__message"));
        pTag.classList.remove("active");
      }
    }

    lastUrl = url;
    currentPage = data.page;
    prevPage = currentPage - 1;
    nextPage = currentPage + 1;
    totalPages = data.total_pages;

    currBtn.innerText = currentPage;

    currMovie.forEach((movie) => {
      const movieImg = movie.poster_path;
      if (!movieImg) return;

      const htmlData = `
      <a href= "html/movie-details.html" class="card__link">
          <div class="card__item">
              <img class="card__img" src=${IMG_URL + movie.poster_path}>
              <div class="card__details">
                  <p class="card__details__name">${movie.title}</p>
                  <span class="card__details__rating ${changeColor(
                    movie.vote_average
                  )}">${movie.vote_average}</span>
              </div>
          </div>
          </a>
      `;
      cards.insertAdjacentHTML("beforeend", htmlData);
    });
  } catch (err) {
    console.error(err);
  }
}
getData();

// when we change input text filed.
textBox.addEventListener("change", function (e) {
  if (this.value === "") return;
  const giveHiphen = this.value.trim().split(" ").join("-");
  const search_url = SEARCH_URL + giveHiphen;
  getData(search_url);
});

let selectedGenre = [];

function changePage(page) {
  const urlSplit = lastUrl.split("?");
  const splitParams = urlSplit[1].split("&");
  const pageParam = splitParams[splitParams.length - 1].split("=");

  if (pageParam[0] !== "page") {
    let url = `${API_URL}&page=${page}`;
    getData(url);
  } else {
    pageParam[1] = page.toString();
    const joinPageParam = pageParam.join("=");
    splitParams[splitParams.length - 1] = joinPageParam;
    const joinSplitParam = splitParams.join("&");
    const joinTotalUrl = `${urlSplit[0]}?${joinSplitParam}`;
    getData(joinTotalUrl);
  }
}

prevBtn.addEventListener("click", function () {
  if (prevPage > 0) {
    changePage(prevPage);
  }
});

nextBtn.addEventListener("click", function () {
  if (nextPage <= totalPages) {
    inputFieldDiv.scrollIntoView({ behavior: "smooth" });

    changePage(nextPage);
  }
});

// displaying all types of genres.
function clearGenre() {
  const isBtnExist = document.querySelector(".genre__title--clear");
  if (!isBtnExist) {
    const clearBtn = document.createElement("button");
    clearBtn.className = "genre__title--clear";
    clearBtn.innerText = "Clear";
    genres.appendChild(clearBtn);
    clearBtn.addEventListener("click", function () {
      selectedGenre = [];
      setGenre();
      getData();
    });
  }
}

async function setGenre() {
  try {
    genres.innerHTML = "";
    const res = await fetch(GENRE_DETAILS);
    const data = await res.json();
    const allGenres = data.genres;

    allGenres.forEach((genre, i) => {
      const currGenre = document.createElement("button");
      currGenre.className = "genre__title";
      currGenre.id = genre.id;
      currGenre.innerText = genre.name;
      genres.appendChild(currGenre);

      currGenre.addEventListener("click", function () {
        currGenre.style.backgroundColor = "rgb(255, 103, 103)";
        if (selectedGenre.length === 0) {
          selectedGenre.push(genre.id);
        } else {
          if (selectedGenre.includes(genre.id)) {
            const index = selectedGenre.indexOf(genre.id);
            selectedGenre.splice(index, 1);
            currGenre.style.backgroundColor = "rgb(250, 177, 42)";
          } else {
            selectedGenre.push(genre.id);
          }
        }
        getData(`${API_URL}&with_genres=${selectedGenre.join(",")}`);
        clearGenre();
      });
    });
  } catch (err) {
    console.log(err);
  }
}
setGenre();

async function getDataOnClick(e) {
  try {
    let currDetails = e.target.closest(".card__item");
    if (!currDetails) return;

    currDetails = currDetails.querySelector(".card__details__name");
    const movieName = currDetails.innerText.split(" ").join("-");
    const movieUrl = SEARCH_URL + movieName;

    localStorage.setItem("movie_link", movieUrl);
  } catch (err) {
    console.error(err);
  }
}

// when we click on card_items this should happen.
cards.addEventListener("click", getDataOnClick);
