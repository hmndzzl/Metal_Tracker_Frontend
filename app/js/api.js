const API_URL = 'http://localhost:3000/api';

export async function fetchAlbums() {
    try {
        const response = await fetch(`${API_URL}/albums`);

        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }

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

// CREAR ÁLBUM (Paso 1: Solo texto)
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

        if (!response.ok) throw new Error('Fallo al crear el álbum');
        return await response.json();
    } catch (error) {
        console.error(error);
        return null;
    }
}

// SUBIR PORTADA (Paso 2: Imagen)
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

        if (!response.ok) throw new Error('Fallo al subir la imagen');
        return await response.json();
    } catch (error) {
        console.error(error);
        return null;
    }
}