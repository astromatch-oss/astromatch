export interface RetrogradePrompt {
  id: string;
  category: 'Cosmic Glitch' | 'Deep Hypothetical' | 'Planetary Reversal' | 'Soul Twist' | 'Parallel Reality';
  twistTitle: string;
  prompt: string;
  tagline: string;
  suggestedReplies: string[];
}

export const MERCURY_RETROGRADE_PROMPTS: RetrogradePrompt[] = [
  {
    id: 'retro-1',
    category: 'Cosmic Glitch',
    twistTitle: 'Mercury Planetary Glitch ☿',
    prompt: 'Mercury just wiped all communication filters for 60 seconds! What is one secret, unhinged obsession you normally wait until date 5 to reveal?',
    tagline: 'Zero-filter cosmic transmission',
    suggestedReplies: [
      'Haha oh no! Honestly? I rank coffee shops by how fast they play indie tracks when it rains.',
      'I secretly look up everyone’s birth chart the moment I get their last name 🙈',
      'I have a spreadsheet of all the hypothetical pets I will adopt in my lifetime.',
    ],
  },
  {
    id: 'retro-2',
    category: 'Planetary Reversal',
    twistTitle: 'Astrological Sign Swap 🔄',
    prompt: 'If you had to swap your Sun sign with your exact opposite zodiac sign for 24 hours, what chaotic thing would you do first?',
    tagline: 'Polarity inversion activated',
    suggestedReplies: [
      'As an inverted sign? I would probably make 10 impulsive life decisions before breakfast!',
      'I’d finally stop overthinking and send a risky text with zero regrets.',
      'I’d take over the dance floor and demand everyone learn my synchronized choreography.',
    ],
  },
  {
    id: 'retro-3',
    category: 'Parallel Reality',
    twistTitle: 'Alternate Timeline Transmission 🌌',
    prompt: 'In a parallel universe where we matched 1,000 years ago as stargazers in Alexandria, what were we arguing about right now?',
    tagline: 'Ancient synastry paradox',
    suggestedReplies: [
      'Definitely arguing over who misplaced the celestial navigation telescope again!',
      'Whether the constellation of the Phoenix was a lucky omen or an excuse to order extra dessert.',
      'Who stole whose sacred papyrus scroll with the love horoscope predictions.',
    ],
  },
  {
    id: 'retro-4',
    category: 'Deep Hypothetical',
    twistTitle: 'The Cosmic Envelope ✉️',
    prompt: 'You receive an encrypted letter from your future self 5 years from now containing the truth about our cosmic destiny. Do you read it immediately or burn it?',
    tagline: 'Destiny vs. Mystery',
    suggestedReplies: [
      'I’m tearing that envelope open in 0.5 seconds—I have zero patience with time travel!',
      'I’d read the first sentence, panic, and hide it in a vintage book.',
      'Keep it sealed until our third date, then open it together over late-night dessert.',
    ],
  },
  {
    id: 'retro-5',
    category: 'Soul Twist',
    twistTitle: 'High-Stakes Escape Room 🪐',
    prompt: 'We are trapped in an interstellar escape room designed by an eccentric Scorpio. Who takes the lead on decoding cryptic riddles, and who negotiates with the alien guard?',
    tagline: 'Planetary tactical synergy',
    suggestedReplies: [
      'I’ll handle the riddles, but if there’s charm or bribery needed, you’re up front!',
      'I’m definitely the one searching behind every fake bookshelf while you find the secret key.',
      'We’d probably argue for 10 minutes and then accidentally unlock the master door by leaning on the wall.',
    ],
  },
  {
    id: 'retro-6',
    category: 'Cosmic Glitch',
    twistTitle: 'Zodiac Courtroom Defense ⚖️',
    prompt: 'You are summoned to the High Celestial Council to defend your zodiac sign against all stereotypes. What is your strongest exhibit?',
    tagline: 'Cosmic advocacy in session',
    suggestedReplies: [
      'Exhibit A: Our unmatched playlist curation skills. Case closed, Council!',
      'We may be dramatic, but we have the biggest hearts in the galaxy and you know it.',
      'I bring homemade snacks as evidence. Nobody can convict us on a full stomach.',
    ],
  },
  {
    id: 'retro-7',
    category: 'Deep Hypothetical',
    twistTitle: 'Supernatural Synastry Power ⚡',
    prompt: 'If our astrological alignment granted us one shared superpower for 24 hours, are we solving a world mystery or causing harmless romantic chaos?',
    tagline: 'Resonance amplification',
    suggestedReplies: [
      '100% harmless romantic chaos! We are crashing boring VIP parties and leaving mysterious stardust.',
      'Teleporting to the best rooftop in Rome for midnight gelato.',
      'Reading each other’s minds just to win trivia night without speaking a word.',
    ],
  },
  {
    id: 'retro-8',
    category: 'Planetary Reversal',
    twistTitle: 'Red Flag Inversion 🚩✨',
    prompt: 'Mercury commands: what is a personal quirk or "red flag" you possess that you are secretly low-key proud of?',
    tagline: 'Retrograde radical honesty',
    suggestedReplies: [
      'I will spend 45 minutes finding the exact right song before driving 5 minutes down the street.',
      'If I like a dish at a restaurant, I will order it 47 times in a row without shame.',
      'I remember tiny details people told me 6 months ago like a certified celestial detective.',
    ],
  },
  {
    id: 'retro-9',
    category: 'Parallel Reality',
    twistTitle: 'Midnight Spaceflight Dilemma 🚀',
    prompt: 'You are stuck on a 12-hour red-eye spaceflight to Jupiter with someone who has your exact Big Three placements. Are you soulmates or throwing space food?',
    tagline: 'Mirror chart encounter',
    suggestedReplies: [
      'First 2 hours: Soulmates. Next 10 hours: Silent war over the window seat shade.',
      'We’d probably start a space podcast mid-flight and forget everyone else is trying to sleep!',
      'Instant soulmates. We’d be dissecting everyone else’s vibes on the ship in whisper mode.',
    ],
  },
];
