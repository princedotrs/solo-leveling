export type BonusCategory = 'Solitude' | 'Discipline' | 'Reflection' | 'Growth';

export type BonusQuest = {
  id: string;
  title: string;
  description: string;
  category: BonusCategory;
  durationHours: 4 | 24 | 72 | 168;
  xpReward: number;
};

export const BONUS_QUEST_POOL: BonusQuest[] = [
  {
    id: 'sol-dine-alone',
    title: 'Dine in Public Alone',
    description: 'Eat a sit-down meal at a restaurant by yourself. Phone face-down.',
    category: 'Solitude',
    durationHours: 72,
    xpReward: 100,
  },
  {
    id: 'sol-solo-cinema',
    title: 'Solo Cinema',
    description: 'Watch a film at the theater on your own.',
    category: 'Solitude',
    durationHours: 72,
    xpReward: 100,
  },
  {
    id: 'sol-coffee-observer',
    title: 'Coffee Shop Observer',
    description: 'Spend one hour at a café watching the room without scrolling.',
    category: 'Solitude',
    durationHours: 24,
    xpReward: 60,
  },
  {
    id: 'sol-new-city-half-day',
    title: 'Solo Excursion',
    description: 'Take yourself on a half-day trip somewhere you have not been.',
    category: 'Solitude',
    durationHours: 168,
    xpReward: 180,
  },
  {
    id: 'sol-strangers-room',
    title: 'Outsider Event',
    description: 'Show up to a class, meetup, or event where you know no one.',
    category: 'Solitude',
    durationHours: 168,
    xpReward: 180,
  },
  {
    id: 'sol-day-no-contact',
    title: 'Radio Silence',
    description: 'Spend an entire day without texting or calling anyone.',
    category: 'Solitude',
    durationHours: 24,
    xpReward: 70,
  },
  {
    id: 'sol-half-day-nature',
    title: 'Wild Half Day',
    description: 'Spend at least four hours outside in nature, alone, no scrolling.',
    category: 'Solitude',
    durationHours: 72,
    xpReward: 110,
  },

  {
    id: 'dis-phone-off',
    title: 'Signal Blackout',
    description: 'Power your phone off for 24 hours.',
    category: 'Discipline',
    durationHours: 24,
    xpReward: 70,
  },
  {
    id: 'dis-silence-30',
    title: 'Iron Hour',
    description: 'Sit in complete silence for 30 minutes — no music, no screens.',
    category: 'Discipline',
    durationHours: 4,
    xpReward: 30,
  },
  {
    id: 'dis-five-am',
    title: 'Dawn Strike',
    description: 'Wake up at 5 AM tomorrow without snoozing. Out of bed within five minutes.',
    category: 'Discipline',
    durationHours: 24,
    xpReward: 60,
  },
  {
    id: 'dis-cook-day',
    title: 'Cook Day',
    description: 'Prepare every meal you eat today from scratch yourself.',
    category: 'Discipline',
    durationHours: 24,
    xpReward: 70,
  },
  {
    id: 'dis-gym-alone',
    title: 'Solo Sweat',
    description: 'Complete a full workout at the gym alone today.',
    category: 'Discipline',
    durationHours: 24,
    xpReward: 60,
  },
  {
    id: 'dis-long-march',
    title: 'Long March',
    description: 'Walk, run, or hike for at least 90 unbroken minutes.',
    category: 'Discipline',
    durationHours: 24,
    xpReward: 70,
  },
  {
    id: 'dis-no-entertainment',
    title: 'No Input Day',
    description: 'A full day with no entertainment: no TV, no scrolling, no music.',
    category: 'Discipline',
    durationHours: 24,
    xpReward: 80,
  },
  {
    id: 'dis-read-book',
    title: 'Page Quest',
    description: 'Read a full book in one sitting. Any length, any genre.',
    category: 'Discipline',
    durationHours: 72,
    xpReward: 110,
  },

  {
    id: 'ref-five-year',
    title: 'Five Year Window',
    description: 'Write a detailed five-year plan for your life. No filters.',
    category: 'Reflection',
    durationHours: 168,
    xpReward: 180,
  },
  {
    id: 'ref-childhood-audit',
    title: 'Childhood Audit',
    description: 'Journal 30 minutes about how your childhood shaped who you are.',
    category: 'Reflection',
    durationHours: 72,
    xpReward: 100,
  },
  {
    id: 'ref-honest-mirror',
    title: 'Honest Mirror',
    description: 'List the habits and behaviors that are dragging you backwards. Be brutal.',
    category: 'Reflection',
    durationHours: 24,
    xpReward: 70,
  },
  {
    id: 'ref-mission-statement',
    title: 'Mission Statement',
    description: 'Draft a one-paragraph personal mission statement for your life.',
    category: 'Reflection',
    durationHours: 72,
    xpReward: 100,
  },
  {
    id: 'ref-hard-question',
    title: 'The Hard Question',
    description: 'Sit alone and answer in writing: am I proud of who I am becoming?',
    category: 'Reflection',
    durationHours: 24,
    xpReward: 70,
  },
  {
    id: 'ref-fear-inventory',
    title: 'Fear Inventory',
    description: 'List your three biggest fears. Pick one. Take a real step toward it today.',
    category: 'Reflection',
    durationHours: 24,
    xpReward: 80,
  },
  {
    id: 'ref-unlimited-life',
    title: 'No Limits Draft',
    description: 'Write down the life you actually want, with no realism filter applied.',
    category: 'Reflection',
    durationHours: 72,
    xpReward: 100,
  },
  {
    id: 'ref-mistakes-log',
    title: 'Mistakes Log',
    description: 'Journal honestly about a recent mistake and what you learned from it.',
    category: 'Reflection',
    durationHours: 24,
    xpReward: 60,
  },

  {
    id: 'gro-cold-open',
    title: 'Cold Open',
    description: 'Strike up a real conversation with a stranger today.',
    category: 'Growth',
    durationHours: 24,
    xpReward: 70,
  },
  {
    id: 'gro-out-of-place',
    title: 'Out of Place',
    description: 'Visit a venue where you feel slightly underdressed or unfamiliar.',
    category: 'Growth',
    durationHours: 72,
    xpReward: 100,
  },
  {
    id: 'gro-new-hobby',
    title: 'Beginner Mode',
    description: 'Start a new hobby today. Even one focused session counts.',
    category: 'Growth',
    durationHours: 72,
    xpReward: 100,
  },
  {
    id: 'gro-networking',
    title: 'Cold Plunge: Network',
    description: 'Attend a networking event or community gathering by yourself.',
    category: 'Growth',
    durationHours: 168,
    xpReward: 180,
  },
  {
    id: 'gro-beginner-class',
    title: 'Beginner in the Room',
    description: 'Take a class or workshop where you are the most inexperienced person there.',
    category: 'Growth',
    durationHours: 168,
    xpReward: 180,
  },
  {
    id: 'gro-aimless-drive',
    title: 'Compass Drive',
    description: 'Drive somewhere with no destination for at least an hour.',
    category: 'Growth',
    durationHours: 72,
    xpReward: 90,
  },
  {
    id: 'gro-face-fear',
    title: 'Face the Fear',
    description: 'Pick a fear you wrote down. Today, do the thing that fear is blocking.',
    category: 'Growth',
    durationHours: 72,
    xpReward: 130,
  },
];

export function findBonusQuest(id: string): BonusQuest | undefined {
  return BONUS_QUEST_POOL.find((q) => q.id === id);
}

export function pickNextBonusQuestId(recentIds: string[]): string {
  const recent = new Set(recentIds.slice(-6));
  const candidates = BONUS_QUEST_POOL.filter((q) => !recent.has(q.id));
  const pool = candidates.length > 0 ? candidates : BONUS_QUEST_POOL;
  return pool[Math.floor(Math.random() * pool.length)].id;
}

export function bonusPenaltyXp(reward: number): number {
  return Math.ceil(reward * 0.4);
}

export function formatRemaining(ms: number): string {
  if (ms <= 0) return 'expired';
  const totalSec = Math.floor(ms / 1000);
  const days = Math.floor(totalSec / 86400);
  const hours = Math.floor((totalSec % 86400) / 3600);
  const minutes = Math.floor((totalSec % 3600) / 60);
  const seconds = totalSec % 60;
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
}
