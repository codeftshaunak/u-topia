// Avatar library with male and female avatars
// Using DiceBear Fun Emoji style for expressive, friendly emoji-like avatars

export interface Avatar {
  id: string;
  url: string;
  gender: 'male' | 'female';
}

const generateAvatarUrl = (seed: string) => 
  `https://api.dicebear.com/9.x/fun-emoji/svg?seed=${seed}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`;

// Generate 25 male avatars
const maleSeeds = [
  'Marcus', 'James', 'Michael', 'David', 'Christopher',
  'Daniel', 'Matthew', 'Anthony', 'Joshua', 'Andrew',
  'Joseph', 'Ryan', 'Brandon', 'Justin', 'Kevin',
  'Jason', 'Brian', 'Eric', 'Steven', 'Timothy',
  'Richard', 'Thomas', 'Charles', 'William', 'Robert'
];

// Generate 25 female avatars
const femaleSeeds = [
  'Sarah', 'Emily', 'Jessica', 'Ashley', 'Amanda',
  'Stephanie', 'Jennifer', 'Elizabeth', 'Nicole', 'Megan',
  'Rachel', 'Lauren', 'Samantha', 'Katherine', 'Michelle',
  'Christina', 'Rebecca', 'Victoria', 'Angela', 'Brittany',
  'Melissa', 'Danielle', 'Heather', 'Tiffany', 'Kimberly'
];

export const maleAvatars: Avatar[] = maleSeeds.map((seed, index) => ({
  id: `male-${index + 1}`,
  url: generateAvatarUrl(seed),
  gender: 'male' as const,
}));

export const femaleAvatars: Avatar[] = femaleSeeds.map((seed, index) => ({
  id: `female-${index + 1}`,
  url: generateAvatarUrl(seed),
  gender: 'female' as const,
}));

export const allAvatars: Avatar[] = [...maleAvatars, ...femaleAvatars];
