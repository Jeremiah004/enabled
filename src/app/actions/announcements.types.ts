export type AnnouncementActionState = {
  error: string | null;
  success: boolean;
};

export const announcementActionInitialState: AnnouncementActionState = {
  error: null,
  success: false,
};
