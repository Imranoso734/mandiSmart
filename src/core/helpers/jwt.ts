import jwt, { JSONMap } from "njwt"

export const JWT = {
  /**
   * Yahan se signed JWT generate hota hai.
   */
  async generate(
    secret: string,
    claims: JSONMap,
    expiryInMinutes?: number,
  ): Promise<{ token: string; expiry: number }> {
    const token = jwt.create(claims, secret)
    const expiry = expiryInMinutes
      ? new Date().getTime() + 60 * 1000 * expiryInMinutes
      : 0

    token.setExpiration(expiry)

    return {
      token: token.compact(),
      expiry,
    }
  },

  /**
   * Yahan invalid token par undefined return karte hain.
   */
  async validate<T>(secret: string, token: string): Promise<T | undefined> {
    try {
      return jwt.verify(token, secret)?.body as T
    } catch (_error) {
      return undefined
    }
  },
}
