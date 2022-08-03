import React from 'react';
import { useRouter } from 'next/router';

import Layout from '../components/Layout';

const UnauthorizedScreen = () => {
  const router = useRouter();
  const { message } = router.query;

  return (
    <Layout title="Unauthorized Page">
      <h2 className="text-xl">Access Denied</h2>

      {/* we're accessing message from query string, after being redirected */}
      {message && <div className="mb-4 text-red-500">{message}</div>}
    </Layout>
  );
};

export default UnauthorizedScreen;
