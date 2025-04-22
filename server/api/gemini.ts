import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

/**
 * Generates an image using Google Gemini AI through REST API
 * 
 * @param prompt The user's image generation prompt
 * @returns A URL to the generated image that can be displayed in the UI
 */
export async function generateImage(prompt: string): Promise<string> {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not defined in environment variables');
    }

    // Make sure the uploads directory exists
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Generate a unique filename
    const randomId = crypto.randomBytes(8).toString('hex');
    const fileName = `gemini_${randomId}`;
    const filePath = path.join(uploadsDir, `${fileName}.png`);
    
    // Prepare the API request payload
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp-image-generation:generateContent?key=${apiKey}`;
    const payload = {
      contents: [{
        parts: [
          { text: prompt }
        ]
      }],
      generationConfig: {
        responseModalities: ["TEXT", "IMAGE"]
      }
    };
    
    // Send the API request
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`API request failed: ${response.status} ${response.statusText} - ${JSON.stringify(errorData)}`);
    }
    
    // Process the response to extract the image data
    const data = await response.json();
    
    // Extract image data from the response
    if (data.candidates && 
        data.candidates[0] && 
        data.candidates[0].content && 
        data.candidates[0].content.parts) {
      
      for (const part of data.candidates[0].content.parts) {
        if (part.inlineData && part.inlineData.data) {
          // Base64 decode and save the image
          const imageBuffer = Buffer.from(part.inlineData.data, 'base64');
          fs.writeFileSync(filePath, imageBuffer);
          
          // Return the URL path
          return `/uploads/${fileName}.png`;
        }
      }
    }
    
    // If we reach here, there was a response but no image data
    if (data.candidates && 
        data.candidates[0] && 
        data.candidates[0].content && 
        data.candidates[0].content.parts) {
      
      // Check if there's a text response
      for (const part of data.candidates[0].content.parts) {
        if (part.text) {
          return `Gemini tidak dapat menghasilkan gambar tetapi memberikan jawaban: ${part.text}`;
        }
      }
    }
    
    throw new Error('No image or text data found in the API response');
  } catch (error) {
    console.error('Error generating image:', error);
    
    // Return a helpful error message that can be displayed to the user
    if (error instanceof Error) {
      return `Gagal membuat gambar: ${error.message}. Silakan coba dengan prompt yang berbeda atau coba lagi nanti.`;
    }
    
    return 'Gagal membuat gambar. Silakan coba dengan prompt yang berbeda atau coba lagi nanti.';
  }
}
