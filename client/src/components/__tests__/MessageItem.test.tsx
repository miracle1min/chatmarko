import { render, screen } from '@testing-library/react';
import MessageItem from '../MessageItem';
import { Message } from '../../types';

describe('MessageItem', () => {
  const userMessage: Message = {
    id: 1,
    content: 'Hello, how are you?',
    role: 'user',
    model: 'mistral',
    createdAt: new Date().toISOString(),
    responseType: 'text'
  };

  const assistantTextMessage: Message = {
    id: 2,
    content: 'I am doing well, thank you for asking!',
    role: 'assistant',
    model: 'mistral',
    createdAt: new Date().toISOString(),
    responseType: 'text'
  };

  const assistantImageMessage: Message = {
    id: 3,
    content: 'https://example.com/image.jpg',
    role: 'assistant',
    model: 'gemini',
    createdAt: new Date().toISOString(),
    responseType: 'image'
  };

  it('renders user message correctly', () => {
    render(<MessageItem message={userMessage} />);
    
    expect(screen.getByText('Hello, how are you?')).toBeInTheDocument();
    // Check for user avatar or indicator
    const userElements = screen.getAllByText(/You/i);
    expect(userElements.length).toBeGreaterThan(0);
  });

  it('renders assistant text message correctly', () => {
    render(<MessageItem message={assistantTextMessage} />);
    
    expect(screen.getByText('I am doing well, thank you for asking!')).toBeInTheDocument();
    // Check for model name
    expect(screen.getByText(/mistral/i, { exact: false })).toBeInTheDocument();
  });

  it('renders assistant image message correctly', () => {
    render(<MessageItem message={assistantImageMessage} />);
    
    // Check for image element
    const imageElement = screen.getByRole('img');
    expect(imageElement).toBeInTheDocument();
    expect(imageElement).toHaveAttribute('src', 'https://example.com/image.jpg');
    
    // Check for model name
    expect(screen.getByText(/gemini/i, { exact: false })).toBeInTheDocument();
  });
});