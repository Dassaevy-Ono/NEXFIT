alter table public.profiles
add column if not exists onboarding_completed boolean
not null default false;

update public.profiles as profile
set onboarding_completed =
  auth_user.raw_user_meta_data ? 'role'
from auth.users as auth_user
where profile.id = auth_user.id;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  selected_role text;
  has_selected_role boolean;
begin
  has_selected_role :=
    new.raw_user_meta_data ? 'role';

  selected_role :=
    coalesce(
      new.raw_user_meta_data ->> 'role',
      'student'
    );

  if selected_role not in ('student', 'trainer') then
    selected_role := 'student';
    has_selected_role := false;
  end if;

  insert into public.profiles (
    id,
    full_name,
    role,
    onboarding_completed
  )
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data ->> 'full_name',
      new.raw_user_meta_data ->> 'name',
      ''
    ),
    selected_role,
    has_selected_role
  );

  return new;
end;
$$;