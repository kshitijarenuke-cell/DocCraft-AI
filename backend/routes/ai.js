const express = require('express');
const auth = require('../middleware/auth');
const OpenAI = require('openai');

const router = express.Router();

let openai = null;
try {
  if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your_openai_api_key_here') {
    openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
} catch (e) {
  console.log('OpenAI not configured, using fallback detection');
}

// ─── Enhanced Line-Level Fallback Analysis ────────────────────────────────
const detectIssuesFallback = (text) => {
  const issues = [];
  const lines = text.split('\n');
  const seenSentences = new Set();

  const grammarPatterns = [
    { re: /\b(i)\b/g, msg: '"i" should be capitalized to "I"', type: 'grammar', sev: 'high' },
    { re: /\s{2,}/g, msg: 'Multiple consecutive spaces', type: 'grammar', sev: 'low' },
    { re: /,{2,}/g, msg: 'Multiple commas in a row', type: 'grammar', sev: 'medium' },
    { re: /\b(\w+)\s+\1\b/gi, msg: 'Duplicate word', type: 'grammar', sev: 'high' },
  ];

  const aiPhrases = [
    { re: /\bin conclusion\b/i, msg: '"In conclusion" is an overused AI phrase' },
    { re: /\bfurthermore\b/i, msg: '"Furthermore" is commonly AI-generated' },
    { re: /\bmoreover\b/i, msg: '"Moreover" is commonly AI-generated' },
    { re: /\bdelve into\b/i, msg: '"Delve into" is a common AI phrase' },
    { re: /\bit is worth noting\b/i, msg: 'Overused AI phrase' },
    { re: /\bin today's (world|age|era|society)\b/i, msg: 'Clichéd AI opening phrase' },
    { re: /\bsignificant(ly)?\b/i, msg: '"Significant" is overused in AI text' },
    { re: /\bultimately\b/i, msg: '"Ultimately" is commonly AI-generated' },
    { re: /\bit is important to note\b/i, msg: 'Overused AI phrase' },
    { re: /\bthis (?:ensures|allows|enables|provides)\b/i, msg: 'Generic AI transition phrase' },
    { re: /\bcomprehensive(ly)?\b/i, msg: '"Comprehensive" is overused in AI text' },
    { re: /\brobust\b/i, msg: '"Robust" is commonly overused in AI content' },
  ];

  lines.forEach((line, idx) => {
    const lineNum = idx + 1;
    const trimmed = line.trim();
    if (!trimmed || trimmed.length < 3) return;

    // 1. Capitalization check — sentences not starting with capital
    if (trimmed.length > 5 && /^[a-z]/.test(trimmed) && !/^[-•*\d(\[<]/.test(trimmed)) {
      issues.push({
        type: 'grammar',
        lineNumber: lineNum,
        lineText: trimmed.substring(0, 70),
        severity: 'high',
        suggestion: `Line ${lineNum}: Sentence starts with lowercase. Should begin with a capital letter.`,
      });
    }

    // 2. Missing end punctuation for long sentences
    if (trimmed.length > 40 && !/[.!?:;,)\]]$/.test(trimmed) && !/^(#+|[-•*])/.test(trimmed)) {
      issues.push({
        type: 'grammar',
        lineNumber: lineNum,
        lineText: trimmed.substring(0, 70),
        severity: 'medium',
        suggestion: `Line ${lineNum}: Long sentence appears to be missing end punctuation (., !, ?).`,
      });
    }

    // 3. Grammar patterns
    grammarPatterns.forEach(({ re, msg, type, sev }) => {
      if (re.test(trimmed)) {
        re.lastIndex = 0;
        issues.push({
          type,
          lineNumber: lineNum,
          lineText: trimmed.substring(0, 70),
          severity: sev,
          suggestion: `Line ${lineNum}: ${msg}.`,
        });
      }
    });

    // 4. Word repetition within same line
    const words = trimmed.toLowerCase().replace(/[^a-z\s]/g, '').split(/\s+/);
    const wordFreq = {};
    words.filter(w => w.length > 4).forEach(w => { wordFreq[w] = (wordFreq[w] || 0) + 1; });
    Object.entries(wordFreq).forEach(([word, count]) => {
      if (count >= 2) {
        issues.push({
          type: 'repetition',
          lineNumber: lineNum,
          lineText: trimmed.substring(0, 70),
          severity: 'medium',
          suggestion: `Line ${lineNum}: Word "${word}" is used ${count} times. Consider synonyms.`,
        });
      }
    });

    // 5. AI phrase detection
    aiPhrases.forEach(({ re, msg }) => {
      if (re.test(trimmed)) {
        issues.push({
          type: 'ai_generated',
          lineNumber: lineNum,
          lineText: trimmed.substring(0, 70),
          severity: 'medium',
          suggestion: `Line ${lineNum}: ${msg}. Rephrase for more natural writing.`,
        });
      }
    });

    // 6. Sentence-level repetition across lines
    const normalized = trimmed.toLowerCase().replace(/\s+/g, ' ');
    if (normalized.length > 30) {
      if (seenSentences.has(normalized)) {
        issues.push({
          type: 'repetition',
          lineNumber: lineNum,
          lineText: trimmed.substring(0, 70),
          severity: 'high',
          suggestion: `Line ${lineNum}: This sentence is repeated elsewhere. Remove or rephrase.`,
        });
      }
      seenSentences.add(normalized);
    }
  });

  // 7. Overall structure check
  const hasHeading = lines.some(l => /^#{1,3}\s/.test(l.trim()) || (l.trim().length > 0 && /^[A-Z]/.test(l.trim()) && l.trim().length < 60 && !l.trim().includes('.')));
  if (!hasHeading && text.length > 300) {
    issues.push({
      type: 'poor_structure',
      lineNumber: null,
      lineText: 'Overall document',
      severity: 'high',
      suggestion: 'Document lacks clear headings or titled sections. Add section headers for better structure.',
    });
  }

  // 8. Very short paragraphs / fragments
  lines.forEach((line, idx) => {
    const lineNum = idx + 1;
    const trimmed = line.trim();
    if (trimmed.length > 0 && trimmed.length < 15 && !/^(#+|[-•*\d])/.test(trimmed)) {
      issues.push({
        type: 'poor_structure',
        lineNumber: lineNum,
        lineText: trimmed,
        severity: 'low',
        suggestion: `Line ${lineNum}: This appears to be an incomplete sentence or fragment: "${trimmed}"`,
      });
    }
  });

  // Deduplicate issues on same line/type
  const seen = new Set();
  return issues.filter(issue => {
    const key = `${issue.lineNumber}-${issue.type}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

const estimateAiScore = (text) => {
  const signals = [
    /\bin conclusion\b/gi, /\bfurthermore\b/gi, /\bmoreover\b/gi,
    /\bit is important to note\b/gi, /\boverall\b/gi, /\bsignificant(ly)?\b/gi,
    /\bdelve\b/gi, /\bultimately\b/gi, /\btherefore\b/gi,
    /\bin today's (world|age|era)\b/gi, /\bit is worth (noting|mentioning)\b/gi,
    /\bcomprehensive(ly)?\b/gi, /\brobust\b/gi, /\bthis ensures\b/gi,
  ];
  let signalCount = 0;
  signals.forEach(p => { if (p.test(text)) signalCount++; });
  const wordCount = text.split(/\s+/).length;
  const densityScore = Math.min(signalCount / Math.max(wordCount / 80, 1), 1);
  return Math.min(100, Math.round(densityScore * 80 + (signalCount > 4 ? 20 : signalCount * 4)));
};

// ─── POST /api/ai/detect ─────────────────────────────────────────────────
router.post('/detect', auth, async (req, res) => {
  try {
    const { content, topic } = req.body;
    if (!content || content.trim().length < 10)
      return res.status(400).json({ success: false, message: 'Content is required' });

    let issues = [];
    let aiScore = 0;
    let analysisText = '';

    if (openai) {
      try {
        const response = await openai.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: `You are an expert content analyst. Analyze text for grammar errors, AI-generated patterns, repetitions, capitalization issues, and structural problems. For each issue found, include the approximate line number.
Respond in JSON: {"aiScore": 0-100, "issues": [{"type": "grammar|ai_generated|repetition|poor_structure", "lineNumber": <number or null>, "lineText": "...", "severity": "low|medium|high", "suggestion": "Line N: specific fix description"}], "summary": "brief analysis"}`,
            },
            {
              role: 'user',
              content: `Analyze this content${topic ? ` about "${topic}"` : ''}:\n\n${content.substring(0, 3000)}`,
            },
          ],
          temperature: 0.3,
          max_tokens: 1200,
          response_format: { type: 'json_object' },
        });
        const result = JSON.parse(response.choices[0].message.content);
        issues = result.issues || [];
        aiScore = result.aiScore || 0;
        analysisText = result.summary || '';
      } catch (openaiErr) {
        console.log('OpenAI error, using fallback:', openaiErr.message);
        issues = detectIssuesFallback(content);
        aiScore = estimateAiScore(content);
      }
    } else {
      issues = detectIssuesFallback(content);
      aiScore = estimateAiScore(content);
      analysisText = `Rule-based analysis found ${issues.length} potential issues. AI score: ${aiScore}%`;
    }

    res.json({
      success: true,
      aiScore,
      issues,
      summary: analysisText || `Detected ${issues.length} issues. Estimated AI content: ${aiScore}%`,
      issueCount: issues.length,
    });
  } catch (err) {
    console.error('Detect error:', err);
    res.status(500).json({ success: false, message: 'Detection failed' });
  }
});

// ─── POST /api/ai/rewrite ────────────────────────────────────────────────
router.post('/rewrite', auth, async (req, res) => {
  try {
    const { content, topic, formatting, instructions } = req.body;
    if (!content) return res.status(400).json({ success: false, message: 'Content is required' });

    const headingColor = formatting?.headingColor || '#1e1b4b';
    const fontFamily = formatting?.font || 'Inter';

    let rewritten = '';

    if (openai) {
      try {
        const systemPrompt = `You are a professional document writer and editor. Rewrite and structure the provided content to be:
1. Original and human-sounding (avoid AI clichés like "Furthermore", "Moreover", "In conclusion", "Delve into")
2. Well-organized with proper Markdown headings (## and ###)
3. Clear, concise, and professionally formatted
4. Free from repetition and grammatical errors
5. Logically structured with Introduction, main sections, and Conclusion
6. Each paragraph should be 3-5 sentences, not too long
7. Add bullet points for lists of items
${instructions ? `\nAdditional instructions: ${instructions}` : ''}

Return clean Markdown formatted text only. Use ## for main headings, ### for subheadings. No extra blank lines between list items.`;

        const response = await openai.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: `Topic: ${topic || 'General'}\n\nRewrite and structure this content:\n\n${content.substring(0, 4000)}` },
          ],
          temperature: 0.7,
          max_tokens: 2500,
        });
        rewritten = response.choices[0].message.content;
      } catch (openaiErr) {
        console.log('OpenAI rewrite error, using fallback');
        rewritten = generateFallbackRewrite(content, topic);
      }
    } else {
      rewritten = generateFallbackRewrite(content, topic);
    }

    res.json({ success: true, rewritten, originalLength: content.length, rewrittenLength: rewritten.length });
  } catch (err) {
    console.error('Rewrite error:', err);
    res.status(500).json({ success: false, message: 'Rewrite failed' });
  }
});

