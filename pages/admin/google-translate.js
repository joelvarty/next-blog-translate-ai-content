import Head from 'next/head'
import dynamic from 'next/dynamic'

const GoogleTranslate = dynamic(
	() => import('../../components/admin/GoogleTranslate'),
	{ ssr: false }
  )

export default function Home() {
  return (
    <div className="">
      <Head>
        <title>Google Translate for Agility CMS (next js)</title>
        <meta name="description" content="Block Editor for Agility CMS" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="">
          <GoogleTranslate />
      </main>
    </div>
  )
}