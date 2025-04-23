import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

/**
 * Generates an image using Google Gemini AI through direct REST API
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

    console.log('Attempting to generate image with prompt:', prompt);

    // Prepare the API request payload exactly as shown in the example
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp-image-generation:generateContent?key=${apiKey}`;
    const payload = {
      contents: [
        {
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    };

    console.log('Sending request to API URL:', apiUrl);

    // Send the API request
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    // Handle non-200 responses
    if (!response.ok) {
      let errorMsg = `API request failed with status: ${response.status} ${response.statusText}`;
      try {
        const errorData = await response.json();
        errorMsg += ` - ${JSON.stringify(errorData)}`;
      } catch (e) {
        errorMsg += ` - Could not parse error response`;
      }
      throw new Error(errorMsg);
    }

    // Process the response to extract the image data
    const data = await response.json();
    console.log('Received response with status:', response.status);

    // Extract image data from the response
    if (
      data.candidates &&
      data.candidates[0] &&
      data.candidates[0].content &&
      data.candidates[0].content.parts
    ) {
      console.log('Found candidates in response');

      for (const part of data.candidates[0].content.parts) {
        if (part.inlineData && part.inlineData.data) {
          console.log('Found inline data for image');

          // Base64 decode and save the image
          const imageBuffer = Buffer.from(part.inlineData.data, 'base64');
          fs.writeFileSync(filePath, imageBuffer);

          console.log('Image saved to', filePath);

          // Return the URL path
          return `/uploads/${fileName}.png`;
        }
      }
    }

    // If we reach here, there was a response but no image data
    console.log('No image data found in response, checking for text');

    if (
      data.candidates &&
      data.candidates[0] &&
      data.candidates[0].content &&
      data.candidates[0].content.parts
    ) {
      // Check if there's a text response
      for (const part of data.candidates[0].content.parts) {
        if (part.text) {
          console.log('Found text response instead of image');
          return `Gemini tidak dapat menghasilkan gambar tetapi memberikan jawaban: ${part.text}`;
        }
      }
    }

    // Debug response structure
    console.log('Response structure:', JSON.stringify(data, null, 2));

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
