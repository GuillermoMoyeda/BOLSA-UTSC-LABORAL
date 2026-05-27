// ========================================
// GESTION DE PUBLICIDAD (ADMIN)
// ========================================

let currentSlot = null;
let sliderItems = [];
let currentIndex = 0;
let autoPlayInterval;
const intervalTime = 7000; // 7 segundos

document.addEventListener('DOMContentLoaded', async () => {
    // Inicializar listeners
    await loadPublicidad();
});

/**
 * Cargar todas las imágenes de publicidad (Slots 1, 2, 3)
 */
async function loadPublicidad() {
    try {
        showLoadingState();

        const snapshot = await db.collection('publicidad_banner').orderBy('order', 'asc').get();
        const docs = snapshot.docs;

        // Resetear slots UI
        for (let i = 1; i <= 3; i++) {
            resetSlotUI(i);
        }

        let adminGalleryContainer = document.getElementById('adminGalleryContainer');
        adminGalleryContainer.innerHTML = '';

        let sliderImagesData = [];

        docs.forEach(doc => {
            const data = doc.data();
            const slotNum = data.slot; // 1, 2 o 3
            
            const isVideo = data.isVideo || (data.url && data.url.toLowerCase().includes('.mp4'));
            const slotData = { url: data.url, isVideo: isVideo };

            // Actualizar cuadro pequeño
            updateSlotUI(slotNum, slotData);

            // Guardar para slider
            if (data.url) {
                sliderImagesData.push(slotData);
            }
        });

        // Constructor del slider grande
        buildSlider(sliderImagesData);

    } catch (error) {
        console.error("Error cargando publicidad:", error);
        alert("Ocurrió un error al cargar la publicidad.");
    } finally {
        hideLoadingState();
    }
}

/**
 * Resetear UI de un slot
 */
function resetSlotUI(slot) {
    const slotCard = document.getElementById(`slot-${slot}`);
    if (!slotCard) return;

    const img = slotCard.querySelector('.slot-image');
    const vid = slotCard.querySelector('.slot-video');
    const emptyContent = slotCard.querySelector('.slot-empty-content');
    const deleteBtn = slotCard.querySelector('.btn-slot-delete');

    if(img) { img.src = ''; img.style.display = 'none'; }
    if(vid) { vid.src = ''; vid.style.display = 'none'; }
    emptyContent.style.display = 'flex';
    deleteBtn.style.display = 'none';
}

/**
 * Actualizar UI de un slot con imagen o video
 */
function updateSlotUI(slot, data) {
    const slotCard = document.getElementById(`slot-${slot}`);
    if (!slotCard) return;

    const img = slotCard.querySelector('.slot-image');
    const vid = slotCard.querySelector('.slot-video');
    const emptyContent = slotCard.querySelector('.slot-empty-content');
    const deleteBtn = slotCard.querySelector('.btn-slot-delete');

    if (data.isVideo) {
        if(vid) { vid.src = data.url; vid.style.display = 'block'; }
        if(img) img.style.display = 'none';
    } else {
        if(img) { img.src = data.url; img.style.display = 'block'; }
        if(vid) vid.style.display = 'none';
    }
    emptyContent.style.display = 'none';
    deleteBtn.style.display = 'flex';
}

/**
 * Funciones del Modal
 */
function openUploadModal(slot) {
    currentSlot = slot;
    document.getElementById('modalSlotNumber').textContent = slot;
    document.getElementById('imageInput').value = '';

    document.getElementById('uploadModal').classList.add('active');
}

function closeUploadModal() {
    currentSlot = null;
    document.getElementById('uploadModal').classList.remove('active');
}

// Click fuera para cerrar el modal
document.getElementById('uploadModal').addEventListener('click', (e) => {
    if (e.target.id === 'uploadModal') {
        closeUploadModal();
    }
});

/**
 * Subir la imagen a Storage y guardar url en Firestore
 */
