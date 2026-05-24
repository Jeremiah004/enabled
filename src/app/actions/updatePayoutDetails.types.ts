export type PayoutDetailsState = {
  error: string | null;
  success: boolean;
};

export const payoutDetailsInitialState: PayoutDetailsState = {
  error: null,
  success: false,
};
