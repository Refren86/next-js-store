import bcryptjs from 'bcryptjs';

import User from '../../../models/User';
import db from '../../../utils/db';

const handler = async (req, res) => {
  if (req.method !== 'POST') {
    // should only accept post request
    return;
  }

  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    res.status(422).json({ message: 'Validation error' });
    return;
  }

  await db.connect();

  const existingUser = await User.findOne({ email });

  if (existingUser) {
    res.status(403).json({ message: 'User with this email already exist' });
    await db.disconnect();
    return;
  }

  const hashedPassword = bcryptjs.hashSync(password);

  const newUser = new User({ ...req.body, password: hashedPassword, isAdmin: false });
  const user = await newUser.save();
  await db.disconnect();

  res.status(201).send({
    message: 'User created!',
    _id: user._id,
    name: user.name,
    email: user.email,
    isAdmin: user.isAdmin
  });
};

export default handler;
