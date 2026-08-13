-- Z-Girl v3.5 role capability hardening
create or replace function private.zgirl_role_has_capability(p_role text,p_capability text)
returns boolean language sql immutable
set search_path=pg_catalog
as $$
 select case p_role
  when 'system_owner' then true
  when 'executive' then p_capability = any(array['identity.read','portfolio.read','portfolio.review','briefing.read','briefing.manage','briefing.delivery','pipeline.read','workflow.read','workflow.approve','workflow.release','license.read','credential.read','audit.read'])
  when 'institutional_admin' then p_capability = any(array['portfolio.read','portfolio.review','briefing.read','pipeline.read','pipeline.write','pipeline.handoff','workflow.read','workflow.write','workflow.approve','license.read','license.write','credential.read'])
  when 'pipeline_manager' then p_capability = any(array['portfolio.read','pipeline.read','pipeline.write','pipeline.handoff','workflow.read'])
  when 'credential_admin' then p_capability = any(array['portfolio.read','license.read','credential.read','credential.write','credential.issue','credential.status'])
  when 'auditor' then p_capability = any(array['identity.read','portfolio.read','briefing.read','pipeline.read','workflow.read','license.read','credential.read','audit.read'])
  else false end;
$$;
revoke all on function private.zgirl_role_has_capability(text,text) from public, anon, authenticated;
