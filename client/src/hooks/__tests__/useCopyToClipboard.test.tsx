import { renderHook, act } from '@testing-library/react';
import { useCopyToClipboard } from '../useCopyToClipboard';

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn(() => Promise.resolve()),
  },
});

describe('useCopyToClipboard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should copy text to clipboard', async () => {
    const { result } = renderHook(() => useCopyToClipboard());
    
    await act(async () => {
      await result.current.copy('Test text');
    });
    
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('Test text');
    expect(result.current.copiedText).toBe('Test text');
  });
  
  it('should reset copied state after timeout', async () => {
    jest.useFakeTimers();
    
    const { result } = renderHook(() => useCopyToClipboard());
    
    await act(async () => {
      await result.current.copy('Test text');
    });
    
    expect(result.current.copiedText).toBe('Test text');
    
    act(() => {
      jest.advanceTimersByTime(2000); // Default timeout is 2000ms
    });
    
    expect(result.current.copiedText).toBe(null);
    
    jest.useRealTimers();
  });
  
  it('should handle clipboard errors', async () => {
    const clipboardError = new Error('Clipboard error');
    
    // Mock clipboard failure
    (navigator.clipboard.writeText as jest.Mock).mockRejectedValueOnce(clipboardError);
    
    // Spy on console.error
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    const { result } = renderHook(() => useCopyToClipboard());
    
    await act(async () => {
      await result.current.copy('Test text');
    });
    
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('Test text');
    expect(result.current.copiedText).toBe(null);
    expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to copy:', clipboardError);
    
    consoleErrorSpy.mockRestore();
  });
});