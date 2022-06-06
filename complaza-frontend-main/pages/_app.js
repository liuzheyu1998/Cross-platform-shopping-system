import { useEffect, useState, useMemo } from "react"
import { useRouter } from "next/router"
import { message, Layout } from "antd"
import Head from "next/head"
import "../styles/globals.css"
import "../styles/main.css"
import Amplify from "aws-amplify"
import Navbar from "../components/navbar"
import AuthContext from "../context/auth"
import { getCurrentUser } from "../lib/auth"
import awsconfig from "../src/aws-exports"

const { Content } = Layout

Amplify.configure({
  ...awsconfig,
  ssr: true,
  API: {
    endpoints: [
      {
        name: "default",
        // TODO: consider moving it to env vars and/or auto grep from stack
        endpoint: "https://v9ijm7vojg.execute-api.us-east-1.amazonaws.com/stage1",
      },
    ],
  },
})

function App({ Component, pageProps }) {
  const [currentUser, setCurrentUser] = useState({})
  const router = useRouter()
  const { hint, type } = router.query

  useEffect(() => {
    getCurrentUser().then(setCurrentUser)
  }, [])

  useEffect(() => {
    if (hint) {
      message[type](hint)
    }
  }, [hint, type, router.pathname])

  const authContext = useMemo(() => ({ ...currentUser, setCurrentUser }), [currentUser])
  return (
    <>
      <Head>
        <title>Complaza</title>
        <meta name="description" content="Compare products!" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <AuthContext.Provider value={authContext}>
        <Layout>
          <Navbar />
          <Content className="tw-px-4 sm:tw-px-8 tw-mt-24 tw-h-full">
            <Component {...pageProps} />
          </Content>
        </Layout>
      </AuthContext.Provider>
    </>
  )
}

export default App
