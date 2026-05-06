// 1. Leemos la URL actual del navegador
const currentHost = window.location.hostname;

// 2. Preguntamos si estamos en nuestra computadora
const isLocal = currentHost === 'localhost' || currentHost === '127.0.0.1';

// 3. Definimos el dominio del backend dinámicamente
export const BACKEND_URL = isLocal
    ? 'http://localhost:3000'
    : 'http://34.171.199.135:3000';

// 4. Construimos la ruta de la API
export const API_URL = `${BACKEND_URL}/api`;

// VIGILANTE DE SESIONES (NUEVO)
function interceptAuthErrors(response) {
    // Si el backend nos lanza un 401 (Expirado) o 403 (No es Admin)
    if (response.status === 401 || response.status === 403) {
        console.warn('Brecha de seguridad detectada. Expulsando usuario...');
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        alert('TU SESIÓN HA EXPIRADO O NO TIENES PERMISOS. EXPULSANDO DEL VAULT...');
        window.location.reload(); // Forzamos el reinicio de la app
        return true;
    }
    return false;
}

export async function fetchAlbums(query = '', sort = 'release_year', order = 'desc') {
    try {
        // Arma la URL con los parámetros del backend
        const url = `${API_URL}/albums?q=${encodeURIComponent(query)}&sort=${sort}&order=${order}`;
        const response = await fetch(url);

        if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error('Error al invocar los álbumes:', error);
        return [];
    }
}

// Obtener la lista de bandas para el select del formulario
export async function fetchBands() {
    try {
        const response = await fetch(`${API_URL}/bands`);
        if (!response.ok) throw new Error('Error al cargar bandas');
        return await response.json();
    } catch (error) {
        console.error('Fallo al obtener bandas:', error);
        return [];
    }
}

// LOGIN - Obtener el JWT
export async function loginUser(username, password) {
    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        if (!response.ok) throw new Error('Credenciales inválidas');

        return await response.json(); // Esto devolverá el { token, user }
    } catch (error) {
        console.error('Fallo en autenticación:', error);
        return null;
    }
}

// CREAR ÁLBUM
export async function createAlbum(albumData) {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/albums`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(albumData)
        });

        if (interceptAuthErrors(response)) return null;

        if (!response.ok) throw new Error('Fallo al crear el álbum');
        return await response.json();
    } catch (error) {
        console.error(error);
        return null;
    }
}

// SUBIR PORTADA
export async function uploadAlbumCover(albumId, file) {
    try {
        const token = localStorage.getItem('token');

        const formData = new FormData();
        formData.append('cover', file);

        const response = await fetch(`${API_URL}/albums/${albumId}/cover`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });

        if (interceptAuthErrors(response)) return null;

        if (!response.ok) throw new Error('Fallo al subir la imagen');
        return await response.json();
    } catch (error) {
        console.error(error);
        return null;
    }
}

// OBTENER UN SOLO ÁLBUM
export async function fetchAlbumById(id) {
    try {
        const response = await fetch(`${API_URL}/albums/${id}`);
        if (!response.ok) throw new Error('No se encontró el álbum');
        return await response.json();
    } catch (error) {
        console.error(error);
        return null;
    }
}

// EDITAR ÁLBUM
export async function updateAlbum(id, albumData) {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/albums/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(albumData)
        });

        if (interceptAuthErrors(response)) return false;

        return response.ok;
    } catch (error) {
        console.error('Error al actualizar:', error);
        return false;
    }
}

// ELIMINAR ÁLBUM
export async function deleteAlbum(id) {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/albums/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (interceptAuthErrors(response)) return false;

        return response.ok;
    } catch (error) {
        console.error('Error al eliminar:', error);
        return false;
    }
}

// OBTENER RESEÑAS DE UN ÁLBUM
export async function fetchAlbumRatings(id) {
    try {
        const response = await fetch(`${API_URL}/albums/${id}/ratings`);
        if (!response.ok) throw new Error('No se encontraron reseñas');
        return await response.json();
    } catch (error) {
        console.error(error);
        return [];
    }
}

// OBTENER CANCIONES 
export async function addSong(songData) {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/songs`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(songData)
        });

        if (interceptAuthErrors(response)) return null;

        if (!response.ok) throw new Error('Error al agregar canción');
        return await response.json();
    } catch (error) {
        console.error(error);
        return null;
    }
}

// CREAR NUEVA BANDA
export async function createBand(bandData) {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/bands`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` // Pase VIP
            },
            body: JSON.stringify(bandData)
        });

        if (interceptAuthErrors(response)) return null;

        if (!response.ok) throw new Error('Error al forjar la banda');
        return await response.json();
    } catch (error) {
        console.error(error);
        return null;
    }
}

// ENVIAR UNA NUEVA RESEÑA
export async function addRating(albumId, ratingData) {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/albums/${albumId}/ratings`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` // Identifica al usuario automáticamente
            },
            body: JSON.stringify(ratingData) // Envía el score y el texto
        });

        if (interceptAuthErrors(response)) return null;

        if (!response.ok) throw new Error('Error al enviar la crítica');
        return await response.json();
    } catch (error) {
        console.error(error);
        return null;
    }
}