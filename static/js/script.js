let tempoRestante = window.tempoRestante;
let temperaturaAgua = window.temperaturaAgua;

const formatarTempo = (segundos) => {
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

const atualizarTempo = () => {
    if (temperaturaAgua < 100) {
        document.querySelector("#tempo-restante").textContent = "--:--:--";
        setTimeout(atualizarTempo, 1000);
    } else if (tempoRestante > 0) {
        document.querySelector("#tempo-restante").textContent = formatarTempo(tempoRestante);
        tempoRestante--;
        setTimeout(atualizarTempo, 1000);
    } else {
        document.querySelector("#tempo-restante").textContent = "--:--:--";
    }
}

atualizarTempo();

// Atualize o indicador a cada segundo
setInterval(atualizarIndicadorTemperatura, 1000);