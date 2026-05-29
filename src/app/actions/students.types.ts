export type CreateStudentState = {
  error: string | null;
  success: boolean;
};

export const createStudentInitialState: CreateStudentState = {
  error: null,
  success: false,
};
