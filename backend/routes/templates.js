const express = require('express');
const mongoose = require('mongoose');
const auth = require('../middleware/auth');
const Template = require('../models/Template');

const router = express.Router();

const requireDb = (res) => {
  if (mongoose.connection.readyState !== 1) {
    res.status(503).json({ success: false, message: 'Database not connected.' });
    return false;
  }
  return true;
};

// Built-in templates seeded on first request
const BUILT_IN_TEMPLATES = [
  {
    name: 'Academic Assignment',
    description: 'Standard academic paper with introduction, methodology, and conclusion',
    category: 'academic',
    icon: '📚',
    isBuiltIn: true,
    tags: ['academic', 'assignment', 'paper'],
    content: `## Assignment Title

**Student Name:** [Your Name]
**Course:** [Course Name]
**Date:** ${new Date().toLocaleDateString()}

---

## Introduction

Begin your assignment with a clear introduction that states the purpose and scope of your work. Provide background context that the reader needs to understand your discussion.

## Literature Review

Summarize relevant existing research and scholarship related to your topic. Reference key sources and highlight the gap your work addresses.

## Methodology

Describe the approach or methods you used in your research or analysis. Be specific about tools, frameworks, or techniques applied.

## Analysis & Findings

Present your findings with supporting evidence. Use structured arguments and logical flow.

- Finding 1: [Detail your first key finding]
- Finding 2: [Detail your second key finding]
- Finding 3: [Detail your third key finding]

## Discussion

Interpret your findings in the context of your research questions. Compare with existing literature and explain implications.

## Conclusion

Summarize the main points of your assignment and restate the significance of your findings.

## References

1. Author, A. (Year). *Title of work*. Publisher.
2. Author, B. (Year). *Title of work*. Publisher.`,
  },
  {
    name: 'Professional Resume',
    description: 'Clean, ATS-friendly resume template',
    category: 'personal',
    icon: '👤',
    isBuiltIn: true,
    tags: ['resume', 'cv', 'job'],
    content: `# [Your Full Name]

📧 email@example.com | 📞 +1 (555) 000-0000 | 🌐 linkedin.com/in/yourname | 📍 City, Country

---

## Professional Summary

Results-driven professional with [X] years of experience in [industry/field]. Proven track record of [key achievement]. Seeking to leverage expertise in [target role] at [target company type].

## Work Experience

### [Job Title] — [Company Name]
*[Month Year] – Present | [City, Country]*

- Led [specific project/initiative] resulting in [measurable outcome]
- Managed [team size/budget/scope] to deliver [result]
- Developed [system/process/tool] that improved [metric] by [percentage]

### [Previous Job Title] — [Previous Company]
*[Month Year] – [Month Year] | [City, Country]*

- Achieved [specific accomplishment]
- Collaborated with cross-functional teams to [outcome]

## Education

### [Degree] in [Field of Study]
**[University Name]** — [Graduation Year]
GPA: [X.X] | Honors: [if applicable]

## Skills

**Technical:** [Skill 1], [Skill 2], [Skill 3], [Skill 4]
**Tools:** [Tool 1], [Tool 2], [Tool 3]
**Languages:** [Language 1] (Native), [Language 2] (Proficient)

## Certifications

- [Certification Name] — [Issuing Organization], [Year]
- [Certification Name] — [Issuing Organization], [Year]`,
  },
  {
    name: 'Research Paper',
    description: 'Structured research paper with abstract and citations',
    category: 'academic',
    icon: '🔬',
    isBuiltIn: true,
    tags: ['research', 'paper', 'academic'],
    content: `## [Research Paper Title]

**Authors:** [Author 1], [Author 2]
**Institution:** [University/Organization]
**Journal:** [Target Journal]
**Keywords:** keyword1, keyword2, keyword3

---

## Abstract

This paper investigates [research problem]. Through [methodology], we demonstrate [key findings]. Our results indicate [conclusions], with implications for [field/application]. This research contributes [specific contribution] to the existing body of knowledge.

## 1. Introduction

### 1.1 Background

[Provide context for your research. Explain the domain and why it matters.]

### 1.2 Problem Statement

[Clearly define the problem or gap in knowledge that your research addresses.]

### 1.3 Research Objectives

This study aims to:
1. [Objective 1]
2. [Objective 2]
3. [Objective 3]

## 2. Literature Review

[Review existing research systematically. Group by theme or chronology.]

## 3. Methodology

### 3.1 Research Design

[Describe your overall approach — qualitative, quantitative, or mixed methods.]

### 3.2 Data Collection

[Explain how data was gathered — surveys, experiments, observations, etc.]

### 3.3 Analysis Methods

[Describe statistical or analytical techniques used.]

## 4. Results

[Present findings objectively. Use tables and figures where appropriate.]

## 5. Discussion

[Interpret results in context of your research questions and existing literature.]

## 6. Conclusion

[Summarize contributions and suggest future research directions.]

## References

[1] Author, A. A., & Author, B. B. (Year). Title of article. *Journal Name*, *Volume*(Issue), pages. DOI`,
  },
  {
    name: 'Project Report',
    description: 'Professional project report for teams and stakeholders',
    category: 'business',
    icon: '📊',
    isBuiltIn: true,
    tags: ['project', 'report', 'business'],
    content: `## Project Report: [Project Name]

**Project Manager:** [Name]
**Team:** [Member 1], [Member 2], [Member 3]
**Period:** [Start Date] – [End Date]
**Status:** [On Track / At Risk / Completed]

---

## Executive Summary

[Provide a concise 3-5 sentence overview of the project, its goals, current status, and key highlights for stakeholders.]

## Project Objectives

1. **Primary Goal:** [Main deliverable or outcome]
2. **Secondary Goals:**
   - [Goal 2]
   - [Goal 3]

## Progress Overview

| Milestone | Target Date | Status | Completion |
|-----------|-------------|--------|------------|
| Phase 1   | [Date]      | ✅ Done | 100%       |
| Phase 2   | [Date]      | 🔄 In Progress | 65% |
| Phase 3   | [Date]      | ⏳ Pending | 0%    |

## Key Achievements

- ✅ [Achievement 1 with measurable outcome]
- ✅ [Achievement 2 with measurable outcome]
- 🔄 [In-progress item]

## Risks & Issues

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| [Risk 1] | High | Medium | [Strategy] |
| [Risk 2] | Medium | Low | [Strategy] |

## Budget Summary

- **Allocated:** $[Amount]
- **Spent:** $[Amount]
- **Remaining:** $[Amount]

## Next Steps

1. [Action item with owner and due date]
2. [Action item with owner and due date]
3. [Action item with owner and due date]`,
  },
  {
    name: 'Business Proposal',
    description: 'Compelling business proposal template',
    category: 'business',
    icon: '💼',
    isBuiltIn: true,
    tags: ['proposal', 'business', 'pitch'],
    content: `## Business Proposal

**Prepared by:** [Your Company Name]
**Prepared for:** [Client/Stakeholder Name]
**Date:** ${new Date().toLocaleDateString()}
**Reference:** PROP-[Year]-[Number]

---

## Executive Summary

[Provide a compelling 2-3 paragraph overview that captures attention. State the problem, your solution, and the expected value delivered. Make this section strong enough to stand alone.]

## Problem Statement

[Client/market] faces [specific challenge] which results in [quantified impact — cost, lost time, missed opportunity]. Current solutions fall short because [specific gap].

## Proposed Solution

We propose [solution name/approach] that addresses these challenges by:

- **[Feature 1]:** [Benefit and measurable outcome]
- **[Feature 2]:** [Benefit and measurable outcome]
- **[Feature 3]:** [Benefit and measurable outcome]

## Scope of Work

### Phase 1 — [Phase Name] ([Timeline])
[Description of deliverables]

### Phase 2 — [Phase Name] ([Timeline])
[Description of deliverables]

### Phase 3 — [Phase Name] ([Timeline])
[Description of deliverables]

## Investment

| Service | Cost |
|---------|------|
| [Service 1] | $[Amount] |
| [Service 2] | $[Amount] |
| **Total** | **$[Total]** |

## Why Choose Us

- [Differentiator 1 with evidence]
- [Differentiator 2 with evidence]
- [Relevant experience or credential]

## Terms & Next Steps

This proposal is valid for 30 days. To proceed, [specific next action]. We are available to discuss on [date/time preference].`,
  },
  {
    name: 'Meeting Notes',
    description: 'Professional meeting minutes and action items',
    category: 'business',
    icon: '📝',
    isBuiltIn: true,
    tags: ['meeting', 'notes', 'minutes'],
    content: `## Meeting Notes

**Meeting:** [Meeting Title]
**Date & Time:** ${new Date().toLocaleDateString()} at [Time]
**Location:** [Room / Video Call Link]
**Facilitator:** [Name]
**Note Taker:** [Name]

---

## Attendees

| Name | Role | Present |
|------|------|---------|
| [Name] | [Role] | ✅ |
| [Name] | [Role] | ✅ |
| [Name] | [Role] | ❌ Absent |

## Agenda

1. [Agenda Item 1]
2. [Agenda Item 2]
3. [Agenda Item 3]
4. Any Other Business (AOB)

---

## Discussion Notes

### 1. [Agenda Item 1]

[Summary of discussion. Who said what, key points raised, decisions made.]

**Decision:** [Decision made, if any]

### 2. [Agenda Item 2]

[Summary of discussion]

**Decision:** [Decision made]

### 3. [Agenda Item 3]

[Summary of discussion]

## Action Items

| # | Action | Owner | Due Date | Status |
|---|--------|-------|----------|--------|
| 1 | [Action description] | [Name] | [Date] | 🔄 Open |
| 2 | [Action description] | [Name] | [Date] | 🔄 Open |
| 3 | [Action description] | [Name] | [Date] | 🔄 Open |

## Next Meeting

**Date:** [Date]
**Time:** [Time]
**Agenda:** [Pre-planned topics]

---
*Notes compiled by [Name] on ${new Date().toLocaleDateString()}*`,
  },
  {
    name: 'Cover Letter',
    description: 'Professional job application cover letter',
    category: 'personal',
    icon: '✉️',
    isBuiltIn: true,
    tags: ['cover letter', 'job', 'application'],
    content: `[Your Name]
[Your Address]
[City, State, ZIP]
[Email] | [Phone]
${new Date().toLocaleDateString()}

[Hiring Manager Name]
[Title]
[Company Name]
[Company Address]

---

Dear [Hiring Manager Name / Hiring Team],

## Opening Paragraph

I am writing to express my strong interest in the [Job Title] position at [Company Name], as advertised on [Job Board/Company Website]. With [X years] of experience in [relevant field] and a proven track record of [key achievement], I am confident in my ability to make a meaningful contribution to your team.

## Body Paragraph 1 — Your Relevant Experience

In my current role as [Current Title] at [Current Company], I have [key responsibility that matches the job]. One of my proudest achievements was [specific accomplishment], which resulted in [measurable outcome]. This experience has equipped me with [specific skills relevant to role].

## Body Paragraph 2 — Why This Company

What excites me most about [Company Name] is [specific reason — product, mission, culture, recent achievement]. I have followed your work in [area] and am particularly impressed by [specific initiative or achievement]. I am eager to bring my expertise in [relevant skill] to help [Company Name] [specific goal or challenge].

## Closing Paragraph

I would welcome the opportunity to discuss how my background and passion for [field] align with [Company Name]'s goals. I am available for an interview at your earliest convenience and can be reached at [email] or [phone].

Thank you for your time and consideration.

Sincerely,

[Your Name]`,
  },
];

