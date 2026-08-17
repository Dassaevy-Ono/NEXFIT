create or replace function public.connect_to_trainer(code text)
returns table (
  trainer_id uuid,
  trainer_name text
)
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_trainer_id uuid;
  v_trainer_name text;
  v_profile_role text;
begin
  select p.role
  into v_profile_role
  from public.profiles as p
  where p.id = auth.uid();

  if v_profile_role is null then
    raise exception 'Perfil do usuário não encontrado.';
  end if;

  if v_profile_role <> 'student' then
    raise exception
      'Somente alunos podem usar um código de personal.';
  end if;

  select
    p.id,
    p.full_name
  into
    v_trainer_id,
    v_trainer_name
  from public.profiles as p
  where p.role = 'trainer'
    and upper(p.personal_code) = upper(trim(code));

  if v_trainer_id is null then
    raise exception 'Código de personal inválido.';
  end if;

  if exists (
    select 1
    from public.trainer_students as ts
    where ts.student_id = auth.uid()
  ) then
    raise exception
      'Você já está vinculado a um personal.';
  end if;

  insert into public.trainer_students (
    trainer_id,
    student_id
  )
  values (
    v_trainer_id,
    auth.uid()
  );

  return query
  select
    v_trainer_id,
    v_trainer_name;
end;
$function$;

revoke all
on function public.connect_to_trainer(text)
from public;

grant execute
on function public.connect_to_trainer(text)
to authenticated;