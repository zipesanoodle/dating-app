import { connectDB, User, Profile } from './mongodb';
import bcrypt from 'bcryptjs';

async function seed() {
  console.log('Seeding MongoDB database...');
  await connectDB();

  // Clear existing data (optional, but good for a fresh start)
  await User.deleteMany({});
  await Profile.deleteMany({});

  const passwordHash = await bcrypt.hash('password123', 10);

  const usersToInsert = [
    { email: 'alice@example.com', passwordHash },
    { email: 'bob@example.com', passwordHash },
    { email: 'charlie@example.com', passwordHash },
    { email: 'diana@example.com', passwordHash },
    { email: 'eve@example.com', passwordHash },
  ];

  const profileData: any = {
    alice: { name: 'Alice', age: 24, bio: 'Nature lover and hiker', imageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=600&fit=crop', interests: ['hiking', 'photography'] },
    bob: { name: 'Bob', age: 27, bio: 'Coffee is life', imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=600&fit=crop', interests: ['coffee', 'coding'] },
    charlie: { name: 'Charlie', age: 22, bio: 'Student and gamer', imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop', interests: ['gaming', 'anime'] },
    diana: { name: 'Diana', age: 26, bio: 'Avid reader and traveler', imageUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=600&fit=crop', interests: ['reading', 'travel'] },
    eve: { name: 'Eve', age: 25, bio: 'Artist and dreamer', imageUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=600&fit=crop', interests: ['art', 'music'] },
  };

  for (const userData of usersToInsert) {
    const newUser = await User.create(userData);
    
    const nameKey = userData.email.split('@')[0];
    const data = profileData[nameKey];

    await Profile.create({
      userId: newUser._id,
      name: data.name,
      age: data.age,
      bio: data.bio,
      imageUrl: data.imageUrl,
      interests: data.interests,
    });
  }

  console.log('Seeding complete!');
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
