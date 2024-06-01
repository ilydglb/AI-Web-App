
import axios from 'axios';
const path = "http://localhost:8000/api/predict";

async function makePrediction(content,pth) {
   
    try {
        const response = await axios.post(path+pth, 
        [{text: content}], 
        {
            headers: {
                'Content-Type': 'application/json'
            }
        },{withCredentials: true});

        //console.log("AAA",response.data)
     
        if (Array.isArray(response.data)) {
            return response.data[0];
        } else {
            return response.data;
        }
    } catch (error) {
        console.error('Prediction request failed:', error);
        return null;
    }
}


const categorizeContent = async (content) => {

    const category = await makePrediction(content,'/categorize');
    return category;
};

const checkSpam = async (content) => {

    const spam = await makePrediction(content,'/checkspam');
    return spam;
};

const tagPost = async (content) => {

    const tags = await makePrediction(content,'/tagging');
    return tags;
};

const reviewContent = async (content) => {

    const review = await makePrediction(content,'/review-post');
    return review;
};

const summarizeContent = async (content) => {

    const summary = await makePrediction(content,'/summarize');
    return summary;
};


export {categorizeContent, summarizeContent, checkSpam, reviewContent, tagPost};  