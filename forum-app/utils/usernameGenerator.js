// utils/usernameGenerator.js

const adjectives = [
  'Happy', 'Sunny', 'Gentle', 'Brave', 'Calm', 'Bright', 'Sweet', 'Kind',
  'Lovely', 'Peaceful', 'Cozy', 'Warm', 'Cheerful', 'Friendly', 'Caring',
  'Hopeful', 'Joyful', 'Radiant', 'Serene', 'Tender', 'Wise', 'Lucky',
  'Magical', 'Dreamy', 'Playful', 'Sparkling', 'Golden', 'Silver', 'Quiet',
  'Bold', 'Swift', 'Noble', 'Proud', 'Graceful', 'Eager', 'Lively'
];

const animals = [
  'Panda', 'Koala', 'Bunny', 'Fox', 'Deer', 'Owl', 'Dolphin', 'Butterfly',
  'Penguin', 'Turtle', 'Otter', 'Swan', 'Robin', 'Seal', 'Hedgehog',
  'Lamb', 'Kitten', 'Puppy', 'Bear', 'Lion', 'Tiger', 'Elephant', 'Giraffe',
  'Whale', 'Starfish', 'Hummingbird', 'Squirrel', 'Chipmunk', 'Raccoon',
  'Peacock', 'Flamingo', 'Leopard', 'Cheetah', 'Puma', 'Lynx', 'Moose'
];

export function generateAnonymousUsername() {
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const animal = animals[Math.floor(Math.random() * animals.length)];
  const number = Math.floor(Math.random() * 99) + 1;
  
  return `${adjective}${animal}${number}`;
}

// Examples: HappyPanda42, SunnyKoala17, GentleFox88