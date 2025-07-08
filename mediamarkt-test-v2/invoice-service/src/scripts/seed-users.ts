import * as mongoose from 'mongoose';
import * as bcrypt from 'bcrypt';
import { UserSchema } from '../schemas/user.schema';

async function seed() {
  const conn = await mongoose.connect(''); // insert MongoDB connection string here

  const User = conn.model('User', UserSchema);

  await User.deleteMany({});

  await User.create([
    {
      email: 'seller@example.com',
      password: await bcrypt.hash('sellerpass', 10),
      role: 'seller',
    },
    {
      email: 'customer@example.com',
      password: await bcrypt.hash('customerpass', 10),
      role: 'customer',
    },
  ]);

  console.log('Seeded users');
  process.exit();
}

seed();
