-- Paystack bank code for tutor payout profiles
alter table public.profiles
  add column if not exists bank_code text;
