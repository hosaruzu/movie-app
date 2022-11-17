const options = {
  month: "long",
  // day: "numeric",
};

const locales = ["en-US", "ru-Ru"];

const months = Array.from({ length: 12 }, (e, i) => {
  return new Date(null, i + 1, null).toLocaleDateString(locales[0], options);
});

const monthsRuData = Array.from({ length: 12 }, (e, i) => {
  return new Date(null, i + 1, null).toLocaleDateString(locales[1], options);
});

const monthsRu = monthsRuData.map(
  (month) => month[0].toUpperCase() + month.slice(1)
);

const declOfNum = (number, titles) => {
  let cases = [2, 0, 1, 1, 1, 2];
  return titles[
    number % 100 > 4 && number % 100 < 20
      ? 2
      : cases[number % 10 < 5 ? number % 10 : 5]
  ];
};

// Get data
const API_KEY = "9ccbfab6-42b7-4772-80a3-94191184053b";
const currentYear = new Date().getFullYear();
const currentMonth = new Date().getMonth();
const currentMonthText = months[currentMonth];
const currentMonthTextRu = monthsRu[currentMonth];

// Query parameter
const params = new Proxy(new URLSearchParams(window.location.search), {
  get: (searchParams, prop) => searchParams.get(prop),
});

let queryParam = params.page;

if (!queryParam) {
  queryParam = 1;
  history.pushState(null, null, "?page=1");
}

// Elements
const appListEl = document.querySelector(".app__list");
const yearEl = document.querySelector(".year");
const monthEl = document.querySelector(".month");
const paginationsEL = document.querySelectorAll(".app__pagination");
const errorEl = document.querySelector(".app__error");
const loadingEl = document.querySelector(".app__loading");
// Set html elements from data
yearEl.textContent = currentYear;
monthEl.textContent = currentMonthText;

const initApp = (page = 1) => {
  const url = `https://kinopoiskapiunofficial.tech/api/v2.1/films/releases?year=${currentYear}&month=${currentMonthText}&page=${page}`;

  fetch(url, {
    headers: {
      "Content-Type": "application/json",
      "X-API-KEY": API_KEY,
    },
  })
    .then((response) => response.json())
    .then((data) => {
      errorEl.style.display = "none";
      loadingEl.style.display = "none";

      // calculate number of pages to pagination
      const total = data.total;
      const pages = Math.ceil(total / 10);
      for (let i = pages; i >= 1; i--) {
        paginationsEL.forEach((el) => {
          el.insertAdjacentHTML(
            "afterbegin",
            `<li class="app__pagination-item">
            <a href="?page=${i}" class="app__pagination-link ${
              i == queryParam ? "app__pagination-link--current" : ""
            }">${i}</a>
          </li>
          `
          );
        });
      }
      return data;
    })
    .then((data) => {
      for (item of data.releases) {
        const options = {
          month: "long",
          day: "numeric",
        };
        const date = new Date(item.releaseDate).toLocaleDateString(
          "ru-Ru",
          options
        );
        const rating = item.rating ? item.rating.toFixed(1) : "--";
        const duration = `${item.duration} ${declOfNum(item.duration, [
          "минута",
          "минуты",
          "минут",
        ])}`;

        const genresArr = item.genres.map((item) => Object.values(item));
        const genres = genresArr.toString().replaceAll(",", ", ");

        appListEl.insertAdjacentHTML(
          "afterbegin",
          `<li class="app__list-item">
            <article class="app__card movie-card">
              <a href="https://www.kinopoisk.ru/film/${
                item.filmId
              }" target="_blank" class="movie-card__link">
                <div class="movie-card__image-wrapper">
                  <img
                    src="${item.posterUrlPreview}"
                    alt="${!item.nameRu ? item.nameEn : item.nameRu}"
                    loading="lazy"
                    class="movie-card__image"
                  />
                  <div class="movie-card__hover">
                    <div class="movie-card__rating ${
                      item.rating == null ? "movie-card__rating--null" : ""
                    }">${rating}</div>
                    <div class="movie-card__genres">${genres}</div>
                    <div class="movie-card__duration ${
                      item.duration == 0 ? "movie-card__duration--hidden" : ""
                    }">${duration}</div>
                  </div>
                </div>
                <h2 class="movie-card__title">${
                  !item.nameRu ? item.nameEn : item.nameRu
                }</h2>
                <div class="movie-card__date">${date}</div>
              </a>
            </article>
          </li>
        `
        );
      }
    })
    .catch(() => {
      errorEl.style.display = "block";
      loadingEl.style.display = "none";
    });
};

initApp(queryParam);
