import axios from 'axios';
import { useContext } from 'react';
import { toast } from 'react-toastify';

import Product from '../models/Product';
import Layout from '../components/Layout';
import ProductItem from '../components/ProductItem';

import db from '../utils/db';
import { Store } from '../utils/Store';
import { CART_ADD_ITEM } from '../utils/consts/cart.types';

export default function Home({ products }) {
  const { state, dispatch } = useContext(Store);
  const { cart } = state;

  const addToCartHandler = async (product) => {
    // refactor
    const existingItem = cart.cartItems.find(
      (item) => item.slug === product.slug
    );
    const quantity = existingItem ? existingItem.quantity + 1 : 1;

    const { data } = await axios.get(`/api/products/${product._id}`);

    if (data.countInStock < quantity) {
      return toast.error('Sorry! The product is out of stock.');
    }

    dispatch({
      type: CART_ADD_ITEM,
      payload: { ...product, quantity },
    });

    toast.success('Product added to the cart');
  };

  return (
    <Layout title="Home Page">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {products.map((product) => (
          <ProductItem
            key={product.slug}
            product={product}
            addToCartHandler={addToCartHandler}
          />
        ))}
      </div>
    </Layout>
  );
}

// server side props function (runs before rendering the component and provides data for it)
export async function getServerSideProps() {
  await db.connect();
  const products = await Product.find().lean();
  return {
    props: {
      products: products.map((doc) => db.convertDocToString(doc)),
    },
  };
}
