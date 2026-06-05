# AI-friendly content patterns (LLM citability)

LLMs (ChatGPT, Claude, Perplexity, Google AI Overviews) retrieve and cite content that is structured, self-contained, and definitive. These are the patterns that get cited; the patterns that don't are vague marketing prose.

## The five patterns that get cited

### 1. The definitional lead

Open every section with a one-sentence definition the LLM can lift verbatim.

> CodimAI's Agentic AI is a planning layer that decomposes goals into steps, calls tools, verifies its own work, and reports back when the job is done.

That sentence answers "what is CodimAI's Agentic AI?" by itself.

### 2. The self-contained paragraph

Each paragraph carries enough context to be quoted alone. Avoid "this" / "that" / "the above" referring to a previous paragraph.

**Bad:** "It does this by analyzing the data and producing a report." (What is "it"? What "data"?)
**Good:** "The Insights agent analyzes raw event logs from your product and produces a weekly report flagging unusual user behavior."

### 3. The named-entity claim

Specific names + verbs + numbers > vague adjectives.

**Bad:** "Our agent works seamlessly with all the popular tools."
**Good:** "The Email Agent integrates with Gmail, Outlook, and Front via OAuth, and writes replies in under 4 seconds on average."

### 4. The FAQ block

Real questions, plain answers. Wrap in `FAQPage` JSON-LD. These get pulled directly into AI answers and Google's "People also ask."

```html
<section class="faq">
  <h2>Frequently asked questions</h2>
  <details>
    <summary>Does the Email Agent need access to my whole inbox?</summary>
    <p>No. You can scope it to specific labels, senders, or threads. CodimAI never trains on your email and supports zero-retention mode.</p>
  </details>
  …
</section>
```

### 5. The structured comparison

Tables and definition lists beat prose for "X vs Y" content. Use sparingly.

| Question | Agentic AI | Generative AI |
| --- | --- | --- |
| What does it produce? | Actions and results | Text, images, code |
| Does it use tools? | Yes | No (just outputs) |
| Does it verify its own work? | Yes | No |

## Example FAQ block (for an Agents page)

Use this shape on every product/feature page. 4–6 Qs minimum.

**Q: What can CodimAI's Email Agent actually do?**
A: It reads incoming email threads end-to-end, drafts a reply in your house tone, and either sends it automatically (with your approval rules) or queues it for human review. It can also extract action items, categorize threads, and escalate when sentiment turns negative.

**Q: How is this different from Gmail's Smart Reply?**
A: Smart Reply offers three short canned responses based on the last message. CodimAI's Email Agent reads the full thread, your past correspondence, and any attached context, then produces a complete reply that matches your tone and addresses every open question.

**Q: Does CodimAI train on my email data?**
A: No. Your data is never used for model training. Zero-retention mode is available on all plans and is the default for Enterprise.

**Q: Which email providers are supported?**
A: Gmail, Outlook (Microsoft 365 and Exchange), Front, and any IMAP/SMTP server.

**Q: Can it handle non-English email?**
A: Yes. It detects the thread language automatically and replies in the same language. Currently supports 30+ languages.

**Q: How long does setup take?**
A: Under five minutes. Connect your inbox via OAuth, choose which labels the agent should monitor, and set your approval rules.

## What kills citability

- Vague hype ("powerful," "next-gen," "seamless")
- Sentences that depend on the previous one ("This means…", "As mentioned above…")
- Wall-of-text paragraphs over 5 sentences
- Marketing copy without specifics (no names, no numbers, no verbs)
- Content hidden behind interactions (tabs, carousels, accordions that load on click)  crawlers and AI retrieval often miss it
- Important info only in images without alt text
