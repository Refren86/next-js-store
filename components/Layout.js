import Link from 'next/link';
import Head from 'next/head';
import { useSession } from 'next-auth/react';
import React, { useContext, useEffect, useState } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { Store } from '../utils/Store';

// general wrapper for all content
const Layout = ({ title, children }) => {
  const { status, data: session } = useSession(); // status shows the loading status of session
  const { state } = useContext(Store);
  const { cart } = state;

  const [cartItemsCount, setCartItemsCount] = useState(0);

  useEffect(() => {
    setCartItemsCount(
      cart.cartItems.reduce((acc, item) => acc + item.quantity, 0)
    );
  }, [cart.cartItems]);

  return (
    <>
      <Head>
        <title>{title ? title + ' - Refren Shop' : 'Refren Shop'}</title>
        <meta name="description" content="E-commerce Website" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <ToastContainer position="bottom-center" limit={1} />

      <div className="flex justify-between flex-col min-h-screen">
        <header>
          <nav className="flex h-12 px-4 items-center justify-between shadow-md">
            <Link href="/">
              <a className="text-lg font-bold">Refren</a>
            </Link>

            <div>
              <Link href="/cart">
                <a className="p-2">
                  Cart
                  {cartItemsCount > 0 && (
                    <span className="ml-1 rounded-full bg-red-600 px-2 py-1 text-xs font-bold text-white">
                      {cartItemsCount}
                    </span>
                  )}
                </a>
              </Link>
              {status === 'loading' ? (
                'Loading...'
              ) : session?.user ? (
                session.user.name
              ) : (
                <Link href="/login">
                  <a className="p-2">Login</a>
                </Link>
              )}
            </div>
          </nav>
        </header>

        <main className="container m-auto mt-4 px-4">{children}</main>

        <footer className="flex h-10 justify-center items-center shadow-inner">
          <p>Copyright &copy; 2022 Refren Shop</p>
        </footer>
      </div>
    </>
  );
};

export default Layout;
