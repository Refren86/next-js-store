import User from "../../models/User";
import Product from "../../models/Product";

import db from "../../utils/db"
import { data } from "../../utils/data";

// THIS WILL FILL DB WITH INFO FROM DATA FILE!
const handler = async (req, res) => {
  await db.connect();
  await User.deleteMany();
  await User.insertMany(data.users);
  await Product.deleteMany();
  await Product.insertMany(data.products);
  await db.disconnect();
  res.send({ message: 'Seeded successfully!' });
}

export default handler;