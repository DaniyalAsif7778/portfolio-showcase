import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import ProjectVideoPreview from './ProjectVideoPreview';

describe('ProjectVideoPreview', () => {
  it('loads a YouTube player only after the visitor chooses to watch', () => {
    render(<div className="group"><ProjectVideoPreview src="https://youtu.be/09hz6zKQJ60" title="Demo" /></div>);
    expect(screen.queryByTitle('Demo project video')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Watch Demo project video' }));
    expect(screen.getByTitle('Demo project video')).toHaveAttribute('src', expect.stringContaining('09hz6zKQJ60'));
  });

  it('shows an inline video player for direct video URLs', () => {
    render(<div className="group"><ProjectVideoPreview src="https://cdn.example.com/demo.mp4" title="Demo" /></div>);
    fireEvent.click(screen.getByRole('button', { name: 'Watch Demo project video' }));
    expect(screen.getByLabelText('Demo project video')).toHaveAttribute('src', 'https://cdn.example.com/demo.mp4');
  });
});
