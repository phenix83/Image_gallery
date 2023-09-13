"use strict";

let totalPages, total, perpage = 10;
let currentPage = 1;
let clearButton;
let query;

let favouritePhotos = JSON.parse(localStorage.getItem('favouritePhotos'));

let pagination = document.querySelector('.pagination-numbers');

const container = document.querySelector('.container')
const gallery = document.querySelector('.gallery-box');
const showButton = document.querySelector('.show-button') || document.createElement('button');
const backButton = document.querySelector('.back-to-gallery');
const btnBlock = document.querySelector('.btn-block');
const recycles = document.querySelector('.like.recycle-bin');
const backToTopButton = document.querySelector('#backToTop');

function showMyFavouritesPhotos() {        
        
    gallery.innerHTML = '';

    Object.keys(favouritePhotos).forEach(url => {
        const galleryItemBox = document.createElement('div');
        galleryItemBox.className = 'gallery-item-box';
        const galleryItem = document.createElement('div');
        galleryItem.className = 'gallery-item';
        const photoTitle = favouritePhotos[url];

        const imgUrl = url;
        galleryItem.style.backgroundImage = `url(${imgUrl})`;
        // console.log(favouritePhotos);

        // const img = document.createElement('img');
        // img.src = imgUrl;
        const title = document.createElement('h6');
        title.innerText = photoTitle;
        const recycleBin = document.createElement('div');
        recycleBin.classList.add('like', 'recycle-bin');

        // galleryItem.appendChild(img);
        galleryItem.appendChild(title);
        galleryItemBox.appendChild(recycleBin);
        galleryItemBox.appendChild(galleryItem);
        gallery.appendChild(galleryItemBox);

        // console.log("favouritePhotos", favouritePhotos);
        // console.log(imgUrl);

        if (Object.keys(favouritePhotos).length !== 0) {
            clearButton = document.querySelector('.clear-button') || document.createElement('button');
            clearButton.className = 'clear-button';
            clearButton.innerText = 'Clear favourites';
            btnBlock.append(clearButton);
            backButton.after(clearButton);
        } else {
            document.querySelector('.clear-button').remove();
        };

        recycleBin.addEventListener('click', () => {
            galleryItemBox.remove();
            const favouritePhotos = JSON.parse(localStorage.getItem('favouritePhotos'));
            delete favouritePhotos[url];
            localStorage.setItem('favouritePhotos', JSON.stringify(favouritePhotos));
            if (Object.keys(favouritePhotos).length == 0) {
                pagination.innerHTML = '';
                clearButton.remove();
            }
        });        
    });

    clearButton.addEventListener('click', (favouritePhotos) => {
        favouritePhotos = localStorage.setItem('favouritePhotos', "null");
        gallery.innerHTML = '';
        pagination.innerHTML = '';
        clearButton.remove();
    });

    loadPagination(totalPages, currentPage);
}

function loadNextPage(page) {
    currentPage = page;

    showMyFavouritesPhotos();
    loadPagination(totalPages, currentPage);

    const prevRange = (page - 1) * perpage;
    const currRange = page * perpage;
    const galleryItems = document.querySelectorAll('.gallery-item-box');
    galleryItems.forEach((item, index) => {
        item.classList.add('hidden');
        if (index >= prevRange && index < currRange) {
            item.classList.remove('hidden');
        }
    })    
};

function loadPagination(totalPages, currentPage) {
    let li = '';
    total = Object.keys(favouritePhotos).length;    
    totalPages = Math.ceil(total / perpage);
    let activeLi;
    let beforePages = currentPage - 1;
    let afterPages = currentPage + 1;

    if (currentPage > 1) {
        li += `<li class="btn prev" onclick='loadNextPage(${currentPage - 1})'>&lt;</li>`;        
    }

    // if (currentPage > 2) {
    //     li += `<li class="numb" onclick='loadNextPage(1)'>1</li>`;
    //     if (currentPage > 3) {
    //         li += `<li class="dots">...</li>`;
    //     }
    // }

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

    for (let i = 1; i <= afterPages; i++) {
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

    // if (currentPage < totalPages - 1) {        
    //     if (currentPage < totalPages - 2) {
    //         li += `<li class="dots">...</li>`;
    //     }
    //     li += `<li class="numb" onclick='loadNextPage(${totalPages})'>${totalPages}</li>`;
    // }

    if (currentPage < totalPages) {
        li += `<li class="btn next" onclick='loadNextPage(${currentPage + 1})'>&gt;</li>`;
    }
    pagination.innerHTML = li;
};

backButton.addEventListener('click', () => {
    window.location.href = 'index.html';
});

loadNextPage(1);

const scrollFunction = () => {
    if (document.body.scrollTop > 150 || document.documentElement.scrollTop > 150) {
        backToTopButton.style.display = 'block';
    } else {
        backToTopButton.style.display = 'none';
    }
}

window.onscroll = function() {scrollFunction()};

backToTopButton.addEventListener('click', () => {
    window.scrollTo(0, 0);
})