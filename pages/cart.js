import Link from 'next/link';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import React, { useContext } from 'react';

import { XIcon } from '@heroicons/react/outline';

import Layout from '../components/Layout';
import { Store } from '../utils/Store';
import { CART_ADD_ITEM, CART_REMOVE_ITEM } from '../utils/consts/cart.types';

const CartScreen = () => {
  const { state, dispatch } = useContext(Store);
  const {
    cart: { cartItems },
  } = state;

  const router = useRouter();

  const removeItemHandler = (item) => {
    dispatch({ type: CART_REMOVE_ITEM, payload: item });
  };

  const updateCartHandler = (item, qty) => {
    const quantity = Number(qty);
    dispatch({type: CART_ADD_ITEM, payload: { ...item, quantity }})
  }

  return (
    <Layout title="Shopping Cart">
      <h1 className="mb-4 text-xl">Shopping Cart</h1>
      {cartItems.length === 0 ? (
        <div>
          Cart is empty.{' '}
          <Link href="/">
            <a className="text-blue-400">Go to main page</a>
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-4 md:gap-5">
          <div className="overflow-x-auto md:col-span-3">
            <table className="min-w-full">
              <thead className="border-b">
                <tr>
                  <th className="px-5 text-left">Item</th>
                  <th className="p-5 text-right">Quantity</th>
                  <th className="p-5 text-right">Price</th>
                  <th className="p-5">Action</th>
                </tr>
              </thead>

              <tbody>
                {cartItems.map((item) => (
                  <tr key={item.slug} className="border-b">
                    <td>
                      <Link href={`/product/${item.slug}`}>
                        <a className="flex items-center">
                          <Image
                            src={item.image}
                            alt={item.name}
                            width={50}
                            height={50}
                          />
                          &nbsp; &nbsp;
                          {item.name}
                        </a>
                      </Link>
                    </td>

                    <td className="p-5 text-right">
                      <select value={item.quantity} onChange={e => updateCartHandler(item, e.target.value)}>
                        {[...Array(item.countInStock).keys()].map(num => ( // this will make array of numbers, based on count number
                          <option key={num + 1} value={num + 1}>{num + 1}</option>
                        ))}
                      </select>
                    </td>

                    <td className="p-5 text-right">${item.price}</td>

                    <td className="p-5 text-center">
                      <button onClick={() => removeItemHandler(item)}>
                        <XIcon className="h-5 w-5"></XIcon>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="card p-5">
            <ul>
              <li>
                <div className="pb-3 text-xl">
                  Subtotal (
                  {cartItems.reduce((acc, item) => acc + item.quantity, 0)}) : $
                  {cartItems.reduce(
                    (acc, item) => acc + item.quantity * item.price,
                    0
                  )}
                </div>
              </li>
              <li>
                <button
                  className="primary-button w-full"
                  onClick={() => router.push('login?redirect=/shipping')} // if user is logged in, will redirect to shipping page
                >
                  Checkout
                </button>
              </li>
            </ul>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default dynamic(() => Promise.resolve(CartScreen), { ssr: false });
