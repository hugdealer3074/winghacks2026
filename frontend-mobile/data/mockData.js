// data/mockData.js
export const mockPosts = [
  {
    id: '1',
    title: 'Best diaper bags for new parents?',
    content: 'Looking for recommendations on diaper bags that are actually practical. What do you all use?',
    authorUsername: 'HappyPanda42',
    category: 'parenting',
    upvotes: 15,
    replies: [
      {
        id: 'r1',
        content: 'I love the Skip Hop Forma! It has so many pockets and looks stylish.',
        authorUsername: 'SunnyKoala17',
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
      },
      {
        id: 'r2',
        content: 'Honestly, any backpack works. Don\'t overthink it!',
        authorUsername: 'GentleFox88',
        createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1 hour ago
      },
    ],
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
  },
  {
    id: '2',
    title: 'When should I call the doctor about fever?',
    content: 'My 3-month-old has a temp of 100.5. Is this urgent or can it wait until morning?',
    authorUsername: 'CalmButterfly23',
    category: 'health',
    upvotes: 8,
    replies: [
      {
        id: 'r3',
        content: 'For babies under 3 months, any fever over 100.4 needs immediate attention. Call your pediatrician now!',
        authorUsername: 'WiseOwl56',
        createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
      },
    ],
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1 hour ago
  },
  {
    id: '3',
    title: 'Feeling overwhelmed as a first-time mom',
    content: 'Is it normal to feel like I have no idea what I\'m doing? Baby is 2 weeks old and I\'m exhausted.',
    authorUsername: 'TiredDolphin91',
    category: 'general',
    upvotes: 23,
    replies: [
      {
        id: 'r4',
        content: 'Totally normal! The first few weeks are HARD. It gets easier, I promise. Hang in there! 💕',
        authorUsername: 'KindLamb34',
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
      },
      {
        id: 'r5',
        content: 'You\'re doing better than you think! Everyone feels this way at first.',
        authorUsername: 'BrightSwan12',
        createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1 hour ago
      },
      {
        id: 'r6',
        content: 'Ask for help when you need it! There\'s no shame in that.',
        authorUsername: 'CaringOtter78',
        createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(), // 45 minutes ago
      },
    ],
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), // 3 hours ago
  },
];

export const mockUser = {
  id: 'user123',
  email: 'test@example.com',
  anonymousUsername: 'HappyPanda42',
};