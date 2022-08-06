import { getSession } from 'next-auth/react';
import Order from '../../../models/Order';

import db from '../../../utils/db';

const handler = async (req, res) => {
  const session = await getSession({ req }); // check if user is signed in

  if (!session) {
    return res.status(401).send('Auth required');
  }

  const { user } = session; // session has only user obj and expiration date

  await db.connect();

  const newOrder = new Order({
    ...req.body,
    user: user._id
  })

  const order = await newOrder.save(); // saving in db
  res.status(201).send(order);
}

export default handler;