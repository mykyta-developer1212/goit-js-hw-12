import {
  createGallery,
  clearGallery,
  showLoader,
  hideLoader,
  showLoadMoreButton,
  hideLoadMoreButton,
} from './js/render-functions.js';
import { getImagesByQuery } from './js/pixabay-api.js';
import iziToast from 'izitoast';
import 'izitoast/dist/css/iziToast.min.css';

const form = document.querySelector('.form');
const loadMoreBtn = document.querySelector('.load-more');
const gallery = document.querySelector('.gallery');

let searchQuery = '';
let page = 1;
const perPage = 15;

form.addEventListener('submit', async e => {
  e.preventDefault();
  searchQuery = e.target.elements['search-text'].value.trim();

  if (!searchQuery) {
    iziToast.warning({ message: 'Please enter a search query.', position: 'topRight' });
    return;
  }

  page = 1;
  clearGallery();
  hideLoadMoreButton();
  showLoader();

  try {
    const data = await getImagesByQuery(searchQuery, page);

    if (data.hits.length === 0) {
      iziToast.info({ message: 'No images found.', position: 'topRight' });
      return;
    }

    createGallery(data.hits);

    if (page * perPage >= data.totalHits) {
      iziToast.info({ message: "We're sorry, but you've reached the end of search results.", position: 'topRight' });
    } else {
      showLoadMoreButton();
    }
  } catch {
    iziToast.error({ message: 'Something went wrong.', position: 'topRight' });
  } finally {
    hideLoader();
  }
});

loadMoreBtn.addEventListener('click', async () => {
  page++;
  hideLoadMoreButton();
  showLoader();

  try {
    const data = await getImagesByQuery(searchQuery, page);
    createGallery(data.hits);

    await new Promise(resolve => requestAnimationFrame(resolve));

    const lastCard = gallery.lastElementChild;
    if (lastCard) {
      slowScrollTo(lastCard.offsetTop - 100, 200);
    }

    if (page * perPage >= data.totalHits) {
      iziToast.info({ message: "We're sorry, but you've reached the end of search results.", position: 'topRight' });
    } else {
      showLoadMoreButton();
    }
  } catch {
    iziToast.error({ message: 'Error loading more images.', position: 'topRight' });
  } finally {
    hideLoader();
  }
});

function slowScrollTo(targetY, duration) {
  const startY = window.scrollY;
  const distance = targetY - startY;
  let startTime = null;

  function step(currentTime) {
    if (!startTime) startTime = currentTime;
    const progress = currentTime - startTime;
    const percent = Math.min(progress / duration, 1);
    window.scrollTo(0, startY + distance * easeInOutQuad(percent));
    if (percent < 1) requestAnimationFrame(step);
  }

  function easeInOutQuad(t) {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
  }

  requestAnimationFrame(step);
}
