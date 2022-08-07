import axios from 'axios';
import Link from 'next/link';
import React, { useEffect, useReducer } from 'react';
import Layout from '../components/Layout';

import {
  ORDERS_HISTORY_FETCH_ERROR,
  ORDERS_HISTORY_FETCH_START,
  ORDERS_HISTORY_FETCH_SUCCESS,
} from '../utils/consts/order.types';
import { getError } from '../utils/error';

const reducer = (state, action) => {
  const { type, payload } = action;

  switch (type) {
    case ORDERS_HISTORY_FETCH_START: {
      return { ...state, loading: true, error: '' };
    }
    case ORDERS_HISTORY_FETCH_SUCCESS: {
      return { ...state, loading: false, ordersHistory: payload, error: '' };
    }
    case ORDERS_HISTORY_FETCH_ERROR: {
      return { ...state, loading: false, error: payload };
    }

    default:
      return state;
  }
};

const OrderHistoryScreen = () => {
  const [{ loading, ordersHistory, error }, dispatch] = useReducer(reducer, {
    loading: true,
    ordersHistory: [],
    error: '',
  });

  useEffect(() => {
    const fetchOrdersHistory = async () => {
      try {
        dispatch({ type: ORDERS_HISTORY_FETCH_START });
        const { data } = await axios.get('/api/orders/history');
        dispatch({ type: ORDERS_HISTORY_FETCH_SUCCESS, payload: data });
      } catch (err) {
        dispatch({ type: ORDERS_HISTORY_FETCH_ERROR, payload: getError(err) });
      }
    };

    fetchOrdersHistory();
  }, []);

  return (
    <Layout title="Order History">
      <h2 className='mb-4 text-xl'>Order History</h2>
      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div className="alert-error">{error}/</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="border-b">
              <tr>
                <th className="p-5 text-left">ID</th>
                <th className="p-5 text-left">Date</th>
                <th className="p-5 text-left">Total</th>
                <th className="p-5 text-left">Paid</th>
                <th className="p-5 text-left">Delivered</th>
                <th className="p-5 text-left">Action</th>
              </tr>
            </thead>

            <tbody>
              {ordersHistory.map((order) => (
                <tr key={order._id} className="border-b">
                  <td className="p-5">{order._id.substring(18, 24)}</td>
                  {/* last 6 characters */}
                  <td className="p-5">
                    {order.createdAt.substring(0, 10)}
                  </td>
                  {/* only date, without time */}
                  <td className="p-5">{order.totalPrice}</td>
                  <td className="p-5">
                    {order.isPaid
                      ? `${order.paidAt.substring(0, 10)}`
                      : 'Not paid'}
                  </td>
                  <td className="p-5">
                    {order.deliveredAt
                      ? `${order.deliveredAt.substring(0, 10)}`
                      : 'Not delivered'}
                  </td>
                  <td className="p-5">
                    <Link href={`/order/${order._id}`} passHref>
                      <a className='text-blue-400'>Details</a>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Layout>
  );
};

OrderHistoryScreen.auth = true;

export default OrderHistoryScreen;
