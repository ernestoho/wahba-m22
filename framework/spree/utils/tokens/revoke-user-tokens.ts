import type { GraphQLFetcherResult } from '@commerce/api'
import type { HookFetcherContext } from '@commerce/utils/types'
import TokensNotRejectedError from '@framework/errors/TokensNotRejectedError'
import type { UserOAuthTokens } from '@framework/types'
import type { EmptyObjectResponse } from '@spree/storefront-api-v2-sdk/types/interfaces/EmptyObject'

const revokeUserTokens = async (
  fetch: HookFetcherContext<{
    data: any
  }>['fetch'],
  userTokens: UserOAuthTokens
): Promise<void> => {
  const spreeRevokeTokensResponses = await Promise.allSettled([
    fetch<GraphQLFetcherResult<EmptyObjectResponse>>({
      variables: {
        methodPath: 'authentication.revokeToken',
        arguments: [
          {
            token: userTokens.refreshToken,
          },
        ],
      },
    }),
    fetch<GraphQLFetcherResult<EmptyObjectResponse>>({
      variables: {
        methodPath: 'authentication.revokeToken',
        arguments: [
          {
            token: userTokens.accessToken,
          },
        ],
      },
    }),
  ])

  const anyRejected = spreeRevokeTokensResponses.some(
    (response) => response.status === 'rejected'
  )

  if (anyRejected) {
    throw new TokensNotRejectedError(
      'Some tokens could not be rejected in Spree.'
    )
  }

  return undefined
}

export default revokeUserTokens
