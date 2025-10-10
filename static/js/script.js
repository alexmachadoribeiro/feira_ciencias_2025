let tempoRestante = window.tempoRestante;

const formatarTempo = (segundos) => {
    const h = String(Math.floor(segundos / 3600)).padStart(1, '0');
    const m = String(Math.floor((segundos % 3600) / 60)).padStart(2, '0');
    const s = String(segundos % 60).padStart(2, '0');
    return `${h}:${m}:${s}`;
}

const atualizarTempo = () => {
    document.querySelector("#tempo-restante").textContent = formatarTempo(tempoRestante);
    if (tempoRestante > 0) {
        tempoRestante--;
        setTimeout(atualizarTempo, 1000);
    }
}

atualizarTempo();