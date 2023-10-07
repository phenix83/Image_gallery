"use strict";

const apiKey = 'd9a81230ecf80c87b2a341bb2d71a61a';
const baseUrl = 'https://api.flickr.com/services/rest/';

let data, photos, total, perpage;

let totalPages;
let pagination = document.querySelector('.pagination-numbers');
let currentPage = 5;

const gallery = document.querySelector('.gallery-box');
const showButton = document.querySelector('.show-button') || document.createElement('button');

const form = document.querySelector('form');
const backToTopButton = document.querySelector('#backToTop');
const spinner = document.querySelector('#spinner');
let query;

let favouritePhotos = JSON.parse(localStorage.getItem('favouritePhotos')) || {};

let lightboxEnabled;
let lightboxArray;
let lastImage;

const lightboxContainer = document.querySelector('.lightbox-container');
const lightboxImageWrapper = document.querySelector('.lightbox-image-wrapper');
const lightboxImage = document.querySelector('.lightbox-image');
 
const lightboxBtns = document.querySelectorAll('.lightbox-btn');
const lightboxBtnRight = document.querySelector('#right');
const lightboxBtnLeft = document.querySelector('#left');
let activeImage;

const showLightbox = () => {lightboxContainer.classList.add('active')};
const hideLightbox = () => {lightboxContainer.classList.remove('active')};

const setActiveImage = (image) => {
    lightboxImageWrapper.style.backgroundImage = `url('${image.dataset.imagesrc}')`;
    activeImage = lightboxArray.indexOf(image);
    removeBtnInactiveClass();
    switch (activeImage) {
        case 0:
            lightboxBtnLeft.classList.add('inactive');
            break;
        case lastImage:
            lightboxBtnRight.classList.add('inactive');
            console.log(lastImage);
            break;
        default:
            removeBtnInactiveClass();
    }
}

const removeBtnInactiveClass = () => {
    lightboxBtns.forEach(btn => {
        btn.classList.remove('inactive');
    })
}

const removeBtnAnimation = () => {
    lightboxBtns.forEach(btn => {
        setTimeout( function() {btn.blur()}, 200)
    })
}

const transitionSlidesLeft = () => {
    removeBtnAnimation(); 
    activeImage === 0 ? setActiveImage(lightboxArray[lastImage]) : setActiveImage(lightboxArray[activeImage - 1]);

}

const transitionSlidesRight = () => {
    activeImage === lastImage ? setActiveImage(lightboxArray[0]) : setActiveImage(lightboxArray[activeImage + 1]);
    removeBtnAnimation(); 
}

const transitionSlideHandler = (moveItem) => {
    moveItem.includes('left') ? transitionSlidesLeft() : transitionSlidesRight();
}

async function searchPhotos(query) {
    if (!query) return;
    const url = `${baseUrl}?method=flickr.photos.search&api_key=${apiKey}&text=${query}&per_page=100&page=1&format=json&nojsoncallback=1`;
    
    try {
        spinner.style.display = 'flex';
        const response = await fetch(url);
        data = await response.json();        
    } catch (error) {
        const errorBox = document.querySelector('.error');
        errorBox.style.display = 'flex';
        errorBox.innerText = 'Oops... Something went wrong :( Please try again';
        setTimeout(() => {
            errorBox.style.display = 'none';
            errorBox.innerText = '';
        }, 3000);
    } finally {
        document.querySelector('#spinner').style.display = 'none';
    }
    
    photos = data.photos.photo;
    perpage = data.photos.perpage;
    total = data.photos.total;
    totalPages = Math.ceil(total / perpage);
    currentPage = 1;    

    loadPhotos(data);
}