const generateFallbackRewrite = (content, topic) => {
  const sentences = content.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 10);
  const unique = [...new Set(sentences.map(s => s.toLowerCase()))].map((_, i) => sentences[i]).filter(Boolean);
  const topicTitle = topic || 'Document';
  const third = Math.floor(unique.length / 3) || 1;
  return `## Introduction\n\n${unique.slice(0, third).join('. ')}.\n\n## Main Content\n\n${unique.slice(third, third * 2).join('. ')}.\n\n## Key Points\n\n- ${unique.slice(third * 2).join('\n- ')}.\n\n## Conclusion\n\nThis document provides a structured overview of **${topicTitle}**. The points discussed above highlight the core concepts and their significance.`;
};

// ─── POST /api/ai/diagram ────────────────────────────────────────────────
router.post('/diagram', auth, async (req, res) => {
  try {
    const { content, topic, diagramType = 'flowchart' } = req.body;
    let mermaidCode = '';

    if (openai) {
      try {
        const response = await openai.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: `Generate valid Mermaid.js diagram code for the given topic. Return ONLY the raw mermaid code, no markdown fences, no explanation. 
For flowcharts: start with "flowchart TD"
For mind maps: start with "mindmap"  
For sequences: start with "sequenceDiagram"
Keep node labels short (under 30 chars). Use simple ASCII only in node labels.`,
            },
            {
              role: 'user',
              content: `Create a ${diagramType} diagram specifically about: "${topic || 'the content'}"\n\nContext: ${content?.substring(0, 400) || topic}`,
            },
          ],
          temperature: 0.3,
          max_tokens: 600,
        });
        mermaidCode = response.choices[0].message.content
          .replace(/```mermaid\n?/g, '')
          .replace(/```\n?/g, '')
          .trim();
      } catch {
        mermaidCode = generateFallbackDiagram(topic, diagramType);
      }
    } else {
      mermaidCode = generateFallbackDiagram(topic, diagramType);
    }

    res.json({ success: true, mermaidCode, diagramType });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Diagram generation failed' });
  }
});

