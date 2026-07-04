import React from 'react';
import ReactDOM from 'react-dom/client';
import { act } from 'react-dom/test-utils';
import Contact from './Contact';

describe('Contact page', () => {
  it('renders the contact form heading', () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    act(() => {
      ReactDOM.createRoot(container).render(<Contact />);
    });

    expect(container.textContent).toContain('Contact Us');
    container.remove();
  });
});
