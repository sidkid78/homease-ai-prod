"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.arProcessing = void 0;
const pubsub_1 = require("firebase-functions/v2/pubsub");
const storage_1 = require("firebase-admin/storage");
const firestore_1 = require("firebase-admin/firestore");
const genai_1 = require("@google/genai");
// import { FalClient } from '@fal-ai/serverless-client'; // Example
// Initialize SDKs
const firestore = (0, firestore_1.getFirestore)();
const storage = (0, storage_1.getStorage)();
const genAI = new genai_1.GoogleGenAI(process.env.GEMINI_API_KEY);
// const fal = new FalClient({ key: process.env.FAL_AI_KEY });
exports.arProcessing = (0, pubsub_1.onMessagePublished)('ar-assessment-created', async (event) => {
    const { assessmentId, userId } = event.data.message.json;
    const assessmentRef = firestore.collection('ar-assessments').doc(assessmentId);
    try {
        // 1. Download images from Cloud Storage
        const bucket = storage.bucket();
        const [files] = await bucket.getFiles({ prefix: `ar-assessments/${userId}/${assessmentId}/` });
        const imageBuffers = await Promise.all(files.map(file => file.download().then(data => data[0])));
        // 2. Prepare data for Gemini
        const model = genAI.createContent({ model: 'gemini-1.5-pro-latest' });
        const prompt = `
      You are a Certified Aging-in-Place Specialist (CAPS). Analyze the following images of a home.
      Identify all potential accessibility hazards and safety risks for an older adult.
      For each hazard, provide a clear, actionable modification recommendation.
      Format your response as a JSON object with two keys: "hazards" and "recommendations".
    `;
        const imageParts = imageBuffers.map(buffer => ({
            inlineData: { data: buffer.toString('base64'), mimeType: 'image/jpeg' },
        }));
        // 3. Call Gemini API for analysis
        const result = await model.generateContent([prompt, ...imageParts]);
        const responseText = result.response.text();
        const analysis = JSON.parse(responseText); // Contains hazards and recommendations
        // 4. Call Fal.ai for visualization (using the primary image)
        // const visualizationResult = await fal.run('fal-ai/image-to-image', {
        //   image_url: 'URL_to_primary_image_in_storage',
        //   prompt: `Add this modification: ${analysis.recommendations[0].details}`
        // });
        // const visualizationUrl = visualizationResult.images[0].url;
        const visualizationUrl = "https://example.com/mock-visualization.jpg"; // Placeholder
        // 5. Update Firestore with the complete results
        await assessmentRef.update({
            status: 'complete',
            'results.hazards': analysis.hazards,
            'results.recommendations': analysis.recommendations,
            'results.visualizationUrl': visualizationUrl,
        });
        console.log(`Successfully processed assessment ${assessmentId}`);
    }
    catch (error) {
        console.error(`Failed to process assessment ${assessmentId}`, error);
        await assessmentRef.update({ status: 'failed', 'results.error': error.message });
    }
});
//# sourceMappingURL=ar.js.map