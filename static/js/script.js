// Cada litro = 3600 segundos (1h) de tempo estimado
const TAXA_EVAPORACAO_LPS = 0.0002778; // litros por segundo

// Obtém o valor atual de água salgada exibido na página
const visorAguaSalgada = document.querySelectorAll('.visor')[0];
let aguaSalgadaAtual = parseFloat(visorAguaSalgada.textContent.replace(',', '.')) || 0;

// Cada litro = 3600 segundos (1h) de tempo estimado
let tempoRestante = Math.round(aguaSalgadaAtual * 3600);

let temperaturaAgua = window.temperaturaAgua;
let contagemAtiva = false;

let timestampZerar = null;

const formatarTempo = (segundos) => {
    if (segundos <= 0 || isNaN(segundos)) return "--:--:--";
    const h = String(Math.floor(segundos / 3600)).padStart(1, '0');
    const m = String(Math.floor((segundos % 3600) / 60)).padStart(2, '0');
    const s = String(segundos % 60).padStart(2, '0');
    return `${h}:${m}:${s}`;
}

const atualizarIndicadorTemperatura = () => {
    fetch('/temperatura_atual')
        .then(response => response.json())
        .then(data => {
            const indicador = document.querySelector("#indicador-temperatura");
            indicador.textContent = `${data.temperatura}`;
            // Atualiza a variável global temperaturaAgua
            temperaturaAgua = Number(data.temperatura);
        });
}

const atualizarIndicadorVaporization = () => {
    fetch('/evaporacao_atual')
        .then(response => response.json())
        .then(data => {
            const indicador = document.querySelector("#indicador-vaporization");
            if (data.evaporacao === null) {
                indicador.textContent = "--";
            } else {
                indicador.textContent = Number(data.evaporacao).toFixed(2);
            }
        });
}

function buscarTimestampZerar() {
    fetch('/tempo_zerar')
        .then(response => response.json())
        .then(data => {
            timestampZerar = data.timestamp_zerar;
        });
}

// Atualiza a cada 10 segundos para garantir precisão
setInterval(buscarTimestampZerar, 10000);
buscarTimestampZerar();

function atualizarTempoRestante() {
    if (!timestampZerar) {
        document.querySelector("#tempo-restante").textContent = "--:--:--";
        setTimeout(atualizarTempoRestante, 1000);
        return;
    }
    const agora = Math.floor(Date.now() / 1000);
    let segundosRestantes = timestampZerar - agora;
    if (temperaturaAgua < 100) {
        document.querySelector("#tempo-restante").textContent = "--:--:--";
    } else if (segundosRestantes > 0) {
        document.querySelector("#tempo-restante").textContent = formatarTempo(segundosRestantes);
    } else {
        document.querySelector("#tempo-restante").textContent = "00:00:00";
    }
    setTimeout(atualizarTempoRestante, 1000);
}

atualizarTempoRestante();

function atualizarValores() {
    // Só atualiza os valores quando a temperatura da água for igual ou maior a 100 ºC
    if (temperaturaAgua >= 100) {
        fetch('/valores_atualizados')
            .then(response => response.json())
            .then(data => {
                document.querySelectorAll('.visor')[0].textContent = Number(data.agua_salgada).toFixed(2);
                document.querySelectorAll('.visor')[6].textContent = Number(data.agua_potavel).toFixed(2);
                document.querySelectorAll('.visor')[7].textContent = Number(data.sal_extraido).toFixed(2);
            });
    }
}

function atualizarTempoEstimado() {
    if (!timestampZerar) {
        document.querySelector("#tempo-restante").textContent = "--:--:--";
        return;
    }
    const agora = Math.floor(Date.now() / 1000);
    let segundosRestantes = timestampZerar - agora;
    if (temperaturaAgua < 100) {
        document.querySelector("#tempo-restante").textContent = "--:--:--";
    } else if (segundosRestantes > 0) {
        document.querySelector("#tempo-restante").textContent = formatarTempo(segundosRestantes);
    } else {
        document.querySelector("#tempo-restante").textContent = "00:00:00";
    }
}

// Atualize o tempo estimado a cada segundo
setInterval(atualizarTempoEstimado, 1000);

// Atualize o indicador de temperatura e vaporização a cada segundo
setInterval(atualizarIndicadorTemperatura, 1000);
setInterval(atualizarIndicadorVaporization, 1000);
// Atualize valores a cada segundo (mas só muda se temperatura >= 100)
setInterval(atualizarValores, 1000);
// Atualize o tempo estimado ao carregar a página
atualizarTempoEstimado();