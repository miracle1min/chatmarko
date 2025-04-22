import axios from 'axios';

interface GeminiResponse {
  candidates: {
    content: {
      parts: {
        text: string;
      }[];
    };
  }[];
}

export async function generateImage(prompt: string): Promise<string> {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not defined in environment variables');
    }

    // Using Gemini Pro Vision model for image generation
    const response = await axios.post<GeminiResponse>(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-vision:generateContent?key=${apiKey}`,
      {
        contents: [
          {
            parts: [
              {
                text: `Generate an image based on this description: ${prompt}`
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.8,
          maxOutputTokens: 2048
        }
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    // In a real implementation, Gemini might return an actual image URL
    // For now, we'll use a placeholder assuming the response contains image data
    // In production, you would handle the actual image data properly
    if (response.data.candidates && response.data.candidates.length > 0) {
      // In a real implementation, extract the actual image URL from the response
      // This is a simplified version that assumes the text response contains image URL info
      const responseText = response.data.candidates[0].content.parts[0].text;
      
      // For now, return the text response which would ideally contain image URL info
      return responseText;
    }
    
    throw new Error('No image generated');
  } catch (error) {
    console.error('Error generating image:', error);
    
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(`Gemini API error: ${error.response.status} - ${error.response.data?.error?.message || JSON.stringify(error.response.data)}`);
    }
    
    throw new Error('Failed to generate image');
  }
}
