import React, { useState, useEffect, useContext, useCallback } from "react"
import { useRouter } from "next/router"

import AuthContext from "../context/auth"

const useProtectedRoute = () => {
  const { isLoggedIn, userLoaded } = useContext(AuthContext)
  const router = useRouter()

  useEffect(() => {
    if (!isLoggedIn && userLoaded) {
      router.push(
        {
          pathname: "/login",
          query: {
            hint: "Please log in first",
            type: "warning",
          },
        },
        "/login"
      )
    }
  }, [router, isLoggedIn, userLoaded])

  return !isLoggedIn && userLoaded
}

export default useProtectedRoute
