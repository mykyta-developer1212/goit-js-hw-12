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

    if (data.hits.length === 0) {
      iziToast.info({ message: "We're sorry, but you've reached the end of search results.", position: 'topRight' });
      return;
    }

    createGallery(data.hits);

    const card = document.querySelector('.gallery-item');
    if (card) {
      const cardHeight = card.getBoundingClientRect().height;
      window.scrollBy({
        top: cardHeight * 2,
        behavior: 'smooth',
      });
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
