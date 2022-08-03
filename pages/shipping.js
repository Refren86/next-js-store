import React, { useContext, useEffect } from 'react';
import { useForm } from 'react-hook-form';

import Layout from '../components/Layout';
import CheckoutWizard from '../components/CheckoutWizard';

import { Store } from '../utils/Store';
import { SAVE_SHIPPING_ADDRESS } from '../utils/consts/cart.types';
import Cookies from 'js-cookie';
import { useRouter } from 'next/router';

const ShippingScreen = () => {
  const { state, dispatch } = useContext(Store);
  const { cart } = state;
  const { shippingAddress } = cart;

  const router = useRouter();

  const {
    handleSubmit,
    register,
    formState: { errors },
    setValue,
    getValues,
  } = useForm();

  // on load, get data from storage and fill the input fields with it
  useEffect(() => {
    setValue('fullName', shippingAddress.fullName);
    setValue('address', shippingAddress.address);
    setValue('city', shippingAddress.city);
    setValue('postalCode', shippingAddress.postalCode);
    setValue('country', shippingAddress.country);
  }, [shippingAddress])

  const submitHandler = ({ fullName, address, city, postalCode, country }) => {
    dispatch({
      type: SAVE_SHIPPING_ADDRESS,
      payload: { fullName, address, city, postalCode, country },
    });

    Cookies.set(
      'cart',
      JSON.stringify({
        ...cart,
        shippingAddress: {
          fullName,
          address,
          city,
          postalCode,
          country,
        },
      })
    );

    router.push('/payment');
  };

  return (
    <Layout title="Shipping">
      <CheckoutWizard activeStep={1} />
      <form
        className="mx-auto max-w-screen-md"
        onSubmit={handleSubmit(submitHandler)}
      >
        <h2 className="mb-4 text-xl">Shipping Address</h2>

        <div className="mb-4">
          <label htmlFor="fullName">Full Name</label>
          <input
            className="w-full"
            id="fullName"
            autoFocus
            {...register('fullName', {
              required: 'Please provide full name',
            })}
          />
          {errors.fullName && (
            <div className="text-red-500 mt-1">{errors.fullName.message}</div>
          )}
        </div>

        <div className="mb-4">
          <label htmlFor="address">Address</label>
          <input
            className="w-full"
            id="address"
            {...register('address', {
              required: 'Please provide address',
              minLength: { value: 3, message: 'Address should contain more than 2 characters' }
            })}
          />
          {errors.address && (
            <div className="text-red-500 mt-1">{errors.address.message}</div>
          )}
        </div>

        <div className="mb-4">
          <label htmlFor="address">City</label>
          <input
            className="w-full"
            id="city"
            {...register('city', {
              required: 'Please provide city',
            })}
          />
          {errors.city && (
            <div className="text-red-500 mt-1">{errors.city.message}</div>
          )}
        </div>

        <div className="mb-4">
          <label htmlFor="address">Postal Code</label>
          <input
            className="w-full"
            id="postalCode"
            {...register('postalCode', {
              required: 'Please provide postal code',
            })}
          />
          {errors.postalCode && (
            <div className="text-red-500 mt-1">{errors.postalCode.message}</div>
          )}
        </div>

        <div className="mb-4">
          <label htmlFor="address">Country</label>
          <input
            className="w-full"
            id="country"
            {...register('country', {
              required: 'Please provide country',
            })}
          />
          {errors.country && (
            <div className="text-red-500 mt-1">{errors.country.message}</div>
          )}
        </div>

        <div className='mb-4 flex justify-between'>
          <button className='primary-button'>Next</button>
        </div>
      </form>
    </Layout>
  );
};

ShippingScreen.auth = true; // only logged in user will be able to access this page

export default ShippingScreen;
