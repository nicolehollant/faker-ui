export default defineNuxtRouteMiddleware(async (to) => {
  try {
    const { $auth } = useNuxtApp()
    if (!$auth.tokens.accessToken) {
      return
    }
    const tokens = await authApi.refresh(
      { refreshToken: $auth.tokens.refreshToken ?? undefined },
      $auth.tokens.accessToken
    )
    $auth.tokens.accessToken = tokens.accessToken
    $auth.tokens.refreshToken = tokens.refreshToken
    const account = await authApi.getAccount($auth.tokens.accessToken)
    if (!account?.checks?.isAuthorized) {
      return
    }
    $auth.account.value = account
    return
  } catch (error) {
    if (to.path === '/account/setup') {
      return
    }
  }
})
