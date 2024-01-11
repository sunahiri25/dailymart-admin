import '@/styles/globals.css'

import { SessionProvider } from "next-auth/react"
import Head from 'next/head'

export default function App({
  Component, pageProps: { session, ...pageProps }
}) {
  return (
    <>
      <Head>
        <title>DailyMart Admin</title>
      </Head>
      <SessionProvider session={session}>
        <Component {...pageProps} />
      </SessionProvider>
    </>
  )
}