// Helper to get Clerk token outside of React components
let tokenGetter = null;

export function setTokenGetter(getter) {
  tokenGetter = getter;
}

export async function getClerkToken() {
  if (tokenGetter) {
    return await tokenGetter();
  }
  return null;
}

