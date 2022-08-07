import axios from 'axios';
import Link from 'next/link';
import Image from 'next/image';
import { toast } from 'react-toastify';
import { useRouter } from 'next/router';
import { useEffect, useReducer } from 'react';
import { PayPalButtons, usePayPalScriptReducer } from '@paypal/react-paypal-js';

import Layout from '../../components/Layout';
import {
  ORDER_FETCH_ERROR,
  ORDER_FETCH_START,
  ORDER_FETCH_SUCCESS,
} from '../../utils/consts/order.types';
import {
  PAYMENT_ERROR,
  PAYMENT_RESET,
  PAYMENT_START,
  PAYMENT_SUCCESS,
} from '../../utils/consts/payment.types';
import { getError } from '../../utils/error';

const reducer = (state, action) => {
  const { type, payload } = action;

  switch (type) {
    case ORDER_FETCH_START:
      return { ...state, loading: true, error: '' };
    case ORDER_FETCH_SUCCESS:
      return { ...state, order: payload, loading: false, error: '' };
    case ORDER_FETCH_ERROR:
      return { ...state, loading: false, error: payload };

    case PAYMENT_START:
      return { ...state, loadingPay: true };
    case PAYMENT_SUCCESS:
      return { ...state, successPay: true, loadingPay: false };
    case PAYMENT_ERROR:
      return { ...state, errorPay: payload, loadingPay: false };
    case PAYMENT_RESET:
      return { ...state, loadingPay: false, successPay: false, errorPay: '' };

    default:
      return state;
  }
};

// order/:id
const OrderScreen = () => {
  const { query } = useRouter();
  const orderId = query.id;

  // paypalDispatch - used to reset the options and set the client id for paypal
  const [{ isPending }, paypalDispatch] = usePayPalScriptReducer();

  const [{ loading, error, order, successPay, loadingPay }, dispatch] =
    useReducer(reducer, {
      loading: true,
      order: {},
      error: '',
    });

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        dispatch({ type: ORDER_FETCH_START });
        const { data } = await axios.get(`/api/orders/${orderId}`);
        dispatch({ type: ORDER_FETCH_SUCCESS, payload: data });
      } catch (err) {
        dispatch({ type: ORDER_FETCH_ERROR, payload: getError(err) });
      }
    };

    if (!order._id || (order._id && order._id !== orderId) || successPay) {
      fetchOrder();

      if (successPay) {
        dispatch({ type: 'PAY_RESET' });
      }
    } else {
      const loadPaypalScript = async () => {
        const { data: clientId } = await axios.get('/api/keys/paypal');

        paypalDispatch({
          type: 'resetOptions',
          value: {
            'client-id': clientId,
            currency: 'USD',
          },
        });

        paypalDispatch({ type: 'setLoadingStatus', value: 'pending' });
      };

      loadPaypalScript();
    }
  }, [orderId, successPay]);

  const {
    isDelivered,
    isPaid,
    itemsPrice,
    orderItems,
    paymentMethod,
    shippingAddress,
    shippingPrice,
    taxPrice,
    totalPrice,
    deliveredAt,
    paidAt,
  } = order;

  const createOrder = (data, actions) => {
    return actions.order
      .create({
        purchase_units: [
          {
            amount: { value: totalPrice },
          },
        ],
      })
      .then((orderID) => {
        return orderID;
      });
  };

  const onApprove = (data, actions) => {
    return actions.order.capture().then(async (details) => {
      try {
        console.log('ORDER DETAILS:', details);
        dispatch({ type: PAYMENT_START });
        const { data } = await axios.put(
          `/api/orders/${order._id}/pay`,
          details
        );
        dispatch({ type: PAYMENT_SUCCESS, payload: data });
        toast.success('Order is paid successfully 🥳');
      } catch (err) {
        dispatch({ type: PAYMENT_ERROR, payload: getError(err) });
        toast.error(getError(err));
      }
    });
  };

  const onError = (err) => {
    toast.error(getError(err));
  };

  console.log('PAID?', isPaid);

  return (
    <Layout title={`Order ${orderId}`}>
      <h2 className="mb-4 text-xl">Order {orderId}</h2>

      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div className="alert-error">{error}</div>
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

              {isDelivered ? (
                <div className="alert-success">Delivered at {deliveredAt}</div>
              ) : (
                <div className="alert-error">Not delivered</div>
              )}
            </div>

            <div className="card p-5">
              <h2 className="mb-2 text-lg">Payment Method</h2>
              <div>{paymentMethod}</div>

              {isPaid ? (
                <div className="alert-success">
                  Paid at {new Date(paidAt).toDateString()} - {new Date(paidAt).toLocaleTimeString()}
                </div>
              ) : (
                <div className="alert-error">Not paid</div>
              )}
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
                  {orderItems.map((item) => (
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
            </div>
          </div>

          <div>
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
                    <div>Tax</div>
                    <div>${taxPrice}</div>
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
                    <div>Total</div>
                    <div>${totalPrice}</div>
                  </div>
                </li>

                {/* isPending - checks for loading of paypal script in web application */}
                {!isPaid && (
                  <li>
                    {isPending ? (
                      <div>Loading...</div>
                    ) : (
                      <div className="w-full">
                        <PayPalButtons
                          createOrder={createOrder}
                          onApprove={onApprove}
                          onError={onError}
                        />
                      </div>
                    )}

                    {loadingPay && <div>Loading...</div>}
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

OrderScreen.auth = true;

export default OrderScreen;