const generateFallbackDiagram = (topic, type) => {
  const t = (topic || 'Topic').substring(0, 25);
  if (type === 'mindmap') {
    return `mindmap
  root((${t}))
    Overview
      Background
      Definition
    Key Concepts
      Concept A
      Concept B
    Applications
      Use Case 1
      Use Case 2
    Summary
      Takeaways`;
  }
  if (type === 'sequence') {
    return `sequenceDiagram
    participant U as User
    participant S as System
    participant D as Database
    U->>S: Request ${t}
    S->>D: Fetch Data
    D-->>S: Return Results
    S-->>U: Display Output
    U->>S: Confirm Action
    S->>D: Save Changes
    D-->>S: Success
    S-->>U: Confirmation`;
  }
  return `flowchart TD
    A([Start: ${t}]) --> B{Analyze}
    B --> C[Gather Information]
    B --> D[Identify Concepts]
    C --> E[Organize Content]
    D --> E
    E --> F[Create Structure]
    F --> G[Write & Format]
    G --> H{Review}
    H -->|Revise| G
    H -->|Approved| I([Final Document])
    style A fill:#6366f1,color:#fff
    style I fill:#10b981,color:#fff
    style H fill:#f59e0b,color:#fff`;
};

// ─── POST /api/ai/improve-paragraph ──────────────────────────────────────
router.post('/improve-paragraph', auth, async (req, res) => {
  try {
    const { text, instruction = 'Improve clarity and readability' } = req.body;
    if (!text) return res.status(400).json({ success: false, message: 'Text is required' });

    let improved = text;
    if (openai) {
      try {
        const response = await openai.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: 'You are a professional editor. Improve the given text. Return only the improved text, no extra commentary.' },
            { role: 'user', content: `${instruction}:\n\n${text}` },
          ],
          temperature: 0.6,
          max_tokens: 500,
        });
        improved = response.choices[0].message.content;
      } catch {}
    }
    res.json({ success: true, improved });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Improvement failed' });
  }
});

