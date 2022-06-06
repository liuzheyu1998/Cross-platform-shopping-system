import { Auth } from "aws-amplify"

export function signUp({ email, password }) {
  return Auth.signUp({
    username: email,
    password,
    attributes: {
      email,
    },
  })
}

export function confirmSignUp({ email, code }) {
  return Auth.confirmSignUp(email, code)
}

export function signIn({ email, password }) {
  return Auth.signIn(email, password)
}

export async function signOut() {
  return Auth.signOut()
}

export async function getCurrentUser() {
  try {
    const { attributes: userAttributes, username: userId } = await Auth.currentAuthenticatedUser()
    const data = await Auth.currentSession()
    const token = data.getIdToken().getJwtToken()

    return { ...userAttributes, token, userLoaded: true, isLoggedIn: token !== "", userId }
  } catch (error) {
    return { userLoaded: true }
  }
}
