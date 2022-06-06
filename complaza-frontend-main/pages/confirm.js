import React from "react"
import { useRouter } from "next/router"
import Session from "../components/session"
import { CONFIRM } from "../components/session/form"

function Confirm() {
  const router = useRouter()
  const { email } = router.query

  const onSuccess = () => router.push("/login")
  return <Session type={CONFIRM} initialEmail={email} onSuccess={onSuccess} />
}

export default Confirm