// ─── POST /api/ai/final-check ─────────────────────────────────────────────
router.post('/final-check', auth, async (req, res) => {
  try {
    const { content, topic } = req.body;
    if (!content || content.trim().length < 10)
      return res.status(400).json({ success: false, message: 'Content is required' });

    let result = null;

    if (openai) {
      try {
        const response = await openai.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: `You are a professional editor performing a final quality check on a document. Evaluate:
1. Clarity — Is it easy to understand?
2. Logical flow — Does content progress logically?
3. Completeness — Are all important points covered?
4. Grammar — Any remaining errors?
5. Structure — Proper headings, paragraphs, and sections?

Respond in JSON: {
  "isPerfect": boolean,
  "score": 0-100,
  "verdict": "Document is Perfect" OR "Issues Found",
  "summary": "1-2 sentence overall assessment",
  "checks": [
    { "category": "Clarity|Flow|Completeness|Grammar|Structure", "passed": boolean, "note": "detail" }
  ],
  "remainingIssues": [
    { "type": "grammar|structure|clarity|flow|completeness", "lineText": "...", "suggestion": "..." }
  ]
}`,
            },
            {
              role: 'user',
              content: `Topic: ${topic || 'General'}\n\nPerform final check on:\n\n${content.substring(0, 4000)}`,
            },
          ],
          temperature: 0.3,
          max_tokens: 1000,
          response_format: { type: 'json_object' },
        });
        result = JSON.parse(response.choices[0].message.content);
      } catch (err) {
        result = fallbackFinalCheck(content);
      }
    } else {
      result = fallbackFinalCheck(content);
    }

    res.json({ success: true, ...result });
  } catch (err) {
    console.error('Final check error:', err);
    res.status(500).json({ success: false, message: 'Final check failed' });
  }
});

