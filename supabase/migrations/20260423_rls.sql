-- Enable extension
create extension if not exists pgcrypto;

-- RLS helper: household member check
create or replace function public.is_household_member(target_household_id uuid)
returns boolean
language sql
stable
as $$
  select exists (
    select 1 from public."HouseholdMember" hm
    where hm."householdId" = target_household_id
      and hm."userId" = auth.uid()
  );
$$;

-- Household-level tables
alter table public."Household" enable row level security;
alter table public."HouseholdMember" enable row level security;
alter table public."HouseholdInviteCode" enable row level security;
alter table public."Pet" enable row level security;
alter table public."PetPhoto" enable row level security;
alter table public."PetEmergencyInfo" enable row level security;
alter table public."PetMedicalRecord" enable row level security;
alter table public."PetMedication" enable row level security;
alter table public."PetVaccination" enable row level security;
alter table public."PetEmergencyToken" enable row level security;

create policy "members can read household"
  on public."Household"
  for select
  using (public.is_household_member(id));

create policy "owner can update household"
  on public."Household"
  for update
  using (
    exists (
      select 1 from public."HouseholdMember" hm
      where hm."householdId" = id
        and hm."userId" = auth.uid()
        and hm.role = 'OWNER'
    )
  );

create policy "household members manage pets"
  on public."Pet"
  for all
  using (public.is_household_member("householdId"))
  with check (public.is_household_member("householdId"));

create policy "household members manage invite codes"
  on public."HouseholdInviteCode"
  for all
  using (public.is_household_member("householdId"))
  with check (public.is_household_member("householdId"));

create policy "household members read members"
  on public."HouseholdMember"
  for select
  using (public.is_household_member("householdId"));

create policy "owner can manage members"
  on public."HouseholdMember"
  for all
  using (
    exists (
      select 1 from public."HouseholdMember" hm
      where hm."householdId" = "householdId"
        and hm."userId" = auth.uid()
        and hm.role = 'OWNER'
    )
  )
  with check (
    exists (
      select 1 from public."HouseholdMember" hm
      where hm."householdId" = "householdId"
        and hm."userId" = auth.uid()
        and hm.role = 'OWNER'
    )
  );

create policy "household members manage photos"
  on public."PetPhoto"
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

create policy "household members manage emergency info"
  on public."PetEmergencyInfo"
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

create policy "household members manage medical records"
  on public."PetMedicalRecord"
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

create policy "household members manage medications"
  on public."PetMedication"
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

create policy "household members manage vaccinations"
  on public."PetVaccination"
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

create policy "household members manage emergency token"
  on public."PetEmergencyToken"
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
