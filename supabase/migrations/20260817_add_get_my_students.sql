create or replace function public.get_my_students()
returns table (
  student_id uuid,
  student_name text,
  linked_at timestamptz
)
language sql
security definer
set search_path = ''
as $$
  select
    student.id,
    student.full_name,
    relationship.created_at
  from public.trainer_students as relationship
  join public.profiles as student
    on student.id = relationship.student_id
  where relationship.trainer_id = auth.uid()
  order by relationship.created_at desc;
$$;

revoke all
on function public.get_my_students()
from public;

grant execute
on function public.get_my_students()
to authenticated;