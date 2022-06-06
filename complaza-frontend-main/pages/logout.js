import React, { useEffect, useContext } from "react"
import { useRouter } from "next/router"
import { signOut, getCurrentUser } from "../lib/auth"
import AuthContext from "../context/auth"

function Logout() {
  const router = useRouter()
  const { setCurrentUser, isLoggedIn } = useContext(AuthContext)

  if (isLoggedIn) {
    router.push(
      {
        pathname: "/",
        query: {
          hint: "You are not logged in",
          type: "warning",
        },
      },
      "/"
    )
  }

  useEffect(() => {
    signOut().then(async () => {
      await getCurrentUser().then(setCurrentUser)

      router.push(
        {
          pathname: "/",
          query: {
            hint: "You've logged out",
            type: "success",
          },
        },
        "/"
      )
    })
  }, [router, setCurrentUser])

  return <div>Logout</div>
}

export default Logout
