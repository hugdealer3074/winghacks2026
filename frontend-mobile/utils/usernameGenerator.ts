const adjectives = [
  'Happy', 'Sunny', 'Gentle', 'Brave', 'Calm', 'Bright', 'Sweet', 'Kind',
  'Lovely', 'Peaceful', 'Cozy', 'Warm', 'Cheerful', 'Friendly', 'Caring',
  'Hopeful', 'Joyful', 'Radiant', 'Serene', 'Tender', 'Wise', 'Lucky',
  'Magical', 'Dreamy', 'Playful', 'Sparkling', 'Golden', 'Silver', 'Quiet',
];

const animals = [
  'Panda', 'Koala', 'Bunny', 'Fox', 'Deer', 'Owl', 'Dolphin', 'Butterfly',
  'Penguin', 'Turtle', 'Otter', 'Swan', 'Robin', 'Seal', 'Hedgehog',
  'Lamb', 'Kitten', 'Puppy', 'Bear', 'Lion', 'Tiger', 'Elephant', 'Giraffe',
  'Whale', 'Starfish', 'Hummingbird', 'Squirrel', 'Chipmunk', 'Raccoon',
];

export function generateAnonymousUsername(): string {
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const animal = animals[Math.floor(Math.random() * animals.length)];
  const number = Math.floor(Math.random() * 99) + 1;
  
  return `${adjective}${animal}${number}`;
}

// At the bottom of usernameGenerator.ts
//export default function DummyRoute() { return null; }