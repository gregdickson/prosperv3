export interface Audience {
  slug: string;
  title: string;
  shortTitle: string;
  description: string;
  heroHeading: string;
  heroSubtext: string;
  painPoints: {
    heading: string;
    items: { title: string; description: string }[];
  };
  solutions: {
    heading: string;
    items: { title: string; description: string }[];
  };
  ctaHeading: string;
  ctaText: string;
  ctaButtonLabel: string;
}

export const audiences: Audience[] = [
  {
    slug: "first-home-buyers",
    title: "First Home Buyers",
    shortTitle: "First Home Buyers",
    description: "Make sure your KiwiSaver is set up to get you into your first home faster — with every dollar and grant you're entitled to.",
    heroHeading: "Buying your first home? Your KiwiSaver could be your secret weapon.",
    heroSubtext: "Most first home buyers don't realise how much KiwiSaver help is available to them. We make sure you're not leaving a single cent on the table.",
    painPoints: {
      heading: "Sound familiar?",
      items: [
        {
          title: "You're not sure what you can actually withdraw",
          description: "The rules around KiwiSaver first home withdrawals are confusing. How much can you pull out? What has to stay? We'll break it down in plain English.",
        },
        {
          title: "Your fund type might not match your timeline",
          description: "If you're buying soon, being in a high-growth fund is a gamble with your deposit. If you're years away, a conservative fund is leaving money on the table.",
        },
        {
          title: "You're not sure about the HomeStart grant",
          description: "The Government's HomeStart Grant gives you up to $5,000 (or $10,000 for new builds). A shocking number of eligible Kiwis don't claim it.",
        },
      ],
    },
    solutions: {
      heading: "Here's how we help",
      items: [
        {
          title: "Withdrawal planning",
          description: "We'll work out exactly how much you can withdraw, what stays in your account, and the best timing to maximise your deposit.",
        },
        {
          title: "Contribution optimisation",
          description: "We'll make sure your contribution rate is right for your timeline — maximising your deposit without overcommitting.",
        },
        {
          title: "Fund type alignment",
          description: "We'll match your fund type to your purchase timeline — so your money's growing when it should be, and protected when it needs to be.",
        },
      ],
    },
    ctaHeading: "Don't leave money on the table",
    ctaText: "A quick review could mean thousands more towards your first home. It takes 2 minutes and it's completely free.",
    ctaButtonLabel: "Check my fund",
  },
  {
    slug: "nearing-retirement",
    title: "Saving for Retirement",
    shortTitle: "Saving for Retirement",
    description: "Protect what you've built and make sure your KiwiSaver is working for you — not against you — as retirement approaches.",
    heroHeading: "Retirement's getting close. Is your KiwiSaver ready?",
    heroSubtext: "The last 5-10 years before retirement are critical. Being over-exposed or under-exposed to volatility could cost you tens of thousands right when it matters most.",
    painPoints: {
      heading: "Does this hit home?",
      items: [
        {
          title: "You haven't changed your fund since you signed up",
          description: "A growth fund made sense 20 years ago. But as retirement gets closer, market dips hit harder — and you have less time to recover.",
        },
        {
          title: "You could be over-exposed or under-exposed to volatility",
          description: "Too much risk close to retirement and a market dip could wipe years of gains. Too little and your money isn't keeping up with inflation.",
        },
        {
          title: "You don't have a drawdown plan",
          description: "When you hit 65, what happens? Lump sum, regular withdrawals, or leave it invested? Most people haven't thought about it.",
        },
      ],
    },
    solutions: {
      heading: "Here's how we help",
      items: [
        {
          title: "Risk right-sizing",
          description: "We'll review your fund type and make sure your risk level matches how close you are to needing the money.",
        },
        {
          title: "Have your cake and eat it too",
          description: "It is possible to balance strong returns with appropriate risk. We'll find the right mix so your money keeps growing without keeping you up at night.",
        },
        {
          title: "Retirement strategy",
          description: "We'll help you think through how to access your KiwiSaver in a way that makes your money last.",
        },
      ],
    },
    ctaHeading: "Protect your nest egg",
    ctaText: "A 15-minute review could save you tens of thousands. Don't leave it to chance when you're this close.",
    ctaButtonLabel: "Check my fund",
  },
  {
    slug: "business-owners",
    title: "Business Owners",
    shortTitle: "Business Owners",
    description: "You're busy running a business. We'll make sure your KiwiSaver isn't sitting in the 'too hard' basket costing you money.",
    heroHeading: "Running a business? Your KiwiSaver's probably in the 'too hard' basket.",
    heroSubtext: "We get it — you're flat out. But ignoring your KiwiSaver could be costing you more than you think. Let's sort it.",
    painPoints: {
      heading: "Ring any bells?",
      items: [
        {
          title: "KiwiSaver feels like an afterthought",
          description: "When you're focused on cashflow, staff, and growth, retirement savings drop to the bottom of the list. But the default fund your accountant set up years ago? It's probably not doing you any favours.",
        },
        {
          title: "You're not sure what you're entitled to as self-employed",
          description: "The rules are different when you're your own boss. Contribution levels, tax credits, employer match — it's a minefield if you don't know the ropes.",
        },
        {
          title: "You haven't reviewed it in years",
          description: "Set and forget is the enemy of a good KiwiSaver outcome. Markets change, fees change, your situation changes. A fund that was fine 5 years ago might be costing you now.",
        },
      ],
    },
    solutions: {
      heading: "Here's how we help",
      items: [
        {
          title: "Self-employed strategy",
          description: "We'll work out the optimal contribution level for your situation — maximising government contributions without straining your cashflow.",
        },
        {
          title: "Fund and provider review",
          description: "We'll compare your current setup against the full market and find the best fit for your goals and risk appetite.",
        },
        {
          title: "Ongoing check-ins",
          description: "Business changes, life changes — we'll make sure your KiwiSaver keeps pace so it's never in the 'too hard' basket again.",
        },
      ],
    },
    ctaHeading: "Take it off your plate",
    ctaText: "2 minutes now could mean a much better retirement later. Let us handle the KiwiSaver stuff so you can focus on what you do best.",
    ctaButtonLabel: "Check my fund",
  },
];
