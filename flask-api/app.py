from flask import Flask, request, jsonify
import joblib
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer

app = Flask(__name__)

# Load the model
model = joblib.load('naive_bayes_classifier.pkl')

# Load the vectorizer
vectorizer = joblib.load('count_vectorizer.pkl')

@app.route('/api/predict', methods=['POST'])


def predict():
    try:
        data = request.get_json() 
        print('Received Data:', data)
        text_data = [item['text'] for item in data]
        # Vectorize the text data
        X = vectorizer.transform(text_data)
        predictions = model.predict(X)
        return jsonify(predictions.tolist()) 
    except Exception as e:
        return jsonify({'error': str(e)}), 400

if __name__ == '__main__':
    app.run(debug=True, port=8000)
