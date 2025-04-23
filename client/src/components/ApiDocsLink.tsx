import React from 'react';
import { ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export default function ApiDocsLink() {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-9 w-9 p-0"
            onClick={() => window.open('/api-docs', '_blank')}
            aria-label="API Documentation"
          >
            <ExternalLink className="h-5 w-5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>API Documentation</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}