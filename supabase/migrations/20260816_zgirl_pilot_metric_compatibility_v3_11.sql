-- Z-Girl v3.11 aggregate metric compatibility hardening.
-- If activitiesStarted is omitted, treat it as equal to activitiesCompleted rather than inventing zero started activity.

create or replace function public.zgirl_pilot_record_metrics(p_session_token text,p_pilot_id uuid,p_cohort_id uuid,p_snapshot_date date,p_source_type text,p_source_reference text,p_metrics jsonb,p_notes text)
returns uuid language plpgsql security definer set search_path=pg_catalog,public,private as $$
declare
 v_context jsonb; v_id uuid; v_capacity integer;
 v_invited integer:=greatest(coalesce((p_metrics->>'participantsInvited')::int,0),0);
 v_activated integer:=greatest(coalesce((p_metrics->>'participantsActivated')::int,0),0);
 v_active integer:=greatest(coalesce((p_metrics->>'activeParticipants')::int,0),0);
 v_completed integer:=greatest(coalesce((p_metrics->>'activitiesCompleted')::int,0),0);
 v_started integer:=greatest(coalesce((p_metrics->>'activitiesStarted')::int,(p_metrics->>'activitiesCompleted')::int,0),0);
 v_sessions integer:=greatest(coalesce((p_metrics->>'reflectionSessions')::int,0),0);
 v_support integer:=greatest(coalesce((p_metrics->>'supportRequests')::int,0),0);
 v_accessibility integer:=greatest(coalesce((p_metrics->>'accessibilityIssues')::int,0),0);
begin
 v_context:=private.zgirl_pilot_require(p_session_token,p_pilot_id,'pilot.evidence');
 if p_source_type not in ('system_analytics','administrator_report','facilitator_report','manual_verified','import') then raise exception 'invalid_pilot_metric_source'; end if;
 if p_cohort_id is not null then
  select capacity into v_capacity from public.zgirl_pilot_cohorts where id=p_cohort_id and pilot_id=p_pilot_id;
  if v_capacity is null then raise exception 'pilot_cohort_not_found'; end if;
 else
  select participant_capacity into v_capacity from public.zgirl_pilot_programs where id=p_pilot_id;
 end if;
 if v_invited>v_capacity or v_activated>v_invited or v_active>v_activated or v_completed>v_started then raise exception 'pilot_metric_integrity_failed'; end if;
 insert into public.zgirl_pilot_metric_snapshots(pilot_id,cohort_id,snapshot_date,source_type,source_reference,participants_invited,participants_activated,active_participants,activities_started,activities_completed,reflection_sessions,support_requests,accessibility_issues,notes,recorded_by_operator_id)
 values(p_pilot_id,p_cohort_id,coalesce(p_snapshot_date,current_date),p_source_type,nullif(trim(p_source_reference),''),v_invited,v_activated,v_active,v_started,v_completed,v_sessions,v_support,v_accessibility,nullif(trim(p_notes),''),private.zgirl_pilot_actor(v_context))
 on conflict(pilot_id,cohort_id,snapshot_date,source_type) do update set source_reference=excluded.source_reference,participants_invited=excluded.participants_invited,participants_activated=excluded.participants_activated,active_participants=excluded.active_participants,activities_started=excluded.activities_started,activities_completed=excluded.activities_completed,reflection_sessions=excluded.reflection_sessions,support_requests=excluded.support_requests,accessibility_issues=excluded.accessibility_issues,notes=excluded.notes,recorded_by_operator_id=excluded.recorded_by_operator_id returning id into v_id;
 return v_id;
end; $$;
