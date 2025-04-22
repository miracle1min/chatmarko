import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * Generates a description of an image based on prompt
 * Note: Currently we're falling back to text descriptions due to issues with the image generation
 * 
 * @param prompt The user's image generation prompt
 * @returns A detailed description of the image that will be displayed to the user
 */
export async function generateImage(prompt: string): Promise<string> {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not defined in environment variables');
    }

    // Initialize the Gemini API client
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Use Gemini Pro model for text generation
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    // Create a prompt that instructs Gemini to describe an image in detail
    const enhancedPrompt = `Generate a detailed description of an image based on this prompt: "${prompt}". 
      Focus on visual details like colors, composition, lighting, and subject matter. 
      Start with "Here's an image of" or similar phrasing.`;

    // Generate content
    const result = await model.generateContent(enhancedPrompt);
    const response = await result.response;
    const text = response.text();
    
    if (!text) {
      throw new Error('Empty response from Gemini API');
    }
    
    return text;
  } catch (error) {
    console.error('Error generating image description:', error);
    
    if (error instanceof Error) {
      return `Gagal membuat gambar: ${error.message}. Silakan coba dengan prompt yang berbeda atau coba lagi nanti.`;
    }
    
    return 'Gagal membuat gambar. Silakan coba dengan prompt yang berbeda atau coba lagi nanti.';
  }
}
