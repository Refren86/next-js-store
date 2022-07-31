import Link from 'next/link';
import React from 'react';
import { useForm } from 'react-hook-form';

import Layout from '../components/Layout';

const LoginScreen = () => {
  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm();

  const submitHandler = (data) => {
    const { email, password } = data;
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
