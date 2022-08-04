import axios from 'axios';
import Link from 'next/link';
import Image from 'next/image';
import { toast } from 'react-toastify';
import React, { useContext } from 'react';

import Product from '../../models/Product';
import { Store } from '../../utils/Store';
import { CART_ADD_ITEM } from '../../utils/consts/cart.types';
import Layout from '../../components/Layout';
import db from '../../utils/db';

const ProductScreen = ({ product }) => {
  const { state, dispatch } = useContext(Store);
  const { cart } = state;

  if (!product) {
    return <Layout title="Not Found">Product Not Found</Layout>;
  }

  const addToCartHandler = async () => {
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
    <Layout title={product.name}>
      <div className="py-2">
        <Link href="/">
          <a>Back to products</a>
        </Link>
      </div>

      <div className="grid md:grid-cols-4 md:gap-3">
        <div className="md:col-span-2">
          <Image
            src={product.image}
            alt={product.name}
            width={640}
            height={640}
            layout="responsive"
          />
        </div>

        <div>
          <ul>
            <li>
              <h1 className="text-lg">{product.name}</h1>
            </li>
            <li>Category: {product.category}</li>
            <li>Brand: {product.brand}</li>
            <li>
              {product.rating} of {product.numReviews} reviews
            </li>
            <li>Description: {product.description}</li>
          </ul>
        </div>

        <div>
          <div className="card p-5">
            <div className="flex justify-between mb-2">
              <div>Price: </div>
              <div>${product.price}</div>
            </div>

            <div className="flex justify-between mb-2 ">
              <div>Status: </div>
              <div>{product.countInStock > 0 ? 'In stock' : 'Unavailable'}</div>
            </div>

            <button
              className="primary-button w-full"
              onClick={addToCartHandler}
            >
              Add to cart
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export async function getServerSideProps(context) {
  const { params } = context;
  const { slug } = params;

  await db.connect();
  const product = await Product.findOne({ slug }).lean();
  await db.disconnect();

  return {
    props: {
      product: product ? db.convertDocToString(product) : null,
    },
  };
}

export default ProductScreen;
