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
let query;

let favouritePhotos = JSON.parse(localStorage.getItem('favouritePhotos')) || {};

async function searchPhotos(query) {
    const url = `${baseUrl}?method=flickr.photos.search&api_key=${apiKey}&text=${query}&per_page=100&page=1&format=json&nojsoncallback=1`;
    const response = await fetch(url);
    data = await response.json();
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
        const galleryItem = document.createElement('div');
        galleryItem.className = 'gallery-item';
        const imgUrl = `https://farm${photo.farm}.staticflickr.com/${photo.server}/${photo.id}_${photo.secret}.jpg`;
        const img = document.createElement('img');
        img.src = imgUrl;
        const title = document.createElement('h6');
        title.innerText = `${photo.title}`;
        const like = document.createElement('div');
        like.classList.add('like', 'like-no');

        galleryItem.appendChild(img);
        galleryItem.appendChild(title);
        galleryItem.appendChild(like);
        gallery.appendChild(galleryItem);

        img.addEventListener('error', function(event) {
            console.log(event.target)
            event.target.parentElement.remove();            
        });

        like.addEventListener('click', (event) => {
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
                // showButton = document.querySelector('.show-button') || document.createElement('button');
                showButton.className = 'show-button';
                showButton.innerText = 'Show Gallery';
                form.appendChild(showButton);
            } else {
                document.querySelector('.show-button').remove();
            }
        });        
    });
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
    // window.scrollTo(0, 0);
};


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
    window.location.href = '/favourites-page.html';
});


form.addEventListener('submit', event => {
    event.preventDefault();
    const searchBox = document.querySelector('.search-box input');
    query = searchBox.value;
    searchPhotos(query);
});