import { render, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import SEO from './SEO';

describe('SEO', () => {
  afterEach(() => {
    document.head.innerHTML = '';
    document.title = '';
  });

  it('sets canonical, share metadata, robots, and structured data for the current page', async () => {
    render(<SEO title="Project Alpha" description="A useful project" path="/projects/alpha" noIndex structuredData={{ '@type': 'CreativeWork', name: 'Alpha' }} />);

    await waitFor(() => expect(document.title).toBe('Project Alpha | Daniyal Asif'));
    expect(document.head.querySelector('link[rel="canonical"]')).toHaveProperty('href', 'https://daniyal-porfolio-three.vercel.app/projects/alpha');
    expect(document.head.querySelector('meta[name="description"]')).toHaveProperty('content', 'A useful project');
    expect(document.head.querySelector('meta[name="robots"]')).toHaveProperty('content', 'noindex, nofollow');
    expect(JSON.parse(document.head.querySelector('#portfolio-page-jsonld')?.textContent || '{}')['@graph']).toContainEqual(expect.objectContaining({ '@type': 'CreativeWork', name: 'Alpha' }));
  });

  it('updates existing tags instead of adding duplicates', async () => {
    const { rerender } = render(<SEO title="First" description="First description" path="/first" />);
    rerender(<SEO title="Second" description="Second description" path="/second" />);

    await waitFor(() => expect(document.title).toBe('Second | Daniyal Asif'));
    expect(document.head.querySelectorAll('meta[name="description"]')).toHaveLength(1);
    expect(document.head.querySelectorAll('link[rel="canonical"]')).toHaveLength(1);
    expect(document.head.querySelector('meta[name="description"]')).toHaveProperty('content', 'Second description');
  });
});
