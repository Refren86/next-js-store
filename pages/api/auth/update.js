import bcryptjs from 'bcryptjs';
import { getSession } from 'next-auth/react';

import User from '../../../models/User';
import db from '../../../utils/db';

const handler = async (req, res) => {
  if (req.method !== 'PUT') {
    return res.status(400).send({ message: `${req.method} not supported` });
  }

  const session = await getSession({ req }); // check if user is signed in

  if (!session) {
    return res.status(401).send({ message: 'Auth required' });
  }

  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    res.status(422).json({
      message: 'Validation error',
    });
    return;
  }

  const { user } = session; // session has only user obj and expiration date

  await db.connect();
  const userToUpdate = await User.findById(user._id);
  userToUpdate.name = name;
  userToUpdate.email = email;

  if (password) {
    userToUpdate.password = bcryptjs.hashSync(password);
  }

  await userToUpdate.save();
  await db.disconnect();

  res.send({ message: 'Successfully updated' });
};

export default handler;
