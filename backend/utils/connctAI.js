
import axios from 'axios';

async function makePrediction(content) {
   
    try {
        const response = await axios.post('http://localhost:8000/api/predict', 
        [{text: content}], 
        {
            headers: {
                'Content-Type': 'application/json'
            }
        },{withCredentials: true});
     
        return response.data[0];  // Directly access the first prediction from the list
    } catch (error) {
        console.error('Prediction request failed:', error);
        return null;
    }
}


const categorizeContent = async (content) => {

    const category = await makePrediction(content);
    return category;
};

const summarizeContent = async (content) => {

    const summary = await makePrediction(content);
    return summary;
};


export {categorizeContent, summarizeContent};  