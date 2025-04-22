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

export async function generateChatCompletion(prompt: string): Promise<string> {
  try {
    const apiKey = process.env.MISTRAL_API_KEY;
    
    if (!apiKey) {
      throw new Error('MISTRAL_API_KEY is not defined in environment variables');
    }

    const response = await axios.post<MistralResponse>(
      'https://api.mistral.ai/v1/chat/completions',
      {
        model: 'mistral-medium-latest',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1024
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        }
      }
    );

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('Error generating chat completion:', error);
    
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(`Mistral API error: ${error.response.status} - ${error.response.data?.error?.message || JSON.stringify(error.response.data)}`);
    }
    
    throw new Error('Failed to generate chat completion');
  }
}
