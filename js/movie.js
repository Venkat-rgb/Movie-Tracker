import MOVIE_API_KEY from "./apikey.js";

const movieDetails = localStorage.getItem("movie_link");
const rightContent = document.querySelector(".right__content");
const movieContent = document.querySelector(".movie__content");
const movieCast = document.querySelector(".movie__cast .swiper-wrapper");
const movieCrew = document.querySelector(".movie__crew .swiper-wrapper");
const movieTrailer = document.querySelector(".movie__trailer");
const movieHeading = document.querySelector(".movie__heading");
const movieCastHeading = document.querySelector(".movie__cast--heading");
const movieCrewHeading = document.querySelector(".movie__crew--heading");
const movieTrailerHeading = document.querySelector(".movie__trailer--heading");

const API_KEY = MOVIE_API_KEY;

const IMG_URL = `https://image.tmdb.org/t/p/w500`;

const blankImage = `https://www.diabetes.ie/wp-content/uploads/2017/02/no-image-available-250x417.png`;

setTimeout(() => {
  movieHeading.classList.remove("hide");
  movieCastHeading.classList.remove("hide");
  movieCrewHeading.classList.remove("hide");
  movieTrailerHeading.classList.remove("hide");
}, 1250);

function getDuration(min) {
  const hours = min / 60;
  const afterDecimal = Math.floor(min / 60);
  const minutes = Math.round((hours - afterDecimal) * 60);
  return `${afterDecimal}hr ${minutes}min`;
}

function setMovieInfo(imageData, movieLanguages, movieGenres) {
  const htmlData1 = `
        <p class="movie__name">Name :<span>${imageData.title}</span></p>
        <p class="movie__tagline">Tag Line :<span>--   ${
          imageData.tagline
        } </span></p>
    
        <p class="movie__language">Language :<span>${movieLanguages.join(
          ", "
        )}</span></p>
        <p class="movie__release__date">
            Release Date :<span>${imageData.release_date}</span>
        </p>
        <p class="movie__genre">
            Movie Genres :<span>${movieGenres.join(", ")}</span>
        </p>
        <p class="movie__story">
            Story :<span
            >${imageData.overview}</span>
        </p>
        <p class="movie__runtime">Duration :<span>${getDuration(
          imageData.runtime
        )}</span></p>
        <p class="movie__budget">Movie Budget :<span>$${imageData.budget.toLocaleString(
          "en-US"
        )}</span></p>
        <p class="movie__revenue">Movie Revenue :<span>$${imageData.revenue.toLocaleString(
          "en-US"
        )}</span></p>
        <p class="movie__rating">IMDb Rating :<span>${
          imageData.vote_average
        }</span></p>
    `;
  rightContent.innerHTML = htmlData1;
}

function setCastAndCrew(actor, team = true) {
  let img = `<img src=${IMG_URL}${actor.profile_path}>`;
  if (!actor.profile_path) {
    img = `<img src=${blankImage} class="no__image">`;
  }

  const htmlData = `
            <div class="swiper-slide">
                ${img}
                <p class="name__in__real">${actor.original_name}</p>
                <p class="name__in__movie">${
                  team === true ? actor.character : actor.job
                }</p>
            </div>
           `;
  if (team === true) {
    movieCast.insertAdjacentHTML("beforeend", htmlData);
  } else {
    movieCrew.insertAdjacentHTML("beforeend", htmlData);
  }
}

async function setData() {
  try {
    const res = await fetch(movieDetails);

    if (!res.ok) throw new Error("No Results Found");

    const data = await res.json();
    const [movieData] = data.results;
    const movieId = movieData.id;

    const imageRes = await fetch(
      `https://api.themoviedb.org/3/movie/${movieId}?api_key=${API_KEY}&language=en-US`
    );
    if (!imageRes.ok) throw new Error("No Results Found");

    const imageData = await imageRes.json();

    const castLink = fetch(
      `https://api.themoviedb.org/3/movie/${imageData.id}/credits?api_key=${API_KEY}&language=en-US`
    );

    const trailerLink = fetch(
      `https://api.themoviedb.org/3/movie/${imageData.id}/videos?api_key=${API_KEY}&language=en-US`
    );
    const castAndTrailerLinks = await Promise.all([castLink, trailerLink]);

    if (!castAndTrailerLinks[0].ok) throw new Error("No Results Found");
    if (!castAndTrailerLinks[1].ok) throw new Error("No Results Found");

    const castData = await castAndTrailerLinks[0].json();
    const { results: trailerData } = await castAndTrailerLinks[1].json();

    const movieGenres = imageData.genres.map((genre) => {
      return genre.name;
    });

    const movieLanguages = imageData.spoken_languages.map((language) => {
      return language.english_name;
    });

    // setting cast data.
    castData.cast.forEach((actor) => {
      setCastAndCrew(actor);
    });

    // prettier-ignore
    const crewCategories = ["Editor","Director","Producer","Original Music Composer","Writer"];

    const crewArr = castData.crew.filter((item) => {
      return crewCategories.includes(item.job);
    });

    crewArr.forEach((actor) => {
      setCastAndCrew(actor, false);
    });

    // setting crew data.

    let swiperPrev = document.querySelectorAll(".swiper-button-prev");
    let swiperNext = document.querySelectorAll(".swiper-button-next");

    function addDisplay(display) {
      swiperPrev.forEach((item) => {
        display === true
          ? item.classList.add("hide")
          : item.classList.remove("hide");
      });

      swiperNext.forEach((item) => {
        display === true
          ? item.classList.add("hide")
          : item.classList.remove("hide");
      });
    }

    function checkArrow() {
      if (window.innerWidth <= 600) {
        addDisplay(true);
      } else {
        addDisplay(false);
      }
    }

    const swiper = new Swiper(".swiper", {
      slidesPerView: 5,
      spaceBetween: 30,
      speed: 400,
      navigation: {
        nextEl: ".swiper-button-next",
        prevEl: ".swiper-button-prev",
      },
      breakpoints: {
        300: {
          slidesPerView: 1,
        },

        350: {
          slidesPerView: 2,
          spaceBetween: 20,
        },

        600: {
          slidesPerView: 3,
        },

        800: {
          slidesPerView: 4,
        },

        1100: {
          slidesPerView: 5,
        },
      },
      on: {
        init: function () {
          checkArrow();
        },
        resize: function () {
          checkArrow();
        },
      },
    });

    // setting main movie image.
    const htmlData2 = `<img class="movie__image" src=${IMG_URL}${imageData.poster_path}>`;
    movieContent.innerHTML = htmlData2;

    // setting movie info.
    setMovieInfo(imageData, movieLanguages, movieGenres);

    console.log(trailerData);

    const officialTrailer = trailerData.find((item) => {
      return (
        item.name.includes("Official Trailer") ||
        item.name.includes("Trailer") ||
        item.name.includes("Official") ||
        item.name.includes("Teaser")
      );
    });

    // setting trailer.
    const htmlData3 = `
          <iframe
            width="853"
            height="550"
            src="https://www.youtube.com/embed/${officialTrailer.key}"
            title=""
            frameborder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"    
            allowfullscreen
          >
          </iframe>
        `;
    movieTrailer.insertAdjacentHTML("beforeend", htmlData3);
  } catch (err) {
    console.log(err);
  }
}
setData();
