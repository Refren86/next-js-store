import '../styles/globals.css';
import { StoreProvider } from '../utils/Store';
import { SessionProvider, useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { PayPalScriptProvider } from '@paypal/react-paypal-js';

function MyApp({ Component, pageProps: { session, ...pageProps } }) {
  return (
    <SessionProvider session={session}>
      <StoreProvider>
        <PayPalScriptProvider deferLoading={true}> {/* with defer loading, I can set loading for paypal operations manually */}
          {Component.auth ? (
            <Auth>
              <Component {...pageProps} />
            </Auth>
          ) : (
            <Component {...pageProps} />
          )}
        </PayPalScriptProvider>
      </StoreProvider>
    </SessionProvider>
  );
}

// wrapper component (hoc) which will check whether user is logged in before rendering component
function Auth({ children }) {
  const router = useRouter();

  const { status } = useSession({
    required: true,
    onUnauthenticated() {
      router.push('/unauthorized?message=Login required'); // will redirect to unauthorized page
    },
  });

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  return children;
}

export default MyApp;