async function uploadImage() {
    if (!currentSlot) return;

    const fileInput = document.getElementById('imageInput');
    const file = fileInput.files[0];

    if (!file) {
        showToast("Por favor selecciona un archivo.", "error");
        return;
    }

    // validar solo que sea imagen o video
    if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
        showToast("El archivo debe ser una imagen o video válido. Por favor selecciona otro.", "error");
        return;
    }

    try {
        const btnUpload = document.getElementById('btnUploadImage');
        btnUpload.disabled = true;
        btnUpload.textContent = 'Subiendo...';

        // 1. Subir a Firebase Storage
        const fileExtension = file.name.split('.').pop();
        const fileName = `publicidad/slot_${currentSlot}_${Date.now()}.${fileExtension}`;

        let storageRef;
        if (storage) {
            storageRef = storage.ref(fileName);
        } else {
            console.error('Storage is not initialized. Make sure firebase-storage-compat is included.');
            showToast("El servicio de almacenamiento no está disponible.", "error");
            return;
        }

        const snapshot = await storageRef.put(file);
        const downloadUrl = await snapshot.ref.getDownloadURL();

        // 1.5 Verificar si existe una imagen anterior para eliminarla y no dejar basura en Storage
        const docRef = db.collection('publicidad_banner').doc(`slot_${currentSlot}`);
        const docSnap = await docRef.get();
        if (docSnap.exists) {
            const oldData = docSnap.data();
            if (oldData.url && storage) {
                try {
                    const oldImageRef = storage.refFromURL(oldData.url);
                    await oldImageRef.delete();
                } catch (e) {
                    console.warn('No se pudo eliminar la imagen anterior de storage:', e);
                }
            }
        }

        // 2. Guardar en Firestore
        await docRef.set({
            slot: currentSlot,
            url: downloadUrl,
            isVideo: file.type.startsWith('video/'),
            order: currentSlot,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        showToast("¡Archivo subido correctamente!", "success");
        closeUploadModal();
        await loadPublicidad();

    } catch (error) {
        console.error("Error al subir imagen:", error);
        showToast("Ocurrió un error al subir la imagen. Inténtalo de nuevo.", "error");
    } finally {
        const btnUpload = document.getElementById('btnUploadImage');
        btnUpload.disabled = false;
        btnUpload.textContent = 'Subir Imagen';
    }
}

/**
 * Eliminar imagen (Firestore y Storage)
 */
async function deleteImage(slot) {
    // Crear modal de confirmación
    const deleteConfirmModal = document.createElement('div');
    deleteConfirmModal.className = 'modal-overlay active';
    deleteConfirmModal.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:2000;';
    deleteConfirmModal.innerHTML = `
        <div class="modal-container" style="background:white;padding:2rem;border-radius:12px;width:90%;max-width:400px;box-shadow:0 10px 40px rgba(0,0,0,0.2);text-align:center;">
            <div style="font-size:2.5rem;color:#d32f2f;margin-bottom:1rem;"><i class="fas fa-exclamation-circle"></i></div>
            <h3 style="margin:0 0 0.5rem 0;color:#333;font-size:1.3rem;">¿Eliminar Imagen?</h3>
            <p style="margin:0 0 1.5rem 0;color:#666;font-size:0.95rem;">Se borrará permanentemente la imagen del cuadro ${slot}.</p>
            <div style="display:flex;gap:1rem;justify-content:center;">
                <button onclick="this.closest('.modal-overlay').remove()" style="background:#ccc;color:#333;padding:0.75rem 1.5rem;border:none;border-radius:8px;cursor:pointer;font-weight:600;">
                    Cancelar
                </button>
                <button onclick="confirmDeleteImage(${slot})" style="background:#d32f2f;color:white;padding:0.75rem 1.5rem;border:none;border-radius:8px;cursor:pointer;font-weight:600;">
                    Eliminar
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(deleteConfirmModal);
    deleteConfirmModal.addEventListener('click', (e) => {
        if (e.target === deleteConfirmModal) deleteConfirmModal.remove();
    });
}

async function confirmDeleteImage(slot) {
    try {
        const docRef = db.collection('publicidad_banner').doc(`slot_${slot}`);
        const docSnap = await docRef.get();

        if (docSnap.exists) {
            const data = docSnap.data();
            const imageUrl = data.url;

            try {
                if (storage && imageUrl) {
                    const imageRef = storage.refFromURL(imageUrl);
                    await imageRef.delete();
                }
            } catch (storageError) {
                console.warn("No se pudo borrar de storage, quizás ya no existía.", storageError);
            }

            await docRef.delete();
            showToast("Imagen eliminada correctamente.", "success");
            document.querySelector('.modal-overlay.active')?.remove();
            await loadPublicidad();
        }
    } catch (error) {
        console.error("Error eliminando imagen:", error);
        showToast("Error al eliminar la imagen.", "error");
    }
}

/**
 * Construir el Slider (similar a alumno-principal.html)
 */
function buildSlider(sliderData) {
    const adminGalleryContainer = document.getElementById('adminGalleryContainer');
    const dotsContainer = document.querySelector('.gallery-dots');
    const navButtons = document.querySelector('.gallery-navigation');
    const gallerySection = document.getElementById('gallery');

    // Limpiar previo
    adminGalleryContainer.innerHTML = '';
    dotsContainer.innerHTML = '';
    clearInterval(autoPlayInterval);
    currentIndex = 0;

    if (sliderData.length === 0) {
        gallerySection.style.display = 'none';
        return;
    }

    gallerySection.style.display = 'block';

    sliderData.forEach((item, i) => {
        const figure = document.createElement('figure');
        figure.className = 'gallery-item';
        
        if (item.isVideo) {
            const vid = document.createElement('video');
            vid.src = item.url;
            vid.autoplay = true;
            vid.muted = true;
            vid.loop = true;
            vid.playsInline = true;
            vid.style.width = '100%';
            vid.style.height = '100%';
            vid.style.objectFit = 'cover';
            figure.appendChild(vid);
        } else {
            const img = document.createElement('img');
            img.src = item.url;
            img.alt = `Slider Media ${i}`;
            figure.appendChild(img);
        }
        
        adminGalleryContainer.appendChild(figure);
    });

    sliderItems = document.querySelectorAll('#adminGalleryContainer .gallery-item');

    // Navegacion
    if (sliderItems.length > 1) {
        navButtons.style.display = 'flex';
        dotsContainer.style.display = 'flex';

        sliderItems.forEach((_, index) => {
            const dot = document.createElement('div');
            dot.classList.add('dot');
            if (index === 0) dot.classList.add('active');
            dot.addEventListener('click', () => goToSlide(index));
            dotsContainer.appendChild(dot);
        });

        startAutoPlay();
    } else {
        navButtons.style.display = 'none';
        dotsContainer.style.display = 'none';
        adminGalleryContainer.style.transform = `translateX(0%)`;
    }

    // Handlers botones nav
    const prevBtn = document.querySelector('.prev-button');
    const nextBtn = document.querySelector('.next-button');

    // Eliminar viejos listeners clonando el nodo para evitar multiplicar eventos si se re-renderiza repetidamente
    const newPrevBtn = prevBtn.cloneNode(true);
    const newNextBtn = nextBtn.cloneNode(true);
    prevBtn.parentNode.replaceChild(newPrevBtn, prevBtn);
    nextBtn.parentNode.replaceChild(newNextBtn, nextBtn);

    newNextBtn.addEventListener('click', () => {
        if (sliderItems.length > 1) {
            nextSlide();
            resetAutoPlay();
        }
    });

    newPrevBtn.addEventListener('click', () => {
        if (sliderItems.length > 1) {
            prevSlide();
            resetAutoPlay();
        }
    });

    // Accesibilidad hover
    gallerySection.addEventListener('mouseenter', () => clearInterval(autoPlayInterval));
    gallerySection.addEventListener('mouseleave', () => startAutoPlay());
}

function updateSlider() {
    const adminGalleryContainer = document.getElementById('adminGalleryContainer');
    const dots = document.querySelectorAll('.gallery-dots .dot');

    adminGalleryContainer.style.transform = `translateX(-${currentIndex * 100}%)`;

    dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === currentIndex);
    });
}

function goToSlide(index) {
    currentIndex = index;
    updateSlider();
    resetAutoPlay();
}

function nextSlide() {
    currentIndex = (currentIndex + 1) % sliderItems.length;
    updateSlider();
}

function prevSlide() {
    currentIndex = (currentIndex - 1 + sliderItems.length) % sliderItems.length;
    updateSlider();
}

function startAutoPlay() {
    if (sliderItems.length > 1) {
        clearInterval(autoPlayInterval);
        autoPlayInterval = setInterval(nextSlide, intervalTime);
    }
}

function resetAutoPlay() {
    if (sliderItems.length > 1) {
        clearInterval(autoPlayInterval);
        startAutoPlay();
    }
}

function showLoadingState() {
    // Si tuvieras una función global, aquí la llamas.
}
function hideLoadingState() {
    //
}


