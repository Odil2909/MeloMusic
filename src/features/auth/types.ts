export interface AuthActionState {
  error: string | null;
  success: string | null;
}

export const EMPTY_AUTH_ACTION_STATE: AuthActionState = {
  error: null,
  success: null,
};
