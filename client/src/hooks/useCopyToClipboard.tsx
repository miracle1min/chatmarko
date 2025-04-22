import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

export function useCopyToClipboard() {
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const { toast } = useToast();

  const copy = useCallback(
    async (text: string) => {
      try {
        await navigator.clipboard.writeText(text);
        setCopiedText(text);
        
        toast({
          title: 'Copied to clipboard',
          description: 'Text has been copied to your clipboard.',
          duration: 2000,
        });
        
        return true;
      } catch (error) {
        console.error('Failed to copy text: ', error);
        
        toast({
          title: 'Failed to copy',
          description: 'Could not copy text to clipboard.',
          variant: 'destructive',
        });
        
        setCopiedText(null);
        return false;
      }
    },
    [toast]
  );

  return { copiedText, copy };
}