// Seed built-in templates once
let seeded = false;
const seedTemplates = async () => {
  if (seeded || mongoose.connection.readyState !== 1) return;
  seeded = true;
  try {
    const count = await Template.countDocuments({ isBuiltIn: true });
    if (count === 0) {
      await Template.insertMany(BUILT_IN_TEMPLATES);
    }
  } catch {}
};

// GET /api/templates — list all templates (built-in + user's own)
router.get('/', auth, async (req, res) => {
  if (!requireDb(res)) return;
  await seedTemplates();
  try {
    const { category } = req.query;
    const query = {
      $or: [{ isBuiltIn: true }, { userId: req.userId }],
    };
    if (category && category !== 'all') query.category = category;

    const templates = await Template.find(query).sort({ isBuiltIn: -1, usageCount: -1 });
    res.json({ success: true, templates });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch templates' });
  }
});

// POST /api/templates — create custom template
router.post('/', auth, async (req, res) => {
  if (!requireDb(res)) return;
  try {
    const { name, description, category, content, icon, tags } = req.body;
    if (!name || !content) {
      return res.status(400).json({ success: false, message: 'Name and content are required' });
    }
    const template = await Template.create({
      name, description, category, content,
      icon: icon || '📄',
      tags: tags || [],
      userId: req.userId,
      isBuiltIn: false,
    });
    res.status(201).json({ success: true, template });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to create template' });
  }
});

// POST /api/templates/:id/use — increment usage + return content
router.post('/:id/use', auth, async (req, res) => {
  if (!requireDb(res)) return;
  try {
    const template = await Template.findByIdAndUpdate(
      req.params.id,
      { $inc: { usageCount: 1 } },
      { new: true }
    );
    if (!template) return res.status(404).json({ success: false, message: 'Template not found' });
    res.json({ success: true, template });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to use template' });
  }
});

// DELETE /api/templates/:id — delete user's own template
router.delete('/:id', auth, async (req, res) => {
  if (!requireDb(res)) return;
  try {
    const template = await Template.findOneAndDelete({ _id: req.params.id, userId: req.userId, isBuiltIn: false });
    if (!template) return res.status(404).json({ success: false, message: 'Template not found or not yours' });
    res.json({ success: true, message: 'Template deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to delete template' });
  }
});

module.exports = router;
