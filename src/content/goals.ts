import type { IconName } from '../icons/Icon';

export type GoalId = 'workplace' | 'interviews' | 'daily' | 'abroad' | 'errands';

export interface SubTrack {
  id: string;
  en: string;
  si: string;
  desc: string;
  categoryIds: string[];
}

export interface Goal {
  id: GoalId;
  en: string;
  si: string;
  descEn: string;
  descSi: string;
  icon: IconName;
  color: 'primary' | 'saffron' | 'ink';
  defaultCategoryIds: string[];
  subTracks: SubTrack[];
}

export const GOALS: Goal[] = [
  {
    id: 'workplace',
    en: 'Workplace & Business',
    si: 'රැකියාව සහ කාර්යාලයීය ඉංග්‍රීසි',
    descEn: 'Sound polished in meetings, updates, emails & client calls',
    descSi: 'කාර්යාලයේදී සහ රැස්වීම්වලදී චතුර ලෙස කතා කරන්න',
    icon: 'briefcase',
    color: 'primary',
    defaultCategoryIds: [
      's-work-office',
      's-business',
      's-meetings',
      's-phone-conversations',
      's-technology',
      's-making-requests',
      's-agreeing-disagreeing',
    ],
    subTracks: [
      {
        id: 'it',
        en: 'IT, Tech & Remote Work',
        si: 'තොරතුරු තාක්ෂණය සහ දුරස්ථ රැකියා',
        desc: 'Scrum standups, bugs, screen-sharing & client sprint calls',
        categoryIds: ['s-technology', 's-work-office', 's-meetings', 's-problems-complaints'],
      },
      {
        id: 'corporate',
        en: 'Corporate, Office & Banking',
        si: 'කාර්යාල සහ බැංකු සේවා',
        desc: 'Professional emails, reports, management updates & diplomacy',
        categoryIds: ['s-business', 's-work-office', 's-meetings', 's-phone-conversations'],
      },
      {
        id: 'manufacturing',
        en: 'Manufacturing & Operations',
        si: 'කර්මාන්තශාලා සහ මෙහෙයුම්',
        desc: 'Production, shift handovers, inventory & quality checks',
        categoryIds: ['s-work-office', 's-problems-complaints', 's-transportation'],
      },
      {
        id: 'sales',
        en: 'Client Care & Sales',
        si: 'පාරිභෝගික සේවා සහ අලෙවිය',
        desc: 'Customer handling, solving issues & polite negotiation',
        categoryIds: ['s-phone-conversations', 's-problems-complaints', 's-making-requests', 's-agreeing-disagreeing'],
      },
    ],
  },
  {
    id: 'interviews',
    en: 'Job Interviews',
    si: 'රැකියා සම්මුඛ පරීක්ෂණ',
    descEn: 'Introduce yourself, answer tough questions & explain experience',
    descSi: 'සම්මුඛ පරීක්ෂණවලට බිය නැතිව මුහුණ දෙන්න',
    icon: 'user',
    color: 'saffron',
    defaultCategoryIds: ['s-job-interviews', 's-work-office', 's-greetings-introductions', 's-giving-opinions'],
    subTracks: [
      {
        id: 'self',
        en: 'Self-Introduction & Background',
        si: 'හඳුන්වා දීම සහ පසුබිම',
        desc: 'Tell me about yourself & education overview',
        categoryIds: ['s-job-interviews', 's-greetings-introductions', 's-school-education'],
      },
      {
        id: 'strengths',
        en: 'Strengths & Achievements',
        si: 'දක්ෂතා සහ ජයග්‍රහණ',
        desc: 'Highlighting skills, experience & problem solving',
        categoryIds: ['s-job-interviews', 's-feelings-emotions', 's-giving-opinions'],
      },
      {
        id: 'tough_questions',
        en: 'Handling Difficult Questions',
        si: 'අභියෝගාත්මක ප්‍රශ්න',
        desc: 'Dealing with conflicts, weaknesses & role expectations',
        categoryIds: ['s-job-interviews', 's-asking-questions', 's-giving-answers'],
      },
    ],
  },
  {
    id: 'daily',
    en: 'Daily Spoken Confidence',
    si: 'එදිනෙදා බිය නැතිව කතා කිරීම',
    descEn: 'Natural responses, small talk & speaking without translation lag',
    descSi: 'හිතෙන් පරිවර්තනය නොකර ස්වාභාවිකව කතා කරන්න',
    icon: 'message-circle',
    color: 'primary',
    defaultCategoryIds: [
      's-everyday-conversations',
      's-asking-questions',
      's-making-requests',
      's-feelings-emotions',
      's-thanking',
    ],
    subTracks: [
      {
        id: 'smalltalk',
        en: 'Small Talk & Socializing',
        si: 'සාමාන්‍ය සුහද කතාබහ',
        desc: 'Chatting with friends, colleagues & acquaintances',
        categoryIds: ['s-everyday-conversations', 's-greetings-introductions', 's-making-plans'],
      },
      {
        id: 'opinions',
        en: 'Expressing Thoughts & Feelings',
        si: 'අදහස් සහ හැඟීම් ප්‍රකාශ කිරීම',
        desc: 'Agreeing, disagreeing & sharing your perspective',
        categoryIds: ['s-giving-opinions', 's-agreeing-disagreeing', 's-feelings-emotions'],
      },
      {
        id: 'polite_requests',
        en: 'Polite Requests & Favors',
        si: 'කාරුණික ඉල්ලීම් සහ උදව්',
        desc: 'Asking for help, making requests & showing appreciation',
        categoryIds: ['s-making-requests', 's-asking-for-help', 's-thanking'],
      },
    ],
  },
  {
    id: 'errands',
    en: 'Practical Life & Errands',
    si: 'පිටතදී අවශ්‍ය වන කතාබහ',
    descEn: 'Malls, cafes, banking, healthcare & transport confidence',
    descSi: 'සාප්පු සවාරි, අවන්හල්, බැංකු සහ රෝහල්වලදී',
    icon: 'coffee',
    color: 'saffron',
    defaultCategoryIds: [
      's-shopping',
      's-restaurants-food',
      's-banking-money',
      's-doctor-health',
      's-transportation',
      's-giving-directions',
      's-problems-complaints',
    ],
    subTracks: [
      {
        id: 'shopping',
        en: 'Shopping, Supermarkets & Malls',
        si: 'සාප්පු සවාරි සහ සුපිරි වෙළඳසැල්',
        desc: 'Prices, sizes, checking out & returning items',
        categoryIds: ['s-shopping', 's-banking-money'],
      },
      {
        id: 'dining',
        en: 'Dining Out, Cafes & Food',
        si: 'අවන්හල් සහ ආපනශාලා',
        desc: 'Ordering meals, customizing dishes & asking for the bill',
        categoryIds: ['s-restaurants-food'],
      },
      {
        id: 'banking',
        en: 'Banking, Money & Post',
        si: 'බැංකු සහ මූල්‍ය කටයුතු',
        desc: 'Accounts, ATMs, transactions & official forms',
        categoryIds: ['s-banking-money'],
      },
      {
        id: 'doctor',
        en: 'Doctor, Hospital & Pharmacy',
        si: 'වෛද්‍යවරයා සහ ඔසුසල්',
        desc: 'Explaining symptoms, appointments & medicine dosages',
        categoryIds: ['s-doctor-health', 's-emergencies'],
      },
      {
        id: 'transport',
        en: 'Taxis, Transport & Directions',
        si: 'ටැක්සි සහ මඟ විමසීම',
        desc: 'PickMe/Uber instructions, buses & street directions',
        categoryIds: ['s-transportation', 's-giving-directions'],
      },
    ],
  },
  {
    id: 'abroad',
    en: 'Abroad, Travel & IELTS',
    si: 'විදේශගතවීම්, සංචාර සහ IELTS',
    descEn: 'Airports, immigration, living abroad & spoken exam flow',
    descSi: 'විදේශ ගමන් සහ IELTS විභාග සඳහා සූදානම් වීම',
    icon: 'map-pin',
    color: 'ink',
    defaultCategoryIds: [
      's-airport',
      's-travel',
      's-hotel',
      's-transportation',
      's-giving-directions',
      's-emergencies',
    ],
    subTracks: [
      {
        id: 'airport',
        en: 'Airports, Flights & Immigration',
        si: 'ගුවන් තොටුපළ සහ වීසා',
        desc: 'Check-in, baggage claim, customs & visa interviews',
        categoryIds: ['s-airport', 's-travel', 's-transportation'],
      },
      {
        id: 'living_abroad',
        en: 'Living & Accommodation Abroad',
        si: 'විදේශයක ජීවත්වීම සහ නවාතැන්',
        desc: 'Hotels, renting, transit & local navigation',
        categoryIds: ['s-hotel', 's-shopping', 's-giving-directions'],
      },
      {
        id: 'ielts',
        en: 'IELTS / Spoken Test Fluency',
        si: 'IELTS කථන පරීක්ෂණ චතුරතාව',
        desc: 'Describing situations, linking phrases & expanding answers',
        categoryIds: ['s-giving-opinions', 's-feelings-emotions', 's-common-expressions'],
      },
    ],
  },
];

export function getGoal(id: GoalId | undefined): Goal {
  return GOALS.find((g) => g.id === id) ?? GOALS[0];
}

export function getGoalCategoryIds(goalId: GoalId, subTrackId?: string): string[] {
  const goal = getGoal(goalId);
  if (subTrackId) {
    const track = goal.subTracks.find((t) => t.id === subTrackId);
    if (track && track.categoryIds.length > 0) {
      return track.categoryIds;
    }
  }
  return goal.defaultCategoryIds;
}
