function AuthGuard({ user, fallback = null, children }) {
  if (!user) return fallback;
  return children;
}

export default AuthGuard;
