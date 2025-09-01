import React, { useState } from 'react';
import MarkdownMessage from '../components/MarkdownMessage';

const sample = `# Markdown demo\n* **\`cin >> t;\`** reads an integer\n\n\`\`\`c++\nint main() { return 0; }\n\`\`\`\n\n- [x] done\n- [ ] todo\n\n[OpenAI](https://openai.com)`;

export default function MarkdownTestPage() {
  const [text, setText] = useState(sample);
  return (
    <div style={{ padding: '1rem' }}>
      <textarea
        style={{ width: '100%', height: '150px', marginBottom: '1rem' }}
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <MarkdownMessage content={text} />
    </div>
  );
}

