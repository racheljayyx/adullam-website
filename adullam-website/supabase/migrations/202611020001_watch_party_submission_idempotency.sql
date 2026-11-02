begin;

alter table public.watch_parties
  add column submission_key uuid;

create unique index watch_parties_submission_key_unique
  on public.watch_parties (submission_key)
  where submission_key is not null;

commit;
