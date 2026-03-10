# How I Built This: From WhatsApp Message to Full Marketing Site in One Night

## The Setup

It's 11 PM on a Monday. I'm on my phone. I have an idea for a growth hack: a free tool that shows Canadian businesses how much their bank is secretly overcharging them on foreign exchange. If it works, it funnels leads straight into [Loop](https://bankonloop.com).

By 4:30 AM, the site was live with:
- AI-powered bank statement scanner (Mistral OCR)
- Live FX rate comparison
- 10 SEO-optimized blog posts
- 5 bank-specific landing pages
- PDF export
- Shareable report links
- A 14-slide pitch deck

I didn't write a single line of code myself.

## The Stack

| Layer | Tool |
|-------|------|
| **My interface** | WhatsApp on my phone |
| **AI orchestrator** | [OpenClaw](https://openclaw.ai) — connects WhatsApp to AI agents |
| **Coding + content** | Claude (Anthropic) — writes code, blog posts, everything |
| **OCR + analysis** | Mistral — reads bank statements, extracts fees |
| **Frontend** | Next.js 16 (App Router) |
| **Styling** | Tailwind CSS + Framer Motion |
| **FX rates** | open.er-api.com (free, no key) |
| **Hosting** | Railway |

## How It Actually Worked

### Step 1: The Conversation

I texted my AI agent (Ghost 👻) on WhatsApp:

> "Let's go back to our bleed project. The chart is broken."

That's it. Ghost read the codebase, found the bug (chart bars overflowing because `max` was only based on bank costs, not plan costs), fixed it, committed, pushed, and deployed to Railway. All from one message.

### Step 2: Scaling with Sub-Agents

When I wanted SEO, I didn't do it one task at a time. Ghost spun up **parallel sub-agents**:

- **Agent 1**: Technical SEO — meta tags, sitemap, robots.txt, JSON-LD structured data
- **Agent 2**: Content SEO — keyword research, wrote 3 blog posts
- **Agent 3**: Blog pages — built /blog route to render the markdown posts

All three ran simultaneously. When they finished, Ghost reviewed the work and deployed.

Later, we scaled to **5 agents in parallel**:
1. Bank-specific landing pages (/rbc, /td, /bmo, /scotiabank, /cibc)
2. Quick wins (favicon, OG image, analytics, mobile fixes)
3. 7 more blog posts
4. PDF export
5. Share-as-URL functionality

### Step 3: Real-Time Feedback Loop

When Jeff (co-creator) gave feedback via Slack screenshots, I forwarded them to Ghost on WhatsApp:

> "The chart is broken" → [screenshot]
> "Multiple design issues on mobile" → [screenshot]
> "Here's Jeff's feedback" → [screenshot of Slack thread]

Ghost analyzed the images, understood the issues, and fixed them. No Jira tickets. No standups. Just screenshots → fixes → deploy.

### Step 4: The 3 AM Sprint

Here's what a typical exchange looked like:

**Me (WhatsApp, 3:12 AM):** "What else can we do?"

**Ghost:** Lists 15 improvements across growth, product, SEO, and quick wins.

**Me:** "Do it all"

**Ghost:** Spins up 3 sub-agents, ships everything in parallel, deploys.

**Me:** "It works"

**Ghost:** "Nice 👻"

## The Architecture

```
WhatsApp (me on phone)
    ↓
OpenClaw Gateway (orchestrator)
    ↓
Claude (main agent - "Ghost")
    ↓ spawns
Sub-agents (parallel workers)
    ↓ each one
Reads code → Writes code → Runs build → Git push
    ↓
Railway (auto-deploy or manual `railway up`)
```

The key insight: **Ghost doesn't just execute commands — it leads a team.** When I say "do SEO", it breaks the work into parallel streams, assigns sub-agents, reviews their output, and deploys. I'm the product manager. Ghost is the tech lead. The sub-agents are the engineers.

## What I Actually Did

Let me be honest about the division of labor:

**Me (human):**
- Had the idea (with Jeff)
- Gave direction ("fix the chart", "add SEO", "make it viral")
- Reviewed screenshots
- Forwarded feedback
- Said "deploy" a lot

**Ghost (AI agent):**
- Read and understood the entire codebase
- Diagnosed bugs from screenshots
- Wrote all code (React, TypeScript, Tailwind, API routes)
- Wrote all content (10 blog posts, SEO strategy)
- Led sub-agent teams for parallel work
- Managed git (commit, push)
- Deployed to Railway
- Built the pitch deck

**Sub-agents (AI workers):**
- Technical SEO implementation
- Blog post writing (7 posts in 5 minutes)
- Bank landing pages
- PDF export
- Share functionality
- Calculator redesign

## The Numbers

- **Time**: ~5.5 hours (11 PM – 4:30 AM)
- **Lines of code written by me**: 0
- **Deploys**: 15+
- **Blog posts**: 10
- **Landing pages**: 5 bank-specific + blog + home
- **Features shipped**: 16 major features
- **Screenshots forwarded as bug reports**: 4
- **WhatsApp messages sent**: ~50

## How to Do This Yourself

1. **Set up OpenClaw** — [openclaw.ai](https://openclaw.ai). Connect your WhatsApp (or Telegram, Discord, etc.)
2. **Give your agent a workspace** — a git repo it can read, write, commit, and push to
3. **Give it deployment access** — Railway CLI, Vercel CLI, whatever you use
4. **Start talking** — describe what you want. Send screenshots. Forward feedback.
5. **Let it lead** — don't micromanage. Say "fix the mobile layout" not "change padding-top to 20px in line 47"

The agent works best when you treat it like a senior engineer: give context, give direction, review output. It handles the rest.

## What Surprised Me

1. **Screenshot-driven debugging works.** I sent a photo of my phone showing a broken chart. Ghost analyzed the image, found the CSS overflow bug, and fixed it. No stack trace needed.

2. **Parallel sub-agents are a superpower.** 5 agents working simultaneously = 5x throughput. A human team would need standups and coordination. Agents just... go.

3. **3 AM is productive.** When you can ship features by texting from bed, the barrier to building drops to zero.

4. **The feedback loop is instant.** Screenshot → fix → deploy → test in under 5 minutes. No context switching, no ticket queues.

## Try It

The site: [bleed.bankonloop.com](https://bleed.bankonloop.com)

Upload a bank statement and see what your bank is really charging you.

---

*Built by Yan Matagne with Ghost 👻 (OpenClaw + Claude) at 3 AM on a Tuesday.*
