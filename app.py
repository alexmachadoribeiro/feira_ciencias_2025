from flask import Flask, render_template

app = Flask(__name__)

@app.route('/')
def home():
    agua_salgada = 1.0
    # agua_potavel = agua_salgada - 0.0065
    agua_potavel = 0.0
    temperatura_agua = 25.0
    energia = 150
    sal_extraido = 0.0
    tempo_restante = 3600
    return render_template(
        'index.html',
        agua_salgada=agua_salgada,
        agua_potavel=agua_potavel,
        temperatura_agua=temperatura_agua,
        energia=energia,
        sal_extraido=sal_extraido,
        tempo_restante=tempo_restante
    )

if __name__ == '__main__':
    app.run(debug=True)