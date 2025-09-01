import React from 'react';
import { render, screen } from '@testing-library/react';
import MarkdownMessage from '../MarkdownMessage';

describe('MarkdownMessage', () => {
  test('renders list, bold, inline code and fenced block', () => {
    const md = `* **\`cin >> t;\`** reads an integer\n\n\
\`\`\`c++\nint main() {\n return 0;\n}\n\`\`\``;
    render(<MarkdownMessage content={md} />);
    expect(screen.getByText('cin >> t;', { selector: 'code' })).toBeInTheDocument();
    expect(screen.getByLabelText(/copy code/i)).toBeInTheDocument();
  });

  test('renders links safely', () => {
    const md = `[OpenAI](https://openai.com)`;
    render(<MarkdownMessage content={md} />);
    const link = screen.getByRole('link', { name: 'OpenAI' });
    expect(link).toHaveAttribute('href', 'https://openai.com');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  test('renders tables and task lists', () => {
    const md = `| a | b |\n| --- | --- |\n| 1 | 2 |\n\n- [x] done\n- [ ] todo`;
    render(<MarkdownMessage content={md} />);
    expect(screen.getByText('a')).toBeInTheDocument();
    const boxes = screen.getAllByRole('checkbox');
    expect(boxes[0]).toBeChecked();
    expect(boxes[1]).not.toBeChecked();
  });

  test('strips unsafe html', () => {
    const md = '<img src=x onerror=alert(1)>'; // should not render an image
    render(<MarkdownMessage content={md} />);
    expect(screen.queryByRole('img')).toBeNull();
  });
});

