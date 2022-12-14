import Image from 'next/image';
import Link from 'next/link';
import { toast } from 'react-toastify';
import { useRouter } from 'next/router';
import React, { useContext, useEffect, useState } from 'react';

import CheckoutWizard from '../components/CheckoutWizard';
import Layout from '../components/Layout';
import { Store } from '../utils/Store';
import { getError } from '../utils/error';
import axios from 'axios';
import { CART_CLEAR_ITEMS } from '../utils/consts/cart.types';
import Cookies from 'js-cookie';

// ALL PRICES IN $$$
const PlaceOrderScreen = () => {
  const router = useRouter();
  const { state, dispatch } = useContext(Store);
  const { cart } = state;
  const { cartItems, shippingAddress, paymentMethod } = cart;

  const [loading, setLoading] = useState(false);

  const totalValueOfCart = cartItems.reduce(
    (acc, item) => acc + item.quantity * item.price,
    0
  ); // subtotal (all quantities multiplied by price)
  const roundToHundredsDecimal = (num) =>
    Math.round(num * 100 + Number.EPSILON) / 100; // 123.4567 => 123.46 (add this to helpers!)

  const itemsPrice = roundToHundredsDecimal(totalValueOfCart); // price for all items in cart (without tax and shipping)
  const shippingPrice = itemsPrice > 200 ? 0 : 15;
  const taxPrice = roundToHundredsDecimal(itemsPrice * 0.15); // tax 15%
  const totalPrice = roundToHundredsDecimal(
    itemsPrice + shippingPrice + taxPrice
  );

  useEffect(() => {
    if (!paymentMethod) {
      router.push('/payment');
    }
  }, [paymentMethod]);

  const placeOrderHandler = async () => {
    try {
      setLoading(true);

      const { data } = await axios.post('/api/orders', {
        orderItems: cartItems,
        shippingAddress,
        paymentMethod,
        itemsPrice,
        shippingPrice,
        taxPrice,
        totalPrice,
      });

      setLoading(false);
      dispatch({ type: CART_CLEAR_ITEMS });

      // keep payment method and ship. address, but remove all items from cart
      Cookies.set(
        'cart',
        JSON.stringify({
          ...cart,
          cartItems: [],
        })
      );

      router.push(`/order/${data._id}`); // redirect to order page
    } catch (err) {
      setLoading(false);
      toast.error(getError(err));
    }
  };

  console.log(cartItems);

  return (
    <Layout title="Place Order">
      <CheckoutWizard activeStep={3} />
      <h2 className="mb-4 text-xl">Place Order</h2>
      {cartItems.length === 0 ? (
        <div>
          Cart is empty.
          <Link href="/">
            <a className="text-blue-400">Go shopping</a>
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-4 md:gap-5">
          <div className="overflow-x-auto md:col-span-3">
            <div className="card p-5">
              <h2 className="mb-2 text-lg">Shipping Address</h2>
              <div>
                {shippingAddress.fullName}, {shippingAddress.address},{' '}
                {shippingAddress.city}, {shippingAddress.postalCode},{' '}
                {shippingAddress.country}
              </div>
              <div>
                <Link href="/shipping">
                  <a className="text-blue-400">Edit address</a>
                </Link>
              </div>
            </div>

            <div className="card p-5">
              <h2 className="mb-2 text-lg">Payment Method</h2>
              <div>{paymentMethod}</div>
              <div>
                <Link href="/payment">
                  <a className="text-blue-400">Change payment</a>
                </Link>
              </div>
            </div>

            <div className="card overflow-x-auto p-5">
              <h2 className="mb-2 text-lg">Order Items</h2>
              <table className="min-w-full">
                <thead className="border-b">
                  <tr>
                    <th className="px-5 text-left">Item</th>
                    <th className="p-5 text-right">Quantity</th>
                    <th className="p-5 text-right">Price</th>
                    <th className="p-5 text-right">Subtotal</th>
                  </tr>
                </thead>

                <tbody>
                  {cartItems.map((item) => (
                    <tr key={item._id} className="border-b">
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
                      <td className="p-5 text-right">{item.quantity}</td>
                      <td className="p-5 text-right">${item.price}</td>
                      <td className="p-5 text-right">
                        ${item.quantity * item.price}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div>
                <Link href="/cart">
                  <a className="text-blue-400">Edit cart</a>
                </Link>
              </div>
            </div>
          </div>
          <div className="card p-5">
            <h2 className="mb-2 text-lg">Order Summary</h2>
            <ul>
              <li>
                <div className="mb-2 flex justify-between">
                  <div>Items</div>
                  <div>${itemsPrice}</div>
                </div>
              </li>

              <li>
                <div className="mb-2 flex justify-between">
                  <div>Shipping</div>
                  <div>${shippingPrice}</div>
                </div>
              </li>

              <li>
                <div className="mb-2 flex justify-between">
                  <div>Tax</div>
                  <div>${taxPrice}</div>
                </div>
              </li>

              <li>
                <div className="mb-2 flex justify-between">
                  <div>Total</div>
                  <div>${totalPrice}</div>
                </div>
              </li>

              <li>
                <button
                  disabled={loading}
                  onClick={placeOrderHandler}
                  className="primary-button w-full"
                >
                  {loading ? 'Loading...' : 'Place Order'}
                </button>
              </li>
            </ul>
          </div>
        </div>
      )}
    </Layout>
  );
};

PlaceOrderScreen.auth = true; // only logged in user will be able to access this page

export default PlaceOrderScreen;
