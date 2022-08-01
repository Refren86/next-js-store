import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useEffect } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';

import { getError } from '../utils/error';
import Layout from '../components/Layout';

const LoginScreen = () => {
  const { data: session } = useSession(); // hook provided by nextAuth to get the session data
  const router = useRouter();

  const { redirect } = router.query;

  useEffect(() => {
    // check if user is logged in (session?.user gets its value from signIn function)
    if (session?.user) {
      router.push(redirect || '/'); // if there is no redirect in query string, redirect to main page
    }
  }, [router, session, redirect])

  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm();

  const submitHandler = async(data) => {
    try {
      const { email, password } = data;
      
      // 1st param - the way we're going to authenticate (its provider, can be google, github etc.); 2nd param - user credentials;
      // this function will be handled by NextAuth
      const result = await signIn('credentials', {
        redirect: false, // turning off redirect, because we'll redirect user manually after login
        email,
        password
      })

      // handling error in API
      if (result.error) {
        toast.error(result.error)
      }
    } catch (err) {
      toast.error(getError(err))
    }
    
  }

  return (
    <Layout title="login">
      <form
        className="mx-auto max-w-screen-md"
        onSubmit={handleSubmit(submitHandler)}
      >
        <h2 className="mb-4 text-xl">Login</h2>
        <div className="mb-4">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            {...register('email', {
              required: 'Please enter email',
              pattern: {
                value: /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$/i,
                message: 'Please enter valid email',
              },
            })}
            className="w-full"
            id="email"
            autoFocus
          />
          {errors.email && (
            <div className="text-red-500">{errors.email.message}</div>
          )}
        </div>

        <div className="mb-4">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            {...register('password', { required: 'Please enter password', minLength: { value: 3, message: 'Weak password' } })}
            className="w-full"
            id="password"
          />
          {errors.password && (
            <div className="text-red-500">{errors.password.message}</div>
          )}
        </div>

        <div className="mb-4">
          <button type='submit' className="primary-button">Login</button>
        </div>

        <div className="mb-4">
          Don't have an account? &nbsp;
          <Link href="/register">
            <a className="text-blue-400">Create an account</a>
          </Link>
        </div>
      </form>
    </Layout>
  );
};

export default LoginScreen;
