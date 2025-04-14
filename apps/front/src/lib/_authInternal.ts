import { fetchClient } from "./api/fetchClient";
import type { UserType } from "./configureAuth"; // Import UserType if needed

export const getuserInfo = async (jwt: string): Promise<UserType | null> => {
  const userResponse = await fetchClient.GET("/v1/auth/me", {
    headers: {
      authorization: `Bearer ${jwt}`,
    },
  });
  if (userResponse.response.status >= 400 || !userResponse.data?.id) {
    console.log(userResponse.response.status);
    // throw new Error("Login failed");
    return null;
  }
  return userResponse.data
    ? { isAuth: !!userResponse.data.id, avatarUrl: "", ...userResponse.data }
    : null;
};

export async function handleUserResponse(jwt: string) {
  // Assuming AuthTokenStorage is still managed/exported by configureAuth.ts
  // If AuthTokenStorage needs to be here, it should be moved or imported too.
  // For now, let's assume loginFn/registerFn call setToken directly.
  // AuthTokenStorage.setToken(jwt); // This line might need adjustment depending on final logic
  const user = await getuserInfo(jwt);
  return user;
}
