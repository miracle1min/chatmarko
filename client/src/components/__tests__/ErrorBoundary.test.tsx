import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ErrorBoundary from '../ErrorBoundary';

// Component that will throw an error when rendered
const ErrorComponent = () => {
  throw new Error('Test error');
  return <div>This should not render</div>;
};

// Mocking console.error to prevent it from cluttering test output
const originalConsoleError = console.error;
beforeAll(() => {
  console.error = jest.fn();
});

afterAll(() => {
  console.error = originalConsoleError;
});

describe('ErrorBoundary', () => {
  it('renders children when no error occurs', () => {
    render(
      <ErrorBoundary>
        <div>Child component</div>
      </ErrorBoundary>
    );
    
    expect(screen.getByText('Child component')).toBeInTheDocument();
  });
  
  it('renders fallback UI when an error occurs', () => {
    render(
      <ErrorBoundary>
        <ErrorComponent />
      </ErrorBoundary>
    );
    
    expect(screen.getByText(/Terjadi kesalahan pada aplikasi/)).toBeInTheDocument();
    expect(screen.getByText(/Test error/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Coba Lagi/i })).toBeInTheDocument();
  });
  
  it('resets error state when "Coba Lagi" button is clicked', async () => {
    const user = userEvent.setup();
    
    // Let's create a component that throws on first render but works on subsequent renders
    let shouldThrow = true;
    const MaybeErrorComponent = () => {
      if (shouldThrow) {
        shouldThrow = false;
        throw new Error('Test error');
      }
      return <div>Recovered from error</div>;
    };
    
    render(
      <ErrorBoundary>
        <MaybeErrorComponent />
      </ErrorBoundary>
    );
    
    // Verify error UI is shown
    expect(screen.getByText(/Terjadi kesalahan pada aplikasi/)).toBeInTheDocument();
    
    // Click the reset button
    await user.click(screen.getByRole('button', { name: /Coba Lagi/i }));
    
    // Now the component should render without throwing
    expect(screen.getByText('Recovered from error')).toBeInTheDocument();
  });
  
  it('renders custom fallback UI when provided', () => {
    render(
      <ErrorBoundary fallback={<div>Custom error UI</div>}>
        <ErrorComponent />
      </ErrorBoundary>
    );
    
    expect(screen.getByText('Custom error UI')).toBeInTheDocument();
  });
});