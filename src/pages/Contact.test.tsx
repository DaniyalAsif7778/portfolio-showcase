import { act, fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import Contact from './Contact';

const { send } = vi.hoisted(() => ({ send: vi.fn() }));
vi.mock('@emailjs/browser', () => ({ default: { send } }));
vi.mock('@/hooks/useSiteSettings', () => ({ useSiteSettings: () => ({ settings: { name: 'Daniyal Asif', about: { email: 'hello@example.com' } } }) }));
vi.mock('@/components/Navbar', () => ({ default: () => <nav>Navigation</nav> }));
vi.mock('@/components/Footer', () => ({ default: () => <footer>Footer</footer> }));
vi.mock('@/components/SEO', () => ({ default: () => null }));
vi.mock('@/components/SectionHeader', () => ({ default: () => <h1>Contact</h1> }));
vi.mock('framer-motion', () => ({ motion: new Proxy({}, { get: (_target, tag) => tag }) }));

describe('Contact page', () => {
  beforeEach(() => send.mockReset());

  it('submits contact details and reports success', async () => {
    send.mockResolvedValue({ status: 200 });
    render(<Contact />);
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Ada' } });
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'ada@example.com' } });
    fireEvent.change(screen.getByLabelText('Message'), { target: { value: 'Hello' } });
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /send message/i }));
      await Promise.resolve();
    });

    expect(await screen.findByText('Message sent successfully!')).toBeInTheDocument();
    expect(send).toHaveBeenCalledWith('service_4pjt1o8', 'template_j070jzr', expect.objectContaining({ from_name: 'Ada', from_email: 'ada@example.com', message: 'Hello', to_name: 'Daniyal Asif' }), 'd7-qXzSLUnT7xVTbY');
  });

  it('reports oversized attachments inline and clears the error for a valid file', () => {
    render(<Contact />);
    const input = screen.getByLabelText(/attachment/i) as HTMLInputElement;
    const oversized = new File(['x'], 'large.pdf', { type: 'application/pdf' });
    Object.defineProperty(oversized, 'size', { value: 5 * 1024 * 1024 + 1 });
    fireEvent.change(input, { target: { files: [oversized] } });
    expect(screen.getByRole('alert')).toHaveTextContent(/less than 5mb/i);

    fireEvent.change(input, { target: { files: [new File(['ok'], 'resume.pdf', { type: 'application/pdf' })] } });
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.getByText('resume.pdf')).toBeInTheDocument();
  });

});
