import { Mistral } from "@mistralai/mistralai";

export async function generateChatCompletion(prompt: string): Promise<string> {
  try {
    const apiKey = process.env.MISTRAL_API_KEY;
    
    if (!apiKey) {
      throw new Error('MISTRAL_API_KEY is not defined in environment variables');
    }

    const client = new Mistral({
      apiKey: apiKey
    });

    // For non-streaming response
    const chatResponse = await client.chat({
      model: "mistral-small-latest",
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      maxTokens: 1024
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error('Error generating chat completion:', error);
    
    if (error instanceof Error) {
      throw new Error(`Mistral API error: ${error.message}`);
    }
    
    throw new Error('Failed to generate chat completion');
  }
}

// Fungsi streaming opsional yang dapat diimplementasikan di masa depan
export async function streamChatCompletion(prompt: string, onChunk: (chunk: string) => void): Promise<void> {
  try {
    const apiKey = process.env.MISTRAL_API_KEY;
    
    if (!apiKey) {
      throw new Error('MISTRAL_API_KEY is not defined in environment variables');
    }

    const client = new Mistral({
      apiKey: apiKey
    });

    // For streaming response
    const stream = await client.chat.stream({
      model: "mistral-small-latest",
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      maxTokens: 1024
    });

    for await (const chunk of stream) {
      const streamText = chunk.data.choices[0].delta.content;
      if (streamText) {
        onChunk(streamText);
      }
    }
  } catch (error) {
    console.error('Error streaming chat completion:', error);
    
    if (error instanceof Error) {
      throw new Error(`Mistral API streaming error: ${error.message}`);
    }
    
    throw new Error('Failed to stream chat completion');
  }
}
