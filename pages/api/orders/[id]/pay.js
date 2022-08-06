import { getSession } from 'next-auth/react';

import db from '../../../../utils/db';
import Order from '../../../../models/Order';

const handler = async (req, res) => {
  const session = await getSession({ req });

  if (!session) {
    return res.status(401).send('Auth required');
  }

  const { id, status, email_address } = req.body; // data from paypal

  await db.connect();
  const order = await Order.findById(req.query.id);

  if (order) {
    if (order.isPaid) {
      return res
        .status(400)
        .send({ message: 'Error: the order is already paid' });
    }

    order.isPaid = true;
    order.paidAt = Date.now();
    order.paymentResult = {
      id,
      status,
      email_address,
    };

    const paidOrder = await order.save();
    await db.disconnect();
    res.send({ message: 'Order paid successfully', order: paidOrder });
  } else {
    await db.disconnect();
    res.status(404).send({ message: 'Error: order was not found' })
  }
};

export default handler;
