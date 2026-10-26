-- One-time installation. Separate from the work tracking document.
begin;
create table if not exists public.concrete_program (
 id integer primary key check(id=1), rows jsonb not null default '[]',
 version integer not null default 1, synced_at timestamptz not null default now(), source text not null default ''
);
alter table public.concrete_program enable row level security;
revoke all on public.concrete_program from anon,authenticated;
grant select on public.concrete_program to anon,authenticated;
create policy "View concrete program" on public.concrete_program for select to anon,authenticated using(true);
insert into public.concrete_program(id) values(1) on conflict do nothing;
create table if not exists public.concrete_sync_access(id integer primary key check(id=1), token_hash text not null);
alter table public.concrete_sync_access enable row level security;
revoke all on public.concrete_sync_access from anon,authenticated;
create or replace function public.write_concrete(expected_version integer,new_rows jsonb,source_name text)
returns setof public.concrete_program language plpgsql security definer set search_path=public,pg_temp as $$
declare saved public.concrete_program;
begin
 if new_rows is null or jsonb_typeof(new_rows)<>'array' or octet_length(new_rows::text)>5000000 then raise exception 'Gecersiz beton verisi' using errcode='22023';end if;
 if exists(select 1 from jsonb_array_elements(new_rows) r where jsonb_typeof(r)<>'object' or coalesce(r->>'location','')='') then raise exception 'Ada parsel gerekli' using errcode='22023';end if;
 update public.concrete_program set rows=new_rows,version=version+1,synced_at=now(),source=left(source_name,300) where id=1 and version=expected_version returning * into saved;
 if not found then raise exception 'Beton programi degisti. Yenileyip tekrar deneyin.' using errcode='40001';end if;
 return next saved;
end $$;
revoke all on function public.write_concrete(integer,jsonb,text) from public,anon,authenticated;
create or replace function public.save_concrete(expected_version integer,new_rows jsonb,source_name text)
returns setof public.concrete_program language plpgsql security definer set search_path=public,pg_temp as $$
begin
 if auth.uid() is null or not exists(select 1 from public.editors where user_id=auth.uid()) then raise exception 'Yetki yok' using errcode='42501';end if;
 return query select * from public.write_concrete(expected_version,new_rows,source_name);
end $$;
revoke all on function public.save_concrete(integer,jsonb,text) from public,anon;
grant execute on function public.save_concrete(integer,jsonb,text) to authenticated;
create or replace function public.sync_concrete(sync_token text,expected_version integer,new_rows jsonb)
returns setof public.concrete_program language plpgsql security definer set search_path=public,pg_temp as $$
begin
 if sync_token is null or length(sync_token)<32 or not exists(select 1 from public.concrete_sync_access where id=1 and token_hash=encode(sha256(convert_to(sync_token,'UTF8')),'hex')) then raise exception 'Baglanti anahtari gecersiz' using errcode='42501';end if;
 return query select * from public.write_concrete(expected_version,new_rows,'Google E-Tablolar · Beton Programı');
end $$;
revoke all on function public.sync_concrete(text,integer,jsonb) from public;
grant execute on function public.sync_concrete(text,integer,jsonb) to anon,authenticated;
commit;
-- Separate step, run only when ready to configure Apps Script. It rotates the sync token:
-- with token as (select gen_random_uuid()::text || gen_random_uuid()::text as value),
-- saved as (insert into public.concrete_sync_access(id,token_hash) select 1,encode(sha256(convert_to(value,'UTF8')),'hex') from token on conflict(id) do update set token_hash=excluded.token_hash)
-- select value as beton_sync_token from token;
-- Keep the token in Google Apps Script properties, never GitHub or chat.
