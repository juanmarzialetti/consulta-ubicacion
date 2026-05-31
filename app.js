const popup =
    document.getElementById("popup");

const popupBody =
    document.getElementById("popup-body");

const beep =
    document.getElementById("beep");

let bloqueoEscaneo =
    false;

const API_URL =
    "https://sparkling-meadow-f10cconsulta-paquetes-api.juanantoniomarzialetti.workers.dev";

const inputTracking =
    document.getElementById("tracking");

const btnConsultar =
    document.getElementById("btnConsultar");

const resultado =
    document.getElementById("resultado");

let ultimoTrackingConsultado =
    "";

btnConsultar.addEventListener("click", () => {
    consultarTracking(
        inputTracking.value
    );
});

inputTracking.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        consultarTracking(
            inputTracking.value
        );
    }
});

async function consultarTracking(valor) {

    if (bloqueoEscaneo) {
        return;
    }

    const tracking =
        String(valor || "")
        .trim()
        .toUpperCase();

    if (!tracking) {
        return;
    }

        bloqueoEscaneo =
            true;

        /*
            Sonido beep
        */

        try {

            beep.currentTime = 0;

            beep.play();

        } catch (e) {}

    try {

        const url =
            `${API_URL}?api=1&tracking=${encodeURIComponent(tracking)}`;

        const response =
            await fetch(url);

        const data =
            await response.json();

        mostrarPopup(data);

    } catch (error) {

        mostrarPopup({
            encontrado: false,
            mensaje:
                "Error al consultar"
        });
    }

    setTimeout(() => {

        ocultarPopup();

        bloqueoEscaneo =
            false;

    }, 3000);
}

function mostrarPopup(data) {

    popup.classList.remove("oculto");

    if (!data.encontrado) {

        popupBody.innerHTML =
            `
                <h2 class="popup-error">
                    NO ENCONTRADO
                </h2>

                <p>
                    ${data.mensaje}
                </p>
            `;

        return;
    }

    const claseEstado =
        obtenerClaseEstado(data.estado);

    popupBody.innerHTML =
        `
            <h2 class="${claseEstado}">
                ${data.estado}
            </h2>

            <p>
                <strong>Tracking:</strong>
                ${data.tracking}
            </p>

            <p>
                <strong>Ubicación:</strong>
                ${data.ubicacion || "-"}
            </p>

            <p>
                <strong>Fecha:</strong>
                ${formatearFecha(data.fechaDisponibilidad)}
            </p>

            <p>
                <strong>Vencimiento:</strong>
                ${formatearFecha(data.fechaVencimiento)}
            </p>

            <p class="mensaje-popup">
                ${data.mensaje}
            </p>
        `;
}

function ocultarPopup() {

    popup.classList.add("oculto");

    popupBody.innerHTML = "";
}

function pintarResultado(data) {

    resultado.className =
        "resultado";

    if (!data.encontrado) {

        resultado.innerHTML =
            `
                <h2 class="no-encontrado">No encontrado</h2>
                <p>${data.mensaje}</p>
            `;

        return;
    }

    const claseEstado =
        obtenerClaseEstado(data.estado);

    resultado.innerHTML =
        `
            <h2 class="${claseEstado}">
                ${data.estado}
            </h2>

            <p>
                <strong>Tracking:</strong>
                ${data.tracking || "-"}
            </p>

            <p>
                <strong>Ubicación:</strong>
                ${data.ubicacion || "-"}
            </p>

            <p>
                <strong>Fecha de disponibilidad:</strong>
                ${formatearFecha(data.fechaDisponibilidad)}
            </p>

            <p>
                <strong>Fecha de vencimiento:</strong>
                ${formatearFecha(data.fechaVencimiento)}
            </p>

            <p class="mensaje">
                ${data.mensaje}
            </p>
        `;
}

function mostrarMensaje(texto, tipo) {

    resultado.className =
        `resultado ${tipo}`;

    resultado.innerHTML =
        `<p>${texto}</p>`;
}

function obtenerClaseEstado(estado) {

    if (estado === "DISPONIBLE") {
        return "disponible";
    }

    if (estado === "ENTREGADA") {
        return "entregada";
    }

    if (estado === "DEVUELTA") {
        return "devuelta";
    }

    return "pendiente";
}

function formatearFecha(fecha) {

    if (!fecha) {
        return "-";
    }

    const date =
        new Date(fecha);

    if (isNaN(date.getTime())) {
        return fecha;
    }

    return date.toLocaleDateString("es-AR");
}

const scanner =
    new Html5QrcodeScanner(
        "reader",
        {
            fps: 10,
            qrbox: {
                width: 250,
                height: 250
            },
            rememberLastUsedCamera: true
        },
        false
    );

    scanner.render(
        (decodedText) => {

            if (bloqueoEscaneo) {
                return;
            }

            consultarTracking(decodedText);
        },
    () => {}
);