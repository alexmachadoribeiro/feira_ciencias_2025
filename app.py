from flask import Flask, render_template, jsonify
import time

app = Flask(__name__)

agua_salgada = 0.2  # Exemplo, defina conforme necessário
inicio = time.time()
TEMPERATURA_INICIAL = 25
TEMPERATURA_FINAL = 100
TEMPO_POR_UNIDADE = 5 * 60

@app.route('/')
def home():
    # agua_potavel = agua_salgada - 0.0065
    agua_potavel = 0.0
    temperatura_agua = 25.0
    energia = 150
    sal_extraido = 0.0
    tempo_restante = 3600 * agua_salgada
    return render_template(
        'index.html',
        agua_salgada=agua_salgada,
        agua_potavel=agua_potavel,
        temperatura_agua=temperatura_agua,
        energia=energia,
        sal_extraido=sal_extraido,
        tempo_restante=tempo_restante
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

if __name__ == '__main__':
    app.run(debug=True)