-- Run once in your own Supabase project's SQL editor.
-- Public viewing is intentional. Only approved, authenticated editors may write.
begin;
create table if not exists public.editors (
 user_id uuid primary key references auth.users(id) on delete cascade
);
alter table public.editors enable row level security;
revoke all on public.editors from anon, authenticated;
grant select on public.editors to authenticated;
create policy "Read own approval" on public.editors for select to authenticated using (user_id=auth.uid());
create table if not exists public.workbook (
 id integer primary key check(id=1),
 payload jsonb not null,
 version integer not null default 1,
 updated_at timestamptz not null default now(),
 updated_by uuid references auth.users(id)
);
alter table public.workbook enable row level security;
revoke all on public.workbook from anon, authenticated;
grant select on public.workbook to anon, authenticated;
create policy "Everyone may view workbook" on public.workbook for select to anon, authenticated using (true);
insert into public.workbook(id,payload) values (1,'{"source":"Ortak kayıt","importedAt":null,"sites":[]}'::jsonb) on conflict do nothing;
create table if not exists public.workbook_history (
 version integer primary key, payload jsonb not null,
 saved_at timestamptz not null default now(), saved_by uuid not null references auth.users(id)
);
alter table public.workbook_history enable row level security;
revoke all on public.workbook_history from anon,authenticated;
-- Writes are possible only through this version-checked, transactional function.
create or replace function public.save_workbook(expected_version integer, new_payload jsonb)
returns setof public.workbook language plpgsql security definer set search_path=public,pg_temp as $$
declare saved public.workbook;
begin
 if auth.uid() is null or not exists(select 1 from public.editors where user_id=auth.uid()) then
  raise exception 'Duzenleme yetkiniz yok' using errcode='42501';
 end if;
 if new_payload is null or jsonb_typeof(new_payload) <> 'object' or jsonb_typeof(new_payload->'sites') is distinct from 'array' or octet_length(new_payload::text)>10000000 then
  raise exception 'Gecersiz veri' using errcode='22023';
 end if;
 if exists(select 1 from jsonb_array_elements(new_payload->'sites') s where jsonb_typeof(s) <> 'object' or jsonb_typeof(s->'tasks') is distinct from 'array' or coalesce(s->>'id','')='') then
  raise exception 'Gecersiz santiye' using errcode='22023';
 end if;
 update public.workbook set payload=new_payload,version=version+1,updated_at=now(),updated_by=auth.uid()
 where id=1 and version=expected_version returning * into saved;
 if not found then raise exception 'Baska bir kullanici kaydetti. Yenileyip tekrar deneyin.' using errcode='40001'; end if;
 insert into public.workbook_history(version,payload,saved_by) values(saved.version,saved.payload,auth.uid());
 return next saved;
end $$;
revoke all on function public.save_workbook(integer,jsonb) from public, anon;
grant execute on function public.save_workbook(integer,jsonb) to authenticated;
commit;
-- After creating an editor user in Authentication > Users, approve their User UID:
-- insert into public.editors(user_id) values ('USER_UUID');
-- To revoke write access:
-- delete from public.editors where user_id='USER_UUID';
