from flask import Flask, request, jsonify
import joblib
import pandas as pd

app = Flask(__name__)


cat_model = joblib.load('naive_bayes_classifier.pkl') 
cat_vectorizer = joblib.load('count_vectorizer.pkl')

@app.route('/api/predict/categorize', methods=['POST'])
def predict_model1():
    return predictCategory(cat_model,cat_vectorizer)


spam_model = joblib.load("model.joblib")
spam_cv = joblib.load("spamcount_vectorizer.joblib")

@app.route('/api/predict/checkspam', methods=['POST'])
def predict_model2():
    return predictSpam(spam_model,spam_cv)


review_model = joblib.load("sentiment_model.pkl")

@app.route('/api/predict/review-post', methods=['POST'])
def predict_model3():
    return predictReview(review_model)

keyword_model = joblib.load("keybert_model.pkl")

@app.route('/api/predict/tagging', methods=['POST'])
def predict_model4():
    return predictTags(keyword_model)


sum_model = joblib.load("summarizer_model.pkl")

@app.route('/api/predict/summarize', methods=['POST'])
def predict_model5():
    return predictSummary(sum_model)


def predictCategory(model,vec):
    try:
        data = request.get_json()
        text_data = [item['text'] for item in data]
        
        # Vectorize the text data
        X = vec.transform(text_data)
        predictions = model.predict(X)
        return jsonify(predictions.tolist())
    except Exception as e:
        return jsonify({'error': str(e)}), 400

def predictSpam(model,cv):
    try:
        data = request.get_json()
         
        text_data = [item['text'] for item in data]
       
        email_count = cv.transform(text_data)
        predictions=model.predict(email_count)[0]
   
        return str(predictions)
  
    except Exception as e:
        return jsonify({'error': str(e)}), 400

def predictReview(model_data):
    try:
        data = request.get_json()
        input_text = [item['text'] for item in data]
            
        model = model_data['model']
        tokenizer = model_data['tokenizer']

        inputs = tokenizer(input_text, return_tensors="pt")
        outputs = model(**inputs)
        predictions = outputs.logits.argmax(-1)

        #print("Prediction:", predictions.item())
        return  str(predictions.item())
    
    except Exception as e:
        return jsonify({'error': str(e)}), 400

def predictSummary(model_data):
    try:
        data = request.get_json()
        input_text = [item['text'] for item in data]
            
        summarizer = model_data['summarizer']
 
        summary = summarizer(input_text)

        summary_text = summary[0]['summary_text']  # Extracting the summary text
        return summary_text
        
    except Exception as e:
        return jsonify({'error': str(e)}), 400

def predictTags(model):
    try:
        data = request.get_json()
        text_data = [item['text'] for item in data]
        
        keywords = model.extract_keywords(text_data)
        
        ke = [word for word, score in keywords]

        print(ke)
        return str(ke)
    except Exception as e:
        return jsonify({'error': str(e)}), 400

if __name__ == '__main__':
    app.run(debug=True, port=8000)
