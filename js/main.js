/**
 * MAIN.JS - Lógica Centralizada de Fundazoe Web 2
 * Contiene: Configuración Firebase, Menú Móvil, y Controladores de Datos.
 */

// --- 1. CONFIGURACIÓN E INICIALIZACIÓN DE FIREBASE ---
const firebaseConfig = {
    apiKey: "AIzaSyC1hu_jiAx4JKU5QWOZUW6RVvlo4Td_sM4",
    authDomain: "fundazoe-web2.firebaseapp.com",
    projectId: "fundazoe-web2",
    storageBucket: "fundazoe-web2.firebasestorage.app",
    messagingSenderId: "1016512867168",
    appId: "1:1016512867168:web:8b0d3108e85dee1fab4c05",
    measurementId: "G-JW3ME3FF9Q"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// --- 2. LÓGICA GLOBAL (MENÚ MÓVIL) ---
// Hacemos la función accesible globalmente (window) para el onclick del HTML
window.toggleMenu = function() {
    const navLinks = document.getElementById("navLinks");
    if (navLinks.style.display === "flex") {
        navLinks.style.display = "none";
    } else {
        navLinks.style.display = "flex";
    }
};

// --- 3. CONTROLADORES DE DATOS (DOM READY) ---
document.addEventListener('DOMContentLoaded', () => {
    
    // A. MÓDULO DE CONTACTO (Solo si existe el formulario en la página)
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btnSubmit = document.getElementById('btnSubmit');
            const formStatus = document.getElementById('formStatus');
            
            // UI: Estado Cargando
            const originalBtnText = btnSubmit.innerText;
            btnSubmit.innerText = "Enviando...";
            btnSubmit.disabled = true;

            try {
                // Recolectar datos
                const nombre = document.getElementById('nombre').value;
                const email = document.getElementById('email').value;
                const telefono = document.getElementById('telefono').value;
                const mensaje = document.getElementById('mensaje').value;

                // Enviar a Firestore
                await db.collection("solicitudes_ayuda").add({
                    nombre,
                    email,
                    telefono,
                    mensaje,
                    fecha: new Date() // Timestamp del servidor
                });

                // UI: Éxito
                formStatus.style.color = "green";
                formStatus.innerText = "¡Mensaje enviado con éxito!";
                contactForm.reset();

            } catch (error) {
                console.error("Error al enviar formulario:", error);
                formStatus.style.color = "red";
                formStatus.innerText = "Hubo un error al enviar el mensaje. Intenta nuevamente.";
            } finally {
                // Restaurar botón
                btnSubmit.innerText = originalBtnText;
                btnSubmit.disabled = false;
            }
        });
    }

    // B. MÓDULO DE PROGRAMAS (Solo si existe el contenedor)
    const programasContainer = document.getElementById('programas-container');
    if (programasContainer) {
        db.collection("programas").orderBy("orden").get().then((querySnapshot) => {
            let htmlContent = '';
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                // Construcción de la tarjeta (Template Literal)
                htmlContent += `
                    <div class="card">
                        <h3>${data.nombre}</h3>
                        <p>${data.descripcion}</p>
                    </div>
                `;
            });
            programasContainer.innerHTML = htmlContent;
        }).catch((error) => {
            console.error("Error cargando programas:", error);
            programasContainer.innerHTML = "<p>No se pudieron cargar los programas.</p>";
        });
    }

    // C. MÓDULO DE RECURSOS (LISTADO DE ARTÍCULOS)
    const articulosContainer = document.getElementById('articulos-container');
    if (articulosContainer) {
        db.collection("articulos").get().then((querySnapshot) => {
            let htmlContent = '';
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                // Nota el enlace dinámico: articulo.html?id=${doc.id}
                htmlContent += `
                    <div class="card article-card">
                        ${data.imagen ? `<img src="${data.imagen}" alt="${data.titulo}" style="width:100%; border-radius: 8px 8px 0 0;">` : ''}
                        <div style="padding: 15px;">
                            <h3>${data.titulo}</h3>
                            <p>${data.resumen || ''}</p>
                            <a href="articulo.html?id=${doc.id}" class="btn-leermas">Leer más</a>
                        </div>
                    </div>
                `;
            });
            articulosContainer.innerHTML = htmlContent;
        }).catch((error) => {
            console.error("Error cargando artículos:", error);
            articulosContainer.innerHTML = "<p>Cargando recursos...</p>";
        });
    }

    // D. MÓDULO DE DETALLE DE ARTÍCULO (Solo en articulo.html)
    const mainContent = document.getElementById('main-content');
    // Verificamos si estamos en la página de detalle buscando el parámetro 'id'
    const urlParams = new URLSearchParams(window.location.search);
    const docId = urlParams.get('id');

    if (mainContent && docId) {
        db.collection("articulos").doc(docId).get().then((doc) => {
            if (doc.exists) {
                const data = doc.data();
                mainContent.innerHTML = `
                    <h1>${data.titulo}</h1>
                    ${data.imagen ? `<img src="${data.imagen}" alt="${data.titulo}" style="max-width:100%; margin: 20px 0;">` : ''}
                    <div class="contenido-articulo">
                        ${data.contenido} 
                    </div>
                    <br>
                    <a href="recursos.html" class="btn-volver">← Volver a Recursos</a>
                `;
            } else {
                mainContent.innerHTML = "<h2>Artículo no encontrado</h2><p>Lo sentimos, el recurso que buscas no existe.</p>";
            }
        }).catch((error) => {
            console.error("Error obteniendo artículo:", error);
            mainContent.innerHTML = "<p>Error al cargar el contenido.</p>";
        });
    }
});