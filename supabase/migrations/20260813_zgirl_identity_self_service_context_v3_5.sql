-- Z-Girl v3.5 named operator self-service context
create or replace function public.zgirl_identity_session_context(p_session_token text)
returns jsonb language plpgsql security definer
set search_path=pg_catalog,public,private
as $$
begin
  return private.zgirl_operator_context(p_session_token);
end; $$;
revoke all on function public.zgirl_identity_session_context(text) from public;
grant execute on function public.zgirl_identity_session_context(text) to anon,authenticated;
