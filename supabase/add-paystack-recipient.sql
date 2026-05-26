-- Store Paystack transfer recipient code per tutor (created from bank details).
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS paystack_recipient_code text;

COMMENT ON COLUMN public.profiles.paystack_recipient_code IS
  'Paystack RCP_… code for bulk/single transfers; cleared when bank details change.';
