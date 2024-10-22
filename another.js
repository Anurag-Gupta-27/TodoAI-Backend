const { ModelServiceClient } = require('@google-ai/generativelanguage').v1beta;
const { GoogleAuth } = require('google-auth-library');
require('dotenv').config();

const API_KEY = process.env.GOOGLE_API_KEY;
const modelClient = new ModelServiceClient({
  authClient: new GoogleAuth().fromAPIKey(API_KEY),
});

async function listModels() {
  const [models] = await modelClient.listModels({});
  console.log('Available models:');
  models.forEach(model => {
    console.log(`- ${model.name}`);
  });
}

listModels();