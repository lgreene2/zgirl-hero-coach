-- Z-Girl v3.11 pilot scope + evidence permission controls.
-- This stores implementation-scope metadata only. GLS remains contractual/commercial source of truth.

create or replace function public.zgirl_pilot_save_scope_metadata(
 p_session_token text,p_pilot_id uuid,p_decision_maker_name text,p_decision_maker_role text,p_decision_maker_email text,
 p_participant_capacity integer,p_proposed_price_cents integer,p_currency text,p_planned_start_date date,p_planned_end_date date,p_renewal_date date,
 p_next_action text,p_next_action_due date)
returns boolean language plpgsql security definer set search_path=pg_catalog,public,private as $$
declare v_context jsonb; begin
 v_context:=private.zgirl_pilot_require(p_session_token,p_pilot_id,'pilot.write');
 if p_participant_capacity is null or p_participant_capacity<1 or p_participant_capacity>100000 then raise exception 'invalid_pilot_capacity'; end if;
 if p_proposed_price_cents is not null and (p_proposed_price_cents<0 or p_proposed_price_cents>1000000000) then raise exception 'invalid_pilot_price'; end if;
 if p_currency is null or upper(p_currency)!~'^[A-Z]{3}$' then raise exception 'invalid_currency'; end if;
 if p_planned_start_date is not null and p_planned_end_date is not null and p_planned_end_date<p_planned_start_date then raise exception 'invalid_pilot_dates'; end if;
 update public.zgirl_pilot_programs set
  decision_maker_name=nullif(trim(p_decision_maker_name),''),decision_maker_role=nullif(trim(p_decision_maker_role),''),decision_maker_email=nullif(lower(trim(p_decision_maker_email)),''),
  participant_capacity=p_participant_capacity,proposed_price_cents=p_proposed_price_cents,currency=upper(p_currency),planned_start_date=p_planned_start_date,planned_end_date=p_planned_end_date,
  renewal_date=p_renewal_date,next_action=nullif(trim(p_next_action),''),next_action_due=p_next_action_due,updated_at=now()
 where id=p_pilot_id;
 if not found then raise exception 'pilot_not_found'; end if;
 return true;
end; $$;

grant execute on function public.zgirl_pilot_save_scope_metadata(text,uuid,text,text,text,integer,integer,text,date,date,date,text,date) to anon,authenticated;

create or replace function public.zgirl_pilot_save_permissions(p_session_token text,p_pilot_id uuid,p_testimonial_status text,p_case_study_status text,p_reference_status text,p_funder_status text,p_permission_reference text,p_notes text)
returns boolean language plpgsql security definer set search_path=pg_catalog,public,private as $$ declare v_context jsonb; begin
 v_context:=private.zgirl_pilot_require(p_session_token,p_pilot_id,'pilot.evidence');
 if p_testimonial_status not in ('not_requested','requested','granted','declined','withdrawn')
  or p_case_study_status not in ('not_requested','requested','granted','declined','withdrawn')
  or p_reference_status not in ('not_requested','requested','granted','declined','withdrawn')
  or p_funder_status not in ('not_requested','requested','granted','declined','withdrawn','not_applicable') then raise exception 'invalid_pilot_permissions'; end if;
 if ('granted'=any(array[p_testimonial_status,p_case_study_status,p_reference_status,p_funder_status])) and nullif(trim(coalesce(p_permission_reference,'')),'') is null then raise exception 'pilot_permission_reference_required'; end if;
 update public.zgirl_pilot_permissions set testimonial_status=p_testimonial_status,case_study_status=p_case_study_status,reference_status=p_reference_status,funder_evidence_status=p_funder_status,permission_reference=nullif(trim(p_permission_reference),''),notes=nullif(trim(p_notes),''),updated_by_operator_id=private.zgirl_pilot_actor(v_context),updated_at=now() where pilot_id=p_pilot_id;
 if not found then raise exception 'pilot_not_found'; end if; return true;
end; $$;
