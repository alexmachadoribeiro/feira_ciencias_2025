// Cada litro = 3600 segundos (1h) de tempo estimado
const TAXA_EVAPORACAO_LPS = 0.0002778; // litros por segundo

// Obtém o valor atual de água salgada exibido na página
const visorAguaSalgada = document.querySelectorAll('.visor')[0];
let aguaSalgadaAtual = parseFloat(visorAguaSalgada.textContent.replace(',', '.')) || 0;

// Cada litro = 3600 segundos (1h) de tempo estimado
let tempoRestante = Math.round(aguaSalgadaAtual * 3600);

let temperaturaAgua = window.temperaturaAgua;
let contagemAtiva = false;

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

function atualizarTempoEstimado() {
    // Atualiza o tempo estimado baseado no valor atual de água salgada
    const visorAguaSalgada = document.querySelectorAll('.visor')[0];
    let aguaSalgadaAtual = parseFloat(visorAguaSalgada.textContent.replace(',', '.')) || 0;
    let tempoRestante = Math.floor(aguaSalgadaAtual / TAXA_EVAPORACAO_LPS);

    if (temperaturaAgua < 100 || aguaSalgadaAtual <= 0) {
        document.querySelector("#tempo-restante").textContent = "--:--:--";
        contagemAtiva = false;
    } else if (tempoRestante > 0) {
        document.querySelector("#tempo-restante").textContent = formatarTempo(tempoRestante);
        contagemAtiva = true;
    } else {
        document.querySelector("#tempo-restante").textContent = "--:--:--";
        contagemAtiva = false;
    }
}

function atualizarValores() {
    // Só atualiza se a temperatura for 100 ºC e o tempo estiver rodando
    if (temperaturaAgua >= 100 && contagemAtiva) {
        fetch('/valores_atualizados')
            .then(response => response.json())
            .then(data => {
                // Arredonda para 2 casas decimais ao exibir
                document.querySelectorAll('.visor')[0].textContent = Number(data.agua_salgada).toFixed(2);
                document.querySelectorAll('.visor')[6].textContent = Number(data.agua_potavel).toFixed(2);
                document.querySelectorAll('.visor')[7].textContent = Number(data.sal_extraido).toFixed(2);
            });
    }
    // Após atualizar valores, atualize o tempo estimado
    atualizarTempoEstimado();
}

// Atualize o indicador de temperatura e vaporização a cada segundo
setInterval(atualizarIndicadorTemperatura, 1000);
setInterval(atualizarIndicadorVaporization, 1000);
// Atualize valores e tempo estimado a cada segundo
setInterval(atualizarValores, 1000);
// Atualize o tempo estimado ao carregar a página
atualizarTempoEstimado();