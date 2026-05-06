import {
    fetchAlbums, fetchBands, loginUser, createAlbum, uploadAlbumCover,
    fetchAlbumById, updateAlbum, deleteAlbum
} from './api.js';
import { renderAlbums } from './ui.js';


document.addEventListener('DOMContentLoaded', async () => {
    // SISTEMA DE AUTENTICACIÓN (JWT)
    const loginOverlay = document.getElementById('login-overlay');
    const loginForm = document.getElementById('login-form');
    const loginError = document.getElementById('login-error');

    // Revisa si ya hay un token guardado en el navegador
    const currentToken = localStorage.getItem('token');

    if (currentToken) {
        loginOverlay.style.display = 'none';
        iniciarApp();
    }

    // Si intenta iniciar sesión...
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const userVal = document.getElementById('username').value;
        const passVal = document.getElementById('password').value;

        const authData = await loginUser(userVal, passVal);

        if (authData && authData.token) {
            // ¡Exito! Guardamos el token en la bóveda del navegador
            localStorage.setItem('token', authData.token);
            // Ocultamos la pantalla de login suavemente
            loginOverlay.style.opacity = '0';
            setTimeout(() => {
                loginOverlay.style.display = 'none';
                iniciarApp(); // Arrancamos la carga de datos
            }, 500);
        } else {
            // ¡Fallo! Mostramos el error
            loginError.classList.remove('hidden');
        }
    });

    // CERRAR SESIÓN
    const btnLogout = document.getElementById('btn-logout');
    btnLogout.addEventListener('click', () => {
        localStorage.removeItem('token');
        window.location.reload();
    });

    // Variable para rastrear si se está editando un álbum existente
    let currentEditId = null;

    // DELEGACIÓN DE EVENTOS (EDITAR Y ELIMINAR)
    const grid = document.getElementById('albums-grid');

    grid.addEventListener('click', async (e) => {
        // --- LÓGICA DE ELIMINAR ---
        if (e.target.classList.contains('delete')) {
            const id = e.target.dataset.id;

            // Vanilla JS estricto: usamos confirm() para validar
            if (confirm('ALERTA: ¿Deseas destruir este álbum y sus canciones del Vault para siempre?')) {
                const success = await deleteAlbum(id);
                if (success) {
                    const updatedAlbums = await fetchAlbums();
                    renderAlbums(updatedAlbums);
                } else {
                    alert('Error satánico al intentar borrar.');
                }
            }
        }

        // --- LÓGICA DE EDITAR ---
        if (e.target.classList.contains('edit')) {
            const id = e.target.dataset.id;
            const albumData = await fetchAlbumById(id);

            if (albumData) {
                // 1. Guardamos el ID que estamos editando
                currentEditId = id;

                // 2. Cargamos las bandas si no están cargadas
                if (selectBand.options.length <= 1) {
                    const bands = await fetchBands();
                    selectBand.innerHTML = '<option value="">-- SELECCIONA UNA BANDA --</option>';
                    bands.forEach(b => {
                        selectBand.innerHTML += `<option value="${b.id}">${b.name}</option>`;
                    });
                }

                // 3. Llenamos el formulario con los datos actuales
                document.getElementById('title').value = albumData.title;
                document.getElementById('band_id').value = albumData.band_id;
                document.getElementById('release_year').value = albumData.release_year;

                // Cambiamos el título del modal
                document.querySelector('.modal-title').textContent = 'EDITAR ÁLBUM';

                // 4. Mostramos el modal
                modal.classList.remove('hidden');
            }
        }
    });

    // FUNCIÓN DE ARRANQUE PRINCIPAL
    async function iniciarApp() {
        try {
            // Carga inicial (sin filtros)
            const albums = await fetchAlbums();
            renderAlbums(albums);

            // Configura los controles de búsqueda
            const searchInput = document.getElementById('search-input');
            const sortSelect = document.getElementById('sort-select');

            // Función interna para refrescar el grid
            const refrescarGrid = async () => {
                const query = searchInput.value;
                const [sort, order] = sortSelect.value.split('-');

                const filtrados = await fetchAlbums(query, sort, order);
                renderAlbums(filtrados);
            };

            // Escuchar cuando el usuario escribe (evento 'input' en tiempo real)
            searchInput.addEventListener('input', refrescarGrid);

            // Escuchar cuando el usuario cambia el menú desplegable
            sortSelect.addEventListener('change', refrescarGrid);

        } catch (error) {
            console.error('Fallo en el sistema:', error);
            document.getElementById('albums-grid').innerHTML = '<p class="loading-text">ERROR CRÍTICO.</p>';
        }
    }

    // Cargar los datos iniciales
    try {
        const albums = await fetchAlbums();
        renderAlbums(albums);
    } catch (error) {
        console.error('Fallo en el sistema:', error);
        document.getElementById('albums-grid').innerHTML = '<p class="loading-text">ERROR CRÍTICO.</p>';
    }

    // Elementos del DOM para el Modal
    const modal = document.getElementById('album-modal');
    const btnAddAlbum = document.getElementById('btn-add-album');
    const btnCloseModal = document.getElementById('btn-close-modal');
    const selectBand = document.getElementById('band_id');
    const form = document.getElementById('add-album-form');

    // Abrir Modal para NUEVO álbum
    btnAddAlbum.addEventListener('click', async () => {
        currentEditId = null; // Reinicia el estado
        form.reset(); // Limpia campos
        document.querySelector('.modal-title').textContent = 'NUEVO ÁLBUM';
        modal.classList.remove('hidden');

        if (selectBand.options.length <= 1) {
            const bands = await fetchBands();
            selectBand.innerHTML = '<option value="">-- SELECCIONA UNA BANDA --</option>';
            bands.forEach(b => {
                selectBand.innerHTML += `<option value="${b.id}">${b.name}</option>`;
            });
        }
    });

    // Cerrar Modal
    btnCloseModal.addEventListener('click', () => {
        modal.classList.add('hidden');
        form.reset();
        currentEditId = null;
    });

    // Cerrar el modal si el usuario hace clic afuera de la caja negra
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.add('hidden');
            form.reset();
        }
    });

    // Enviar el formulario
    form.addEventListener('submit', async (e) => {
        e.preventDefault(); // Evita que la página se recargue

        // Obtener los valores del formulario
        const title = document.getElementById('title').value;
        const band_id = parseInt(document.getElementById('band_id').value);
        const release_year = parseInt(document.getElementById('release_year').value);
        const coverInput = document.getElementById('cover');

        // Botón en estado de carga
        const submitBtn = form.querySelector('button[type="submit"]');
        submitBtn.textContent = 'PROCESANDO...';
        submitBtn.disabled = true;

        try {
            let albumIdToUpdateImage = null;

            if (currentEditId) {
                // RUTA DE EDICIÓN (PUT)
                const success = await updateAlbum(currentEditId, { title, band_id, release_year });
                if (success) {
                    albumIdToUpdateImage = currentEditId;
                } else {
                    throw new Error('Fallo al actualizar el texto');
                }
            } else {
                // RUTA DE CREACIÓN (POST)
                const newAlbum = await createAlbum({ title, band_id, release_year });
                if (newAlbum && newAlbum.id) {
                    albumIdToUpdateImage = newAlbum.id;
                } else {
                    throw new Error('Fallo al crear el álbum');
                }
            }

            // Sube la imagen SOLO si el usuario seleccionó una nueva
            if (albumIdToUpdateImage && coverInput.files.length > 0) {
                const imageFile = coverInput.files[0];
                await uploadAlbumCover(albumIdToUpdateImage, imageFile);
            }

            // ÉXITO: Cierra y recarga
            modal.classList.add('hidden');
            form.reset();
            currentEditId = null;

            const updatedAlbums = await fetchAlbums();
            renderAlbums(updatedAlbums);

        } catch (error) {
            console.error('Error al guardar:', error);
            alert('Error en el servidor o permisos denegados.');
        } finally {
            submitBtn.textContent = 'GUARDAR';
            submitBtn.disabled = false;
        }
    });
});