function loadPhotos() {        
        
    gallery.innerHTML = '';

    photos.forEach(photo => {
        const galleryItemBox = document.createElement('div');
        galleryItemBox.className = 'gallery-item-box';
        const galleryItem = document.createElement('div');
        galleryItem.className = 'gallery-item';
        const lightboxImgUrl = `https://farm${photo.farm}.staticflickr.com/${photo.server}/${photo.id}_${photo.secret}_b.jpg`;
        galleryItem.setAttribute("data-imagesrc", `${lightboxImgUrl}`);
        const imgUrl = `https://farm${photo.farm}.staticflickr.com/${photo.server}/${photo.id}_${photo.secret}.jpg`;
        galleryItem.style.backgroundImage = `url(${imgUrl})`;
        const title = document.createElement('h6');
        title.innerText = `${photo.title}`;
        const like = document.createElement('div');
        like.classList.add('like', 'like-no');

        galleryItem.appendChild(title);
        galleryItem.appendChild(like);
        galleryItemBox.appendChild(galleryItem);
        gallery.appendChild(galleryItemBox);

        const img = new Image;
        img.src = imgUrl;
        img.addEventListener('error', function(event) {
            console.log(event.target)
            galleryItemBox.remove();            
        });

        like.addEventListener('click', (event) => {
            event.stopPropagation();
            event.target.classList.toggle('like-no');
            event.target.classList.toggle('like-yes');

            if (event.target.classList.contains('like-yes')) {
                favouritePhotos[imgUrl] = photo.title;
            } else {
                delete favouritePhotos[imgUrl];
            }

            localStorage.setItem('favouritePhotos', JSON.stringify(favouritePhotos));

            console.log(JSON.parse(localStorage.getItem('favouritePhotos')));

            if (Object.keys(favouritePhotos).length !== 0) {
                showButton.className = 'show-button';
                showButton.innerText = 'Show Gallery';
                form.appendChild(showButton);
            } else {
                document.querySelector('.show-button').remove();
            }
        });

        galleryItem.addEventListener('click', (e) => {
            showLightbox();
            setActiveImage(e.currentTarget);
        })
    });

    lightboxEnabled = document.querySelectorAll("div[data-imagesrc]");
    lightboxArray = Array.from(lightboxEnabled);
    lastImage = lightboxArray.length - 1;

    console.log(data);
    loadPagination(totalPages, currentPage);
};

async function loadNextPage(page) {
    currentPage = page;
    const url = `${baseUrl}?method=flickr.photos.search&api_key=${apiKey}&text=${query}&per_page=100&page=${currentPage}&format=json&nojsoncallback=1`;
    const response = await fetch(url);
    data = await response.json();
    photos = data.photos.photo;
    loadPhotos();
    loadPagination(totalPages, currentPage);
};

// Pagination

function loadPagination(totalPages, currentPage) {
    let li = '';
    let activeLi;
    let beforePages = currentPage - 1;
    let afterPages = currentPage + 1;

    if (currentPage > 1) {
        li += `<li class="btn prev" onclick='loadNextPage(${currentPage - 1})'>&lt;</li>`;
    }

    if (currentPage > 2) {
        li += `<li class="numb" onclick='loadNextPage(1)'>1</li>`;
        if (currentPage > 3) {
            li += `<li class="dots">...</li>`;
        }
    }

    if (currentPage == totalPages && totalPages != 1) {
        beforePages = beforePages - 2;
    } else if (currentPage == totalPages - 1){
        beforePages = beforePages - 1;
    }

    if (currentPage == 1) {
        afterPages = afterPages + 2;
    } else if (currentPage == 2){
        afterPages = afterPages + 1;
    }

    for (let i = beforePages; i <= afterPages; i++) {
        if (i > totalPages) {
            continue;
        }
        if (i == 0) {
            i = i + 1;
        }
        if (currentPage == i) {
            activeLi = 'active';
        } else {
            activeLi = '';
        }
        li += `<li class="numb ${activeLi}" onclick='loadNextPage(${i})'>${i}</li>`;
    }

    if (currentPage < totalPages - 1) {        
        if (currentPage < totalPages - 2) {
            li += `<li class="dots">...</li>`;
        }
        li += `<li class="numb" onclick='loadNextPage(${totalPages})'>${totalPages}</li>`;
    }

    if (currentPage < totalPages) {
        li += `<li class="btn next" onclick='loadNextPage(${currentPage + 1})'>&gt;</li>`;
    }
    pagination.innerHTML = li;
};

window.addEventListener('DOMContentLoaded', () => {
    if (Object.keys(favouritePhotos).length !== 0) {        
        showButton.className = 'show-button';
        showButton.innerText = 'Show Gallery';
        form.appendChild(showButton);
    }
});

showButton.addEventListener('click', () => {
    window.location.href = 'favourites-page.html';
});

form.addEventListener('submit', event => {
    event.preventDefault();
    const searchBox = document.querySelector('.search-box input');
    query = searchBox.value;
    searchPhotos(query);
});

// Scroll to up

const scrollFunction = () => {
    if (document.body.scrollTop > 200 || document.documentElement.scrollTop > 200) {
        backToTopButton.style.display = 'block';
    } else {
        backToTopButton.style.display = 'none';
    }
}

window.onscroll = function() {scrollFunction()};

backToTopButton.addEventListener('click', () => {
    window.scrollTo(0, 0);
});

// Lightbox eventlisteners

lightboxContainer.addEventListener('click', () => {hideLightbox()});

lightboxBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        transitionSlideHandler(e.currentTarget.id);
    })
})

window.addEventListener('keydown', (e) => {
    if(!lightboxContainer.classList.contains('.active')) return;
    if (e.key.includes('Left') || e.key.includes('Right')) {
        e.preventDefault();
        transitionSlideHandler(e.key.toLocaleLowerCase())
    }
})