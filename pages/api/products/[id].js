import Product from "../../../models/Product";
import db from "../../../utils/db";

const handler = async (req, res) => {
  await db.connect();
  const product = await Product.findById(req.query.id); // api/products/id
  await db.disconnect();

  res.send(product);
}

export default handler;