"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.arProcessing = void 0;
const pubsub_1 = require("firebase-functions/v2/pubsub");
const storage_1 = require("firebase-admin/storage");
const firestore_1 = require("firebase-admin/firestore");
const genai_1 = require("@google/genai");
// Initialize SDKs
const firestore = (0, firestore_1.getFirestore)();
const storage = (0, storage_1.getStorage)();
// Initialize Google Gen AI SDK - using Gemini Developer API (not Vertex AI)
const ai = new genai_1.GoogleGenAI({
    vertexai: false,
    apiKey: process.env.GEMINI_API_KEY,
});
exports.arProcessing = (0, pubsub_1.onMessagePublished)('ar-assessment-created', async (event) => {
    var _a;
    const { assessmentId, userId } = event.data.message.json;
    const assessmentRef = firestore.collection('ar-assessments').doc(assessmentId);
    try {
        // 1. Download images from Cloud Storage
        const bucket = storage.bucket();
        const [files] = await bucket.getFiles({ prefix: `ar-assessments/${userId}/${assessmentId}/` });
        // 2. Prepare image parts for Gemini using latest @google/genai SDK
        const imageParts = [];
        for (const file of files) {
            const [buffer] = await file.download();
            imageParts.push({
                inlineData: {
                    data: buffer.toString('base64'),
                    mimeType: 'image/jpeg',
                },
            });
        }
        // 3. Prepare prompt for Gemini
        const prompt = `
      You are a Certified Aging-in-Place Specialist (CAPS). Analyze the following images of a home.
      Identify all potential accessibility hazards and safety risks for an older adult.
      For each hazard, provide a clear, actionable modification recommendation.
      
      Return your response as a JSON object with this structure:
      {
        "hazards": [
          {
            "type": "string (e.g., 'trip hazard', 'poor lighting')",
            "severity": "low" | "medium" | "high",
            "location": "string (e.g., 'bathroom entrance')",
            "description": "string (detailed description)"
          }
        ],
        "recommendations": [
          {
            "title": "string (brief title)",
            "description": "string (detailed recommendation)",
            "priority": "low" | "medium" | "high",
            "estimatedCost": {
              "min": number,
              "max": number
            },
            "relatedSpecialty": "string (e.g., 'bathroom-modification')"
          }
        ]
      }
    `;
        // 4. Call Gemini API using latest @google/genai SDK
        // Reference: https://cloud.google.com/vertex-ai/generative-ai/docs/sdks/overview#googlegenaisdk_quickstart-nodejs_genai_sdk
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [
                { text: prompt },
                ...imageParts,
            ],
            config: {
                responseMimeType: 'application/json',
            },
        });
        const analysis = JSON.parse(response.text || '{}');
        // 5. Generate "after" visualizations using Gemini's image editing
        const visualizationUrls = [];
        if (analysis.recommendations && analysis.recommendations.length > 0 && files.length > 0) {
            try {
                // Use the first image and top recommendation for visualization
                const [firstFile] = files;
                const [buffer] = await firstFile.download();
                const topRecommendation = analysis.recommendations[0];
                // Create visualization prompt
                const visualizationPrompt = `
          Create a photorealistic "after" visualization showing this home modification:
          ${topRecommendation.title}
          
          Description: ${topRecommendation.description}
          
          Make the modifications look professional and realistic. 
          Keep the overall style and lighting of the original image.
          Show clearly what the improvement would look like.
        `;
                // Generate visualization using Gemini image generation
                const visualizationResponse = await ai.models.generateContent({
                    model: 'gemini-2.5-flash-image-preview',
                    contents: [
                        {
                            inlineData: {
                                data: buffer.toString('base64'),
                                mimeType: 'image/jpeg',
                            },
                        },
                        { text: visualizationPrompt },
                    ],
                });
                // Extract generated images from response
                if (visualizationResponse.candidates && visualizationResponse.candidates[0]) {
                    const parts = ((_a = visualizationResponse.candidates[0].content) === null || _a === void 0 ? void 0 : _a.parts) || [];
                    for (let i = 0; i < parts.length; i++) {
                        const part = parts[i];
                        if (part.inlineData && part.inlineData.data) {
                            // Save generated image to Cloud Storage
                            const visualizationFileName = `visualization_${i}.jpg`;
                            const visualizationPath = `ar-results/${assessmentId}/${visualizationFileName}`;
                            const visualizationFile = bucket.file(visualizationPath);
                            await visualizationFile.save(Buffer.from(part.inlineData.data, 'base64'), {
                                metadata: {
                                    contentType: part.inlineData.mimeType || 'image/jpeg',
                                },
                            });
                            // Make the file publicly readable (or use signed URLs for private access)
                            await visualizationFile.makePublic();
                            // Get public URL
                            const publicUrl = `https://storage.googleapis.com/${bucket.name}/${visualizationPath}`;
                            visualizationUrls.push(publicUrl);
                        }
                    }
                }
                console.log(`Generated ${visualizationUrls.length} visualizations for assessment ${assessmentId}`);
            }
            catch (visualizationError) {
                console.error(`Failed to generate visualizations for assessment ${assessmentId}:`, visualizationError);
                // Continue without visualizations if generation fails
            }
        }
        // 6. Update Firestore with the complete results
        await assessmentRef.update({
            status: 'complete',
            processedAt: new Date(),
            'results.hazards': analysis.hazards,
            'results.recommendations': analysis.recommendations,
            'results.visualizations': visualizationUrls,
            updatedAt: new Date(),
        });
        console.log(`Successfully processed assessment ${assessmentId}`);
    }
    catch (error) {
        console.error(`Failed to process assessment ${assessmentId}`, error);
        await assessmentRef.update({
            status: 'failed',
            'results.error': error.message,
            updatedAt: new Date(),
        });
    }
});
//# sourceMappingURL=ar.js.map