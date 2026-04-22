create or replace function public.get_public_emergency_by_token(input_token uuid)
returns table (
  pet_name text,
  disease text,
  current_medications text,
  allergy text,
  vet_name text,
  vet_phone text,
  emergency_contact_name text,
  emergency_contact_phone text
)
language sql
security definer
set search_path = public
as $$
  select
    p.name as pet_name,
    pei.disease,
    pei."currentMedications" as current_medications,
    pei.allergy,
    pei."vetName" as vet_name,
    pei."vetPhone" as vet_phone,
    pei."emergencyContactName" as emergency_contact_name,
    pei."emergencyContactPhone" as emergency_contact_phone
  from "PetEmergencyToken" pet
  join "Pet" p on p.id = pet."petId"
  join "PetEmergencyInfo" pei on pei."petId" = p.id
  where pet.token = input_token
    and pet."isActive" = true;
$$;

revoke all on function public.get_public_emergency_by_token(uuid) from public;
grant execute on function public.get_public_emergency_by_token(uuid) to anon;
