import React from 'react';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import '../styles/tailwind.css';
import '../styles/nutrilens-pro.css';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>VitalMatrix - Healthcare Insights</title>
        <meta name="description" content="VitalMatrix - Transforming healthcare decisions with community insights and AI nutrition intelligence" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Component {...pageProps} />
    </>
  );
}

export default MyApp;
