import axios from 'axios';

interface MistralResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

/**
 * Generates a text completion from Mistral AI using the provided prompt
 * @param prompt The user's text prompt
 * @returns A string containing the AI-generated response
 */
export async function generateChatCompletion(prompt: string): Promise<string> {
  try {
    // Get API key from environment variables
    const apiKey = process.env.MISTRAL_API_KEY;

    // Validate API key
    if (!apiKey) {
      throw new Error('MISTRAL_API_KEY is not defined in environment variables');
    }

    // Make API request using axios
    const response = await axios.post<MistralResponse>(
      'https://api.mistral.ai/v1/chat/completions',
      {
        model: 'mistral-small-latest',
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 1024,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
      }
    );

    // Extract and return the generated text
    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('Error generating chat completion:', error);

    if (axios.isAxiosError(error) && error.response) {
      throw new Error(
        `Mistral API error: ${error.response.status} - ${error.response.data?.error?.message || JSON.stringify(error.response.data)}`
      );
    }

    throw new Error('Failed to generate chat completion');
  }
}
