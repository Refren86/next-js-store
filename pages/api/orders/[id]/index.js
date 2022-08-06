// /api/orders/:id
// GETTER
import { getSession } from "next-auth/react"
import Order from "../../../../models/Order";
import db from "../../../../utils/db";

const handler = async (req, res) => {
  const session = await getSession({ req });

  if (!session) {
    return res.status(401).send('Auth required');
  }

  await db.connect();
  const order = await Order.findById(req.query.id); // id from url params
  await db.disconnect();

  res.send(order);
}

export default handler;