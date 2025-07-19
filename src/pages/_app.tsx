import React, { useEffect } from 'react';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import '../styles/tailwind.css';
import '../styles/nutrilens-pro.css';
import '../styles/nutrilens.css';
import '../styles/nutrilens-new.css';
import '../styles/nutrilens-dark-v2.css';

// Cache buster version - changes every deploy
const BUILD_ID = `v${Date.now()}`

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>VitalMatrix - Healthcare Insights</title>
        <meta name="description" content="VitalMatrix - Transforming healthcare decisions with community insights and AI nutrition intelligence" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        {/* Force browser to load fresh CSS with cache busting */}
        <link rel="stylesheet" href={`/styles/nutrilens-pro.css?${BUILD_ID}`} />
        <link rel="stylesheet" href={`/styles/nutrilens.css?${BUILD_ID}`} />
        <link rel="stylesheet" href={`/styles/nutrilens-new.css?${BUILD_ID}`} />
      </Head>
      <Component {...pageProps} />
    </>
  );
}

export default MyApp;
