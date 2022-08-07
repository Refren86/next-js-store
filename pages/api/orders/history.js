import { getSession } from 'next-auth/react';
import Order from '../../../models/Order';
import db from '../../../utils/db';

const handler = async (req, res) => {
  const session = await getSession({ req }); // check if user is signed in

  if (!session) {
    return res.status(401).send({ message: 'Auth required' });
  }

  const { user } = session;

  await db.connect();
  const ordersHistory = await Order.find({ user: user._id });
  await db.disconnect();

  res.json(ordersHistory);
};

export default handler;