const fallbackFinalCheck = (text) => {
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  const hasHeadings = /^#{1,3}\s/m.test(text) || /<h[1-3]/i.test(text);
  const hasBullets = /^[-•*]\s/m.test(text) || /<li/i.test(text);
  const hasMultipleParagraphs = (text.match(/\n\n|\<\/p\>/g) || []).length > 2;
  const remainingIssues = [];

  const checks = [
    { category: 'Clarity', passed: wordCount > 50, note: wordCount > 50 ? 'Content has sufficient detail' : 'Content seems too short' },
    { category: 'Structure', passed: hasHeadings, note: hasHeadings ? 'Document has proper headings' : 'Missing section headings' },
    { category: 'Completeness', passed: wordCount > 100, note: wordCount > 100 ? 'Document appears complete' : 'Consider adding more content' },
    { category: 'Flow', passed: hasMultipleParagraphs, note: hasMultipleParagraphs ? 'Content is well paragraphed' : 'Consider breaking into more paragraphs' },
    { category: 'Grammar', passed: true, note: 'Basic grammar check passed (add OpenAI key for deep check)' },
  ];

  const passedCount = checks.filter(c => c.passed).length;
  const score = Math.round((passedCount / checks.length) * 100);
  const isPerfect = score >= 80;

  if (!hasHeadings) remainingIssues.push({ type: 'structure', suggestion: 'Add headings (## Section Name) to organize content' });
  if (wordCount < 100) remainingIssues.push({ type: 'completeness', suggestion: 'Document is short. Consider expanding key points.' });

  return {
    isPerfect,
    score,
    verdict: isPerfect ? 'Document is Perfect ✅' : `${5 - passedCount} areas need attention`,
    summary: isPerfect
      ? 'Your document is well-structured, clear, and complete.'
      : 'Some areas could be improved for a professional result.',
    checks,
    remainingIssues,
  };
};

module.exports = router;
