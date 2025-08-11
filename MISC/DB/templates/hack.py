from flask import Flask, request, jsonify

app = Flask(__name__)

@app.route('/api/data', methods=['POST'])
def receive_json():
    data = request.get_json()  # or request.json
    if not data:
        return jsonify(error='Invalid JSON'), 400

    name = data.get('name')
    age = data.get('age')

    return jsonify(
        message='Data received successfully',
        name=name,
        age=age
    )

@app.route('/')
def home():
    return "Hello from Flask on local network!"

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8414, debug=True)
