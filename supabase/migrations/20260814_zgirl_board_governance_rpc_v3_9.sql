-- Z-Girl v3.9 board governance pack operations.

create or replace function public.zgirl_board_governance_dashboard(
  p_session_token text,
  p_institution_id uuid,
  p_period_start date,
  p_period_end date
) returns jsonb
language plpgsql
security definer
set search_path=pg_catalog,public,private
as $$
declare
  v_context jsonb;
  v_snapshot jsonb;
begin
  v_context:=private.zgirl_tenant_require_access(p_session_token,p_institution_id,'read');
  v_snapshot:=private.zgirl_build_board_governance_snapshot(p_institution_id,p_period_start,p_period_end);
  return jsonb_build_object(
    'context',v_context,
    'snapshot',v_snapshot,
    'packs',coalesce((select jsonb_agg(jsonb_build_object(
      'id',p.id,'packCode',p.pack_code,'title',p.title,'status',p.status,
      'periodStart',p.period_start,'periodEnd',p.period_end,'preparedFor',p.prepared_for,
      'preparedBy',p.prepared_by,'createdAt',p.created_at,'finalizedAt',p.finalized_at,'archivedAt',p.archived_at
    ) order by p.created_at desc)
    from public.zgirl_board_governance_packs p
    where p.institution_id=p_institution_id),'[]'::jsonb)
  );
end;
$$;

create or replace function public.zgirl_board_create_pack(
  p_session_token text,
  p_institution_id uuid,
  p_period_start date,
  p_period_end date,
  p_title text,
  p_prepared_for text,
  p_prepared_by text,
  p_executive_summary text,
  p_annual_cycle_id uuid default null
) returns uuid
language plpgsql
security definer
set search_path=pg_catalog,public,private
as $$
declare
  v_context jsonb;
  v_operator_id uuid;
  v_id uuid;
begin
  v_context:=private.zgirl_tenant_require_access(p_session_token,p_institution_id,'manage');
  v_operator_id:=nullif(v_context->>'operatorId','')::uuid;
  if p_period_start is null or p_period_end is null or p_period_start>p_period_end or char_length(trim(coalesce(p_title,'')))<3 then
    raise exception 'invalid_board_governance_pack';
  end if;
  if p_annual_cycle_id is not null and not exists(select 1 from public.zgirl_governance_annual_review_cycles c where c.id=p_annual_cycle_id and c.institution_id=p_institution_id) then
    raise exception 'invalid_board_governance_cycle';
  end if;
  insert into public.zgirl_board_governance_packs(
    pack_code,institution_id,annual_cycle_id,period_start,period_end,title,prepared_for,prepared_by,
    executive_summary,snapshot,created_by_operator_id
  ) values(
    private.zgirl_governance_code('ZG-BRD'),p_institution_id,p_annual_cycle_id,p_period_start,p_period_end,
    left(trim(p_title),220),left(coalesce(p_prepared_for,''),220),left(coalesce(p_prepared_by,''),120),
    left(coalesce(p_executive_summary,''),3000),private.zgirl_build_board_governance_snapshot(p_institution_id,p_period_start,p_period_end),v_operator_id
  ) returning id into v_id;
  return v_id;
end;
$$;

create or replace function public.zgirl_board_refresh_pack(
  p_session_token text,
  p_pack_id uuid,
  p_executive_summary text default null
) returns boolean
language plpgsql
security definer
set search_path=pg_catalog,public,private
as $$
declare v_pack public.zgirl_board_governance_packs%rowtype;
begin
  select * into v_pack from public.zgirl_board_governance_packs where id=p_pack_id;
  if v_pack.id is null then raise exception 'board_governance_pack_not_found'; end if;
  perform private.zgirl_tenant_require_access(p_session_token,v_pack.institution_id,'manage');
  if v_pack.status<>'draft' then raise exception 'board_governance_pack_locked'; end if;
  update public.zgirl_board_governance_packs
    set snapshot=private.zgirl_build_board_governance_snapshot(v_pack.institution_id,v_pack.period_start,v_pack.period_end),
        executive_summary=case when p_executive_summary is null then executive_summary else left(p_executive_summary,3000) end,
        updated_at=now()
    where id=p_pack_id;
  return true;
end;
$$;

create or replace function public.zgirl_board_finalize_pack(
  p_session_token text,
  p_pack_id uuid
) returns boolean
language plpgsql
security definer
set search_path=pg_catalog,public,private
as $$
declare
  v_pack public.zgirl_board_governance_packs%rowtype;
  v_context jsonb;
  v_operator_id uuid;
