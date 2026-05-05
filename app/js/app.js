import { fetchAlbums, fetchBands, loginUser, createAlbum, uploadAlbumCover } from './api.js';
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

    // FUNCIÓN DE ARRANQUE PRINCIPAL
    async function iniciarApp() {
        try {
            const albums = await fetchAlbums();
            renderAlbums(albums);
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

    // Abrir Modal y cargar las bandas
    btnAddAlbum.addEventListener('click', async () => {
        modal.classList.remove('hidden');

        // Solo carga las bandas si el select aún dice "CARGANDO..."
        if (selectBand.options.length <= 1) {
            const bands = await fetchBands();
            selectBand.innerHTML = '<option value="">-- SELECCIONA UNA BANDA --</option>';
            bands.forEach(band => {
                selectBand.innerHTML += `<option value="${band.id}">${band.name}</option>`;
            });
        }
    });

    // Cerrar Modal
    btnCloseModal.addEventListener('click', () => {
        modal.classList.add('hidden');
        form.reset(); // Limpiar el formulario al cerrar
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
            // PASO 1: Crea el registro en la BD
            const newAlbum = await createAlbum({ title, band_id, release_year });

            if (newAlbum && newAlbum.id) {
                // PASO 2: Si hay una imagen seleccionada, la sube
                if (coverInput.files.length > 0) {
                    const imageFile = coverInput.files[0];
                    await uploadAlbumCover(newAlbum.id, imageFile);
                }

                // ÉXITO: Cierra el modal, limpia y recarga el Grid
                modal.classList.add('hidden');
                form.reset();

                // Pide los datos frescos y redibuja
                const updatedAlbums = await fetchAlbums();
                renderAlbums(updatedAlbums);
            } else {
                alert('Hubo un error satánico al guardar el álbum.');
            }
        } catch (error) {
            console.error('Error al guardar:', error);
            alert('Error en el servidor.');
        } finally {
            // Restaura el botón a la normalidad
            submitBtn.textContent = 'GUARDAR';
            submitBtn.disabled = false;
        }
    });
});