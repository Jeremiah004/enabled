export type LogSessionState = {
  error: string | null;
  success: boolean;
};

export const logSessionInitialState: LogSessionState = {
  error: null,
  success: false,
};
