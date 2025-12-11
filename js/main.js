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
    
    // A. MÓDULO DE CONTACTO
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btnSubmit = document.getElementById('btnSubmit');
            const formStatus = document.getElementById('formStatus');
            
            const originalBtnText = btnSubmit.innerText;
            btnSubmit.innerText = "Enviando...";
            btnSubmit.disabled = true;

            try {
                const nombre = document.getElementById('nombre').value;
                const email = document.getElementById('email').value;
                const telefono = document.getElementById('telefono').value;
                const mensaje = document.getElementById('mensaje').value;

                await db.collection("solicitudes_ayuda").add({
                    nombre, email, telefono, mensaje,
                    fecha: new Date()
                });

                formStatus.style.color = "green";
                formStatus.innerText = "¡Mensaje enviado con éxito!";
                contactForm.reset();

            } catch (error) {
                console.error("Error:", error);
                formStatus.style.color = "red";
                formStatus.innerText = "Error al enviar. Intenta nuevamente.";
            } finally {
                btnSubmit.innerText = originalBtnText;
                btnSubmit.disabled = false;
            }
        });
    }

    // B. MÓDULO DE PROGRAMAS
    const programasContainer = document.getElementById('programas-container');
    if (programasContainer) {
        db.collection("programas").orderBy("orden").get().then((querySnapshot) => {
            let htmlContent = '';
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                htmlContent += `
                    <div class="card">
                        ${data.imagen ? `<img src="${data.imagen}" alt="${data.titulo}" style="width:100%; height:200px; object-fit:cover;">` : ''}
                        <h3>${data.titulo}</h3> 
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

    // C. MÓDULO DE RECURSOS (BLOG - LISTADO)
    const articulosContainer = document.getElementById('articulos-container');
    if (articulosContainer) {
        db.collection("articulos").get().then((querySnapshot) => {
            let htmlContent = '';
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                htmlContent += `
                    <div class="card article-card">
                        ${data.imagen ? `<img src="${data.imagen}" alt="${data.titulo}" style="width:100%; height:200px; object-fit:cover;">` : ''}
                        <div style="padding: 15px; flex-grow:1; display:flex; flex-direction:column;">
                            <span style="color:var(--color-orange); font-size:0.8rem; font-weight:bold; text-transform:uppercase;">${data.categoria || 'Blog'}</span>
                            <h3>${data.titulo}</h3>
                            <p style="flex-grow:1;">${data.resumen || ''}</p>
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

    // D. MÓDULO DE DETALLE DE ARTÍCULO (CORREGIDO Y COMPLETO)
    const mainContent = document.getElementById('main-content');
    const urlParams = new URLSearchParams(window.location.search);
    const docId = urlParams.get('id');

    if (mainContent && docId) {
        db.collection("articulos").doc(docId).get().then((doc) => {
            if (doc.exists) {
                const data = doc.data();
                
                // Formateo de fecha simple si existe
                let fechaTexto = '';
                if (data.fecha) {
                    // Si es un Timestamp de Firebase
                    if (data.fecha.toDate) {
                        fechaTexto = data.fecha.toDate().toLocaleDateString();
                    } else {
                        fechaTexto = data.fecha; // Si es string
                    }
                }

                // Búsqueda del contenido en varios campos posibles para evitar "undefined"
                const contenidoReal = data.contenido || data.cuerpo || data.body || '<p>Contenido no disponible.</p>';

                mainContent.innerHTML = `
                    <div style="text-align:center; max-width:800px; margin:0 auto;">
                        <span style="background:var(--color-orange); color:white; padding:5px 15px; border-radius:20px; font-size:0.9rem; font-weight:bold;">
                            ${data.categoria || 'Artículos'}
                        </span>
                        <h1 style="color:var(--color-teal); margin-top:15px; font-size:2.5rem;">${data.titulo}</h1>
                        <p style="color:#666; font-style:italic;">
                            Por ${data.autor || 'Fundazoe'} • ${fechaTexto}
                        </p>
                        
                        ${data.imagen ? `<img src="${data.imagen}" alt="${data.titulo}" style="width:100%; border-radius:12px; margin: 30px 0; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">` : ''}
                    </div>

                    <div class="contenido-articulo" style="max-width:800px; margin:0 auto; line-height:1.8; font-size:1.1rem; color:#333;">
                        ${data.resumen ? `<p style="font-weight:bold; font-size:1.2rem; color:var(--color-teal); border-left:4px solid var(--color-orange); padding-left:15px; margin-bottom:30px;">${data.resumen}</p>` : ''}
                        
                        ${contenidoReal} 
                    </div>

                    <div style="text-align:center; margin-top:60px; padding-top:20px; border-top:1px solid #eee;">
                        <a href="recursos.html" class="btn-volver" style="text-decoration:none;">← Volver a Recursos</a>
                    </div>
                `;
            } else {
                mainContent.innerHTML = "<h2 style='text-align:center; margin-top:50px;'>Artículo no encontrado</h2>";
            }
        }).catch((error) => {
            console.error("Error:", error);
            mainContent.innerHTML = "<p style='text-align:center; margin-top:50px;'>Error al cargar el contenido.</p>";
        });
    }
});