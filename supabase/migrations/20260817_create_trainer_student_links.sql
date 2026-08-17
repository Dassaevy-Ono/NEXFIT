alter table public.profiles
add column if not exists personal_code text;

create unique index if not exists
profiles_personal_code_unique
on public.profiles (personal_code)
where personal_code is not null;

create or replace function public.set_personal_code()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.role = 'trainer'
    and new.personal_code is null then

    loop
      new.personal_code :=
        upper(
          substring(
            md5(
              random()::text ||
              clock_timestamp()::text ||
              new.id::text
            ),
            1,
            8
          )
        );

      exit when not exists (
        select 1
        from public.profiles
        where personal_code = new.personal_code
      );
    end loop;
  end if;

  if new.role <> 'trainer' then
    new.personal_code := null;
  end if;

  return new;
end;
$$;

drop trigger if exists
set_personal_code_before_save
on public.profiles;

create trigger set_personal_code_before_save
before insert or update of role
on public.profiles
for each row
execute procedure public.set_personal_code();

update public.profiles
set role = role
where role = 'trainer'
and personal_code is null;

create table if not exists public.trainer_students (
  id uuid primary key default gen_random_uuid(),

  trainer_id uuid not null
    references public.profiles(id)
    on delete cascade,

  student_id uuid not null
    references public.profiles(id)
    on delete cascade,

  created_at timestamptz not null default now(),

  constraint trainer_students_different_users
    check (trainer_id <> student_id),

  constraint trainer_students_unique_student
    unique (student_id)
);

alter table public.trainer_students
enable row level security;

drop policy if exists
"Trainer and student can view relationship"
on public.trainer_students;

create policy
"Trainer and student can view relationship"
on public.trainer_students
for select
using (
  auth.uid() = trainer_id
  or auth.uid() = student_id
);

drop policy if exists
"Student can remove relationship"
on public.trainer_students;

create policy
"Student can remove relationship"
on public.trainer_students
for delete
using (auth.uid() = student_id);

drop policy if exists
"Trainer can remove relationship"
on public.trainer_students;

create policy
"Trainer can remove relationship"
on public.trainer_students
for delete
using (auth.uid() = trainer_id);

create or replace function public.connect_to_trainer(
  code text
)
returns table (
  trainer_id uuid,
  trainer_name text
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  found_trainer_id uuid;
  found_trainer_name text;
  current_role text;
begin
  select role
  into current_role
  from public.profiles
  where id = auth.uid();

  if current_role <> 'student' then
    raise exception
      'Somente alunos podem usar um código de personal.';
  end if;

  select id, full_name
  into found_trainer_id, found_trainer_name
  from public.profiles
  where role = 'trainer'
  and upper(personal_code) = upper(trim(code));

  if found_trainer_id is null then
    raise exception
      'Código de personal inválido.';
  end if;

  if exists (
    select 1
    from public.trainer_students
    where student_id = auth.uid()
  ) then
    raise exception
      'Você já está vinculado a um personal.';
  end if;

  insert into public.trainer_students (
    trainer_id,
    student_id
  )
  values (
    found_trainer_id,
    auth.uid()
  );

  return query
  select
    found_trainer_id,
    found_trainer_name;
end;
$$;

revoke all
on function public.connect_to_trainer(text)
from public;

grant execute
on function public.connect_to_trainer(text)
to authenticated;

create or replace function public.get_my_trainer()
returns table (
  trainer_id uuid,
  trainer_name text
)
language sql
security definer
set search_path = ''
as $$
  select
    trainer.id,
    trainer.full_name
  from public.trainer_students as relationship
  join public.profiles as trainer
    on trainer.id = relationship.trainer_id
  where relationship.student_id = auth.uid()
  limit 1;
$$;

revoke all
on function public.get_my_trainer()
from public;

grant execute
on function public.get_my_trainer()
to authenticated;