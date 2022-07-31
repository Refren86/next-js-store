import React, { useContext } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Image from 'next/image';

import Layout from '../../components/Layout';
import { data } from '../../utils/data';
import { Store } from '../../utils/Store';
import { CART_ADD_ITEM } from '../../utils/consts/cart.types';

const ProductScreen = () => {
  const { state, dispatch } = useContext(Store);
  const { cart } = state;

  const { query } = useRouter();
  const { slug } = query;

  const product = data.products.find((prod) => prod.slug === slug);

  if (!product) {
    return <div>Product Not Found</div>;
  }

  const addToCartHandler = () => {
    // refactor
    const existingItem = cart.cartItems.find(
      (item) => item.slug === product.slug
    );
    const quantity = existingItem ? existingItem.quantity + 1 : 1;

    if (product.countInStock < quantity) {
      alert('Sorry! The product is out of stock.')
      return;
    }

    dispatch({
      type: CART_ADD_ITEM,
      payload: { ...product, quantity },
    });
  };

  console.log(cart);

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
              {product.rating}/5 of {product.numReviews} reviews
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

export default ProductScreen;
