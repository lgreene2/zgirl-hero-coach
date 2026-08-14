-- Z-Girl v3.5 entity-scoped authorization hardening
create or replace function private.zgirl_entity_institution(p_entity_type text,p_entity_id uuid)
returns uuid language plpgsql security definer
set search_path=pg_catalog,public,private
as $$
declare v_institution_id uuid;
begin
  case p_entity_type
    when 'institution' then select id into v_institution_id from public.zgirl_institutions where id=p_entity_id;
    when 'opportunity' then select institution_id into v_institution_id from public.zgirl_partner_opportunities where id=p_entity_id;
    when 'proposal' then select o.institution_id into v_institution_id from public.zgirl_partner_proposals p join public.zgirl_partner_opportunities o on o.id=p.opportunity_id where p.id=p_entity_id;
    when 'followup' then select o.institution_id into v_institution_id from public.zgirl_partner_followups f join public.zgirl_partner_opportunities o on o.id=f.opportunity_id where f.id=p_entity_id;
    when 'contact' then select o.institution_id into v_institution_id from public.zgirl_partner_contacts c join public.zgirl_partner_opportunities o on o.id=c.opportunity_id where c.id=p_entity_id;
    when 'activity' then select o.institution_id into v_institution_id from public.zgirl_partner_activities a join public.zgirl_partner_opportunities o on o.id=a.opportunity_id where a.id=p_entity_id;
    when 'workflow' then select institution_id into v_institution_id from public.zgirl_institution_workflows where id=p_entity_id;
    when 'handoff' then select institution_id into v_institution_id from public.zgirl_institution_delivery_handoffs where id=p_entity_id;
    when 'license' then select institution_id into v_institution_id from public.zgirl_institution_licenses where id=p_entity_id;
    when 'allocation' then select l.institution_id into v_institution_id from public.zgirl_institution_seat_allocations a join public.zgirl_institution_licenses l on l.id=a.license_id where a.id=p_entity_id;
    when 'site' then select institution_id into v_institution_id from public.zgirl_institution_sites where id=p_entity_id;
    when 'agreement' then select institution_id into v_institution_id from public.zgirl_institution_agreements where id=p_entity_id;
    else raise exception 'invalid_scope_entity';
  end case;
  if v_institution_id is null then raise exception 'scope_entity_not_found'; end if;
  return v_institution_id;
end; $$;
revoke all on function private.zgirl_entity_institution(text,uuid) from public,anon,authenticated;

create or replace function public.zgirl_identity_authorize_entity(p_session_token text,p_capability text,p_entity_type text,p_entity_id uuid)
returns jsonb language plpgsql security definer
set search_path=pg_catalog,public,private
as $$
declare v_institution_id uuid;
begin
  perform private.zgirl_credential_require_session(p_session_token);
  v_institution_id:=private.zgirl_entity_institution(p_entity_type,p_entity_id);
  return private.zgirl_operator_require_capability(p_session_token,p_capability,v_institution_id) || jsonb_build_object('institutionId',v_institution_id);
end; $$;
revoke all on function public.zgirl_identity_authorize_entity(text,text,text,uuid) from public;
grant execute on function public.zgirl_identity_authorize_entity(text,text,text,uuid) to anon,authenticated;