begin
  select * into v_pack from public.zgirl_board_governance_packs where id=p_pack_id;
  if v_pack.id is null then raise exception 'board_governance_pack_not_found'; end if;
  v_context:=private.zgirl_tenant_require_access(p_session_token,v_pack.institution_id,'owner');
  v_operator_id:=nullif(v_context->>'operatorId','')::uuid;
  if v_pack.status<>'draft' then raise exception 'board_governance_pack_locked'; end if;
  update public.zgirl_board_governance_packs
    set status='finalized',finalized_by_operator_id=v_operator_id,finalized_at=now(),updated_at=now()
    where id=p_pack_id;
  return true;
end;
$$;

create or replace function public.zgirl_board_archive_pack(
  p_session_token text,
  p_pack_id uuid
) returns boolean
language plpgsql
security definer
set search_path=pg_catalog,public,private
as $$
declare
  v_pack public.zgirl_board_governance_packs%rowtype;
  v_context jsonb;
  v_operator_id uuid;
begin
  select * into v_pack from public.zgirl_board_governance_packs where id=p_pack_id;
  if v_pack.id is null then raise exception 'board_governance_pack_not_found'; end if;
  v_context:=private.zgirl_tenant_require_access(p_session_token,v_pack.institution_id,'owner');
  v_operator_id:=nullif(v_context->>'operatorId','')::uuid;
  if v_pack.status='archived' then return true; end if;
  update public.zgirl_board_governance_packs
    set status='archived',archived_by_operator_id=v_operator_id,archived_at=now(),updated_at=now()
    where id=p_pack_id;
  return true;
end;
$$;

create or replace function public.zgirl_board_pack_packet(
  p_session_token text,
  p_pack_id uuid
) returns jsonb
language plpgsql
security definer
set search_path=pg_catalog,public,private
as $$
declare
  v_pack public.zgirl_board_governance_packs%rowtype;
  v_inst public.zgirl_institutions%rowtype;
begin
  select * into v_pack from public.zgirl_board_governance_packs where id=p_pack_id;
  if v_pack.id is null then raise exception 'board_governance_pack_not_found'; end if;
  perform private.zgirl_tenant_require_access(p_session_token,v_pack.institution_id,'read');
  select * into v_inst from public.zgirl_institutions where id=v_pack.institution_id;
  return jsonb_build_object(
    'pack',jsonb_build_object(
      'id',v_pack.id,'packCode',v_pack.pack_code,'status',v_pack.status,'title',v_pack.title,
      'periodStart',v_pack.period_start,'periodEnd',v_pack.period_end,'preparedFor',v_pack.prepared_for,
      'preparedBy',v_pack.prepared_by,'executiveSummary',v_pack.executive_summary,
      'createdAt',v_pack.created_at,'finalizedAt',v_pack.finalized_at,'archivedAt',v_pack.archived_at,
      'annualCycleId',v_pack.annual_cycle_id
    ),
    'institution',jsonb_build_object('id',v_inst.id,'institutionCode',v_inst.institution_code,'name',v_inst.name,'institutionType',v_inst.institution_type,'status',v_inst.status),
    'snapshot',v_pack.snapshot
  );
end;
$$;

revoke all on function public.zgirl_board_governance_dashboard(text,uuid,date,date) from public,anon,authenticated;
revoke all on function public.zgirl_board_create_pack(text,uuid,date,date,text,text,text,text,uuid) from public,anon,authenticated;
revoke all on function public.zgirl_board_refresh_pack(text,uuid,text) from public,anon,authenticated;
revoke all on function public.zgirl_board_finalize_pack(text,uuid) from public,anon,authenticated;
revoke all on function public.zgirl_board_archive_pack(text,uuid) from public,anon,authenticated;
revoke all on function public.zgirl_board_pack_packet(text,uuid) from public,anon,authenticated;

grant execute on function public.zgirl_board_governance_dashboard(text,uuid,date,date) to anon,authenticated;
grant execute on function public.zgirl_board_create_pack(text,uuid,date,date,text,text,text,text,uuid) to anon,authenticated;
grant execute on function public.zgirl_board_refresh_pack(text,uuid,text) to anon,authenticated;
grant execute on function public.zgirl_board_finalize_pack(text,uuid) to anon,authenticated;
grant execute on function public.zgirl_board_archive_pack(text,uuid) to anon,authenticated;
grant execute on function public.zgirl_board_pack_packet(text,uuid) to anon,authenticated;
