import { GoogleGenAI } from '@google/genai';
import mime from 'mime';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

/**
 * Generates an actual image using Google Gemini AI based on the provided prompt
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

    // Initialize the Gemini AI client
    const ai = new GoogleGenAI({
      apiKey: apiKey,
    });

    // Configuration for image generation
    const config = {
      thinkingConfig: {
        thinkingBudget: 0,
      },
      responseModalities: [
        'image',
        'text',
      ],
      responseMimeType: 'text/plain',
    };
    
    // Use the image generation model
    const model = 'gemini-2.0-flash-exp-image-generation';
    
    // Prepare the contents with the user's prompt
    const contents = [
      {
        role: 'user',
        parts: [
          {
            text: prompt,
          },
        ],
      },
    ];

    // Make sure the uploads directory exists
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Generate a unique filename
    const randomId = crypto.randomBytes(8).toString('hex');
    const fileName = `gemini_${randomId}`;
    let fullFilePath = '';

    // Stream the response to handle image data
    const response = await ai.models.generateContentStream({
      model,
      config,
      contents,
    });

    for await (const chunk of response) {
      if (!chunk.candidates || !chunk.candidates[0].content || !chunk.candidates[0].content.parts) {
        continue;
      }
      
      if (chunk.candidates[0].content.parts[0].inlineData) {
        // Handle image data
        const inlineData = chunk.candidates[0].content.parts[0].inlineData;
        const fileExtension = mime.getExtension(inlineData.mimeType || '') || 'png';
        const buffer = Buffer.from(inlineData.data || '', 'base64');
        
        fullFilePath = path.join(uploadsDir, `${fileName}.${fileExtension}`);
        fs.writeFileSync(fullFilePath, buffer);
        
        // Return a URL path relative to the server root
        return `/uploads/${fileName}.${fileExtension}`;
      }
      else if (chunk.text) {
        console.log('Received text from image generation:', chunk.text);
      }
    }

    // If no image was generated but the API didn't fail, return a descriptive message
    if (!fullFilePath) {
      return "Gemini could not generate an image for your prompt. Please try a different description.";
    }
    
    throw new Error('No image generated from Gemini API');
  } catch (error) {
    console.error('Error generating image:', error);
    
    // Return a helpful error message that can be displayed to the user
    if (error instanceof Error) {
      // Generate a fallback description since we couldn't generate an image
      return `Failed to generate image: ${error.message}. Please try a different prompt or try again later.`;
    }
    
    return 'Failed to generate image. Please try a different prompt or try again later.';
  }
}
