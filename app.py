from flask import Flask, render_template, jsonify, request
import time
from datetime import datetime
import requests

app = Flask(__name__)

# Variáveis globais para simulação
agua_salgada = 1.0
agua_potavel = 0.0
sal_extraido = 0.0
inicio = time.time()
TEMPERATURA_INICIAL = 20
TEMPERATURA_FINAL = 100
TEMPO_POR_UNIDADE = 5 * 60
EVAPORACAO_POR_SEGUNDO = 0.2778 / 1000  # ml para litros
SALINIDADE = 3.5 / 100  # 3.5%

@app.route('/')
def home():
    salinidade = 3.5
    temperatura_agua = TEMPERATURA_INICIAL
    temperatura_ambiente = 20
    energia = 1114.67
    tempo_restante = 3600 * agua_salgada
    evaporacao = 0.2778
    return render_template(
        'index.html',
        agua_salgada=agua_salgada,
        salinidade=salinidade,
        agua_potavel=agua_potavel,
        temperatura_agua=temperatura_agua,
        temperatura_ambiente=temperatura_ambiente,
        energia=energia,
        sal_extraido=sal_extraido,
        tempo_restante=tempo_restante,
        evaporacao=evaporacao,
    )

@app.route('/temperatura_atual')
def temperatura_atual():
    tempo_total = agua_salgada * TEMPO_POR_UNIDADE
    tempo_passado = time.time() - inicio
    if tempo_passado >= tempo_total:
        temperatura = TEMPERATURA_FINAL
    else:
        temperatura = TEMPERATURA_INICIAL + (TEMPERATURA_FINAL - TEMPERATURA_INICIAL) * (tempo_passado / tempo_total)
    return jsonify({'temperatura': round(temperatura, 1)})

@app.route('/evaporacao_atual')
def evaporacao_atual():
    tempo_total = agua_salgada * TEMPO_POR_UNIDADE
    tempo_passado = time.time() - inicio
    if tempo_passado >= tempo_total:
        temperatura = TEMPERATURA_FINAL
    else:
        temperatura = TEMPERATURA_INICIAL + (TEMPERATURA_FINAL - TEMPERATURA_INICIAL) * (tempo_passado / tempo_total)
    if temperatura < 100:
        evaporacao = None
    else:
        evaporacao = 0.2778
    return jsonify({'evaporacao': evaporacao})

@app.route('/set_agua_salgada', methods=['POST'])
def set_agua_salgada():
    global agua_salgada, agua_potavel, sal_extraido, inicio
    data = request.get_json()
    agua_salgada = float(data.get('agua_salgada', 1.0))
    agua_potavel = 0.0
    sal_extraido = 0.0
    inicio = time.time()
    return '', 204

@app.route('/valores_atualizados')
def valores_atualizados():
    global agua_salgada, agua_potavel, sal_extraido
    tempo_passado = time.time() - inicio
    evaporado = min(agua_salgada, EVAPORACAO_POR_SEGUNDO * tempo_passado)
    agua_atual = max(agua_salgada - evaporado, 0)
    sal_extraido_atual = sal_extraido + evaporado * SALINIDADE * 1000  # g
    agua_potavel_atual = agua_potavel + evaporado * (1 - SALINIDADE)
    if agua_atual <= 0:
        agua_atual = 0
    return jsonify({
        'agua_salgada': round(agua_atual, 3),
        'sal_extraido': round(sal_extraido_atual, 3),
        'agua_potavel': round(agua_potavel_atual, 3)
    })

@app.route('/tempo_zerar')
def tempo_zerar():
    tempo_total_aquecimento = agua_salgada * TEMPO_POR_UNIDADE
    tempo_passado = time.time() - inicio
    agora = time.time()

    if tempo_passado < tempo_total_aquecimento:
        # Ainda está aquecendo, calcula quando chega a 100°C
        instante_100c = inicio + tempo_total_aquecimento
        # Após 100°C, começa a evaporar
        tempo_evaporacao = agua_salgada / EVAPORACAO_POR_SEGUNDO
        instante_zerar = instante_100c + tempo_evaporacao
    else:
        # Já está evaporando
        evaporado = EVAPORACAO_POR_SEGUNDO * (agora - (inicio + tempo_total_aquecimento))
        agua_restante = max(agua_salgada - evaporado, 0)
        instante_zerar = agora + (agua_restante / EVAPORACAO_POR_SEGUNDO) if agua_restante > 0 else agora

    return jsonify({
        'timestamp_zerar': int(instante_zerar)
    })

@app.route('/temperatura_brasilia')
def temperatura_brasilia():
    # Coordenadas de Brasília: latitude -15.78, longitude -47.93
    url = "https://api.open-meteo.com/v1/forecast"
    params = {
        "latitude": -15.78,
        "longitude": -47.93,
        "current_weather": True,
        "timezone": "America/Sao_Paulo"
    }
    try:
        resp = requests.get(url, params=params, timeout=5)
        resp.raise_for_status()
        data = resp.json()
        temperatura = data.get("current_weather", {}).get("temperature")
        if temperatura is not None:
            return jsonify({"temperatura": temperatura})
        else:
            return jsonify({"temperatura": "--"})
    except Exception:
        return jsonify({"temperatura": "--"})

if __name__ == '__main__':
    app.run(debug=True)