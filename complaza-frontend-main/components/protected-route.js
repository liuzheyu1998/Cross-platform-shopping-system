import useProtectedRoute from "../hooks/use-protected-route"

function withProtectedRoute(Component) {
  return function ProtectedRoute() {
    const notAuthenticated = useProtectedRoute()
    if (notAuthenticated) {
      return <div />
    }
    return <Component />
  }
}

export default withProtectedRoute
