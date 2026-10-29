begin;

alter table public.watch_parties
  drop constraint watch_parties_private_address_check,
  add constraint watch_parties_private_address_check check (
    private_address is null or char_length(private_address) <= 500
  );

commit;
