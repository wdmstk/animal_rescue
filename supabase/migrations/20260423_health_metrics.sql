do $$
begin
  create type public."CoreMetricType" as enum (
    'WEIGHT_KG',
    'WATER_INTAKE_ML',
    'APPETITE_SCORE',
    'URINATION_COUNT',
    'DEFECATION_COUNT',
    'VOMIT_COUNT',
    'BODY_TEMPERATURE_C'
  );
exception
  when duplicate_object then null;
end
$$;

do $$
begin
  create type public."LabMarkerType" as enum ('CRE', 'BUN', 'SDMA', 'PHOSPHORUS');
exception
  when duplicate_object then null;
end
$$;

do $$
begin
  create type public."HealthExtensionKey" as enum ('INFUSION_ML');
exception
  when duplicate_object then null;
end
$$;

create table if not exists public."PetCoreMetricEntry" (
  id uuid primary key default gen_random_uuid(),
  "petId" uuid not null references public."Pet"(id) on delete cascade,
  type public."CoreMetricType" not null,
  value numeric(10, 2) not null,
  "recordedAt" timestamptz not null,
  note text,
  "createdAt" timestamptz not null default now()
);

create index if not exists "PetCoreMetricEntry_petId_type_recordedAt_idx"
  on public."PetCoreMetricEntry" ("petId", type, "recordedAt");

create table if not exists public."PetLabResultEntry" (
  id uuid primary key default gen_random_uuid(),
  "petId" uuid not null references public."Pet"(id) on delete cascade,
  marker public."LabMarkerType" not null,
  value numeric(10, 2) not null,
  unit text not null,
  "recordedAt" timestamptz not null,
  note text,
  "createdAt" timestamptz not null default now()
);

create index if not exists "PetLabResultEntry_petId_marker_recordedAt_idx"
  on public."PetLabResultEntry" ("petId", marker, "recordedAt");

create table if not exists public."PetHealthExtensionEntry" (
  id uuid primary key default gen_random_uuid(),
  "petId" uuid not null references public."Pet"(id) on delete cascade,
  key public."HealthExtensionKey" not null,
  value numeric(10, 2) not null,
  unit text,
  "recordedAt" timestamptz not null,
  note text,
  "createdAt" timestamptz not null default now()
);

create index if not exists "PetHealthExtensionEntry_petId_key_recordedAt_idx"
  on public."PetHealthExtensionEntry" ("petId", key, "recordedAt");

alter table public."PetCoreMetricEntry" enable row level security;
alter table public."PetLabResultEntry" enable row level security;
alter table public."PetHealthExtensionEntry" enable row level security;

create policy "household members manage core metrics"
  on public."PetCoreMetricEntry"
  for all
  using (
    exists (
      select 1 from public."Pet" p
      where p.id = "petId"
        and public.is_household_member(p."householdId")
    )
  )
  with check (
    exists (
      select 1 from public."Pet" p
      where p.id = "petId"
        and public.is_household_member(p."householdId")
    )
  );

create policy "household members manage lab results"
  on public."PetLabResultEntry"
  for all
  using (
    exists (
      select 1 from public."Pet" p
      where p.id = "petId"
        and public.is_household_member(p."householdId")
    )
  )
  with check (
    exists (
      select 1 from public."Pet" p
      where p.id = "petId"
        and public.is_household_member(p."householdId")
    )
  );

create policy "household members manage health extensions"
  on public."PetHealthExtensionEntry"
  for all
  using (
    exists (
      select 1 from public."Pet" p
      where p.id = "petId"
        and public.is_household_member(p."householdId")
    )
  )
  with check (
    exists (
      select 1 from public."Pet" p
      where p.id = "petId"
        and public.is_household_member(p."householdId")
    )
  );
