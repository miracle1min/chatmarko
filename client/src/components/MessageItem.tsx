import React, { useState, useEffect } from 'react';
import { Message } from '@shared/schema';
import { User, Copy, ThumbsUp, ThumbsDown, Download, Check, Code } from 'lucide-react';
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard';
import { Button } from '@/components/ui/button';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus, vs } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface MessageItemProps {
  message: Message;
}

export default function MessageItem({ message }: MessageItemProps) {
  const { copy } = useCopyToClipboard();
  const isUser = message.role === 'user';
  const [showTypingEffect, setShowTypingEffect] = useState(!isUser);
  const [displayedText, setDisplayedText] = useState('');
  const [loading, setLoading] = useState(true);
  const [copying, setCopying] = useState<string | null>(null);
  const [isDarkTheme, setIsDarkTheme] = useState(true);
  
  // Detect theme changes
  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    setIsDarkTheme(isDark);
    
    // Listen for theme changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          const isDarkNow = document.documentElement.classList.contains('dark');
          setIsDarkTheme(isDarkNow);
        }
      });
    });
    
    observer.observe(document.documentElement, { attributes: true });
    
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    // Check if the message content contains code blocks
    const hasCodeBlock = message.content.includes('```');
    
    // Only apply typing effect to non-user messages with text responseType and no code blocks
    if (!isUser && message.responseType === 'text' && !hasCodeBlock) {
      setShowTypingEffect(true);
      let index = 0;
      // Faster typing speed for larger content
      const typingSpeed = message.content.length > 500 ? 2 : 5;
      const timer = setInterval(() => {
        setDisplayedText(message.content.slice(0, index));
        index += 3; // Increment by 3 characters at a time for faster typing

        if (index > message.content.length) {
          clearInterval(timer);
          setShowTypingEffect(false);
          setDisplayedText(message.content);
          setLoading(false); // Set loading to false after text is displayed
        }
      }, typingSpeed);

      return () => clearInterval(timer);
    } else {
      // Skip typing effect for messages with code blocks
      setShowTypingEffect(false);
      setDisplayedText(message.content);
      setLoading(false); // Set loading to false immediately for other response types
    }
  }, [message, isUser]);

  const handleCopy = () => {
    copy(message.content);
  };
  
  const handleCopyCode = (code: string) => {
    copy(code);
    setCopying('code');
    setTimeout(() => setCopying(null), 2000);
  };

  const handleDownloadImage = (imageSrc: string) => {
    // Create a link element
    const link = document.createElement('a');
    // Set the download attribute with filename
    const filename = imageSrc.split('/').pop() || 'generated-image.png';
    link.download = filename;
    // Set the href to the image source
    link.href = imageSrc;
    // Append to body, click and remove
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const parseMarkdown = (content: string) => {
    // Simple markdown parsing that handles code blocks
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)\n```/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = codeBlockRegex.exec(content)) !== null) {
      // Add text before code block
      if (match.index > lastIndex) {
        parts.push({
          type: 'text',
          content: content.slice(lastIndex, match.index)
        });
      }

      // Add code block
      const language = match[1] || 'javascript';
      const code = match[2];
      parts.push({
        type: 'code',
        language,
        content: code
      });

      lastIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (lastIndex < content.length) {
      parts.push({
        type: 'text',
        content: content.slice(lastIndex)
      });
    }

    return parts;
  };

  const renderContent = () => {
    if (message.responseType === 'image') {
      // Check if content starts with '/'
      const imgSrc = message.content.startsWith('/')
        ? message.content // It's a path to an image file
        : null; // It's a text description

      // If we have an image path, render it
      if (imgSrc) {
        return (
          <div className="mt-2 relative image-container">
            <img
              src={imgSrc}
              alt="Generated image"
              className="w-full rounded-lg shadow-md max-h-[70vh] object-contain"
            />
            <div className="absolute bottom-2 right-2 flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                className="bg-black/40 border-0 backdrop-blur-sm hover:bg-black/60 text-white"
                onClick={() => handleDownloadImage(imgSrc)}
              >
                <Download className="h-4 w-4 mr-1" />
                Download
              </Button>
            </div>
          </div>
        );
      }
    }

    // For standard text messages
    if (showTypingEffect) {
      return (
        <div className="text-base leading-relaxed text-gray-300">
          {displayedText}
          <span className="typing-cursor"></span>
        </div>
      );
    }

    // Parse the markdown and render parts
    const parts = parseMarkdown(message.content);

    return (
      <div className="text-base leading-relaxed">
        {parts.map((part: any, index: number) => {
          if (part.type === 'text') {
            return <p key={index} className="whitespace-pre-wrap mb-4">{part.content}</p>;
          } else if (part.type === 'code') {
            return (
              <div key={index} className="code-block mb-4">
                <div className="code-block-header">
                  <div>
                    <Code className="h-3.5 w-3.5 inline-block mr-2 opacity-70" />
                    <span>{part.language}</span>
                  </div>
                  <button
                    className="text-xs px-2 py-1 rounded hover:bg-opacity-80 transition-all"
                    onClick={() => handleCopyCode(part.content)}
                  >
                    {copying === 'code' ? (
                      <><Check className="h-3 w-3 mr-1" /> Disalin</>
                    ) : (
                      <><Copy className="h-3 w-3 mr-1" /> Salin</>
                    )}
                  </button>
                </div>
                <SyntaxHighlighter
                  style={isDarkTheme ? vscDarkPlus : vs}
                  language={part.language}
                  PreTag="div"
                  wrapLines={true}
                  wrapLongLines={true}
                  showLineNumbers={false}
                  customStyle={{ 
                    margin: 0, 
                    fontSize: '0.9rem',
                    maxWidth: '100%',
                    overflowX: 'auto',
                    padding: '0.75rem 1rem',
                    borderRadius: '0 0 6px 6px',
                    border: 'none',
                    background: isDarkTheme ? '#1e1e1e' : '#f5f5f5'
                  }}
                >
                  {part.content}
                </SyntaxHighlighter>
              </div>
            );
          }
          return null;
        })}
      </div>
    );
  };

  return (
    <div className="mb-6 message-animation">
      <div className="flex items-start">
        {isUser && (
          <div className={`rounded-full h-8 w-8 flex items-center justify-center mr-3 ${isDarkTheme ? 'bg-gray-700 text-gray-300' : 'bg-blue-100 text-blue-600'}`}>
            <User className="h-4 w-4" />
          </div>
        )}

        <div className="flex-1">
          <div className="flex items-center mb-2">
            <div className={`font-medium mr-2 ${isDarkTheme ? '' : 'text-slate-700'}`}>{isUser ? 'Anda' : 'ChatMarko'}</div>
          </div>

          {renderContent()}

          {!isUser && !showTypingEffect && (
            <div className="mt-3 flex space-x-2">
              <Button
                variant="ghost"
                size="icon"
                className={`h-8 w-8 ${
                  isDarkTheme 
                    ? 'text-gray-400 hover:text-white hover:bg-transparent' 
                    : 'text-slate-500 hover:text-blue-600 hover:bg-blue-50'
                }`}
                onClick={handleCopy}
                title="Copy"
              >
                <Copy className="h-4 w-4" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className={`h-8 w-8 ${
                  isDarkTheme 
                    ? 'text-gray-400 hover:text-white hover:bg-transparent' 
                    : 'text-slate-500 hover:text-blue-600 hover:bg-blue-50'
                }`}
                title="Like"
              >
                <ThumbsUp className="h-4 w-4" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className={`h-8 w-8 ${
                  isDarkTheme 
                    ? 'text-gray-400 hover:text-white hover:bg-transparent' 
                    : 'text-slate-500 hover:text-blue-600 hover:bg-blue-50'
                }`}
                title="Dislike"
              >
                <ThumbsDown className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}