const BACKEND_URL = 'http://localhost:3000';

export function renderAlbums(albums) {
    const grid = document.getElementById('albums-grid');

    grid.innerHTML = '';

    if (albums.length === 0) {
        grid.innerHTML = '<p class="loading-text">NO HAY ÁLBUMES. ¡AGREGA UN ÁLBUM!</p>';
        return;
    }

    albums.forEach(album => {
        const card = document.createElement('article');
        card.className = 'brutalist-card';

        const coverHtml = album.cover_image_url
            ? `<img src="${BACKEND_URL}${album.cover_image_url}" alt="${album.title}" class="card-cover">`
            : `<div class="card-no-cover">SIN PORTADA</div>`;

        card.innerHTML = `
            ${coverHtml}
            <div class="card-content">
                <h2 class="card-title">${album.title}</h2>
                <h3 class="card-band">${album.band_name || 'Banda Desconocida'}</h3>
                <p class="card-year">AÑO: ${album.release_year}</p>
                <div class="card-actions">
                    <button class="btn-action edit" data-id="${album.id}">EDIT</button>
                    <button class="btn-action delete" data-id="${album.id}">DEL</button>
                </div>
            </div>
        `;

        grid.appendChild(card);
    });
}