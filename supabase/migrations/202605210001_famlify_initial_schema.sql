create extension if not exists pgcrypto;

create type public.workspace_role as enum ('owner');
create type public.shopping_item_status as enum ('shopping', 'storage');
create type public.activity_event_action as enum ('created', 'updated', 'checked', 'restocked', 'archived', 'deleted');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.workspace_members (
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.workspace_role not null default 'owner',
  invited_email text,
  accepted_at timestamptz,
  created_at timestamptz not null default now(),
  primary key (workspace_id, user_id)
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.is_workspace_owner(target_workspace_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.workspace_members wm
    where wm.workspace_id = target_workspace_id
      and wm.user_id = (select auth.uid())
      and wm.role = 'owner'
  );
$$;

revoke all on function public.is_workspace_owner(uuid) from public;
grant execute on function public.is_workspace_owner(uuid) to authenticated;

create or replace function public.ensure_owner_workspace(
  workspace_name text default 'Famlify Home',
  profile_display_name text default 'Owner'
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := (select auth.uid());
  household_workspace_id uuid;
  created_workspace_id uuid;
begin
  if current_user_id is null then
    raise exception 'Not authenticated';
  end if;

  insert into public.profiles (id, display_name)
  values (current_user_id, coalesce(nullif(profile_display_name, ''), 'Owner'))
  on conflict (id) do update
    set display_name = excluded.display_name;

  select w.id
  into household_workspace_id
  from public.workspaces w
  order by w.created_at asc
  limit 1;

  if household_workspace_id is not null then
    insert into public.workspace_members (workspace_id, user_id, role, accepted_at)
    values (household_workspace_id, current_user_id, 'owner', now())
    on conflict (workspace_id, user_id) do update
      set role = 'owner',
          accepted_at = coalesce(public.workspace_members.accepted_at, now());

    return household_workspace_id;
  end if;

  insert into public.workspaces (name, created_by)
  values (coalesce(nullif(workspace_name, ''), 'Famlify Home'), current_user_id)
  returning id into created_workspace_id;

  insert into public.workspace_members (workspace_id, user_id, role, accepted_at)
  values (created_workspace_id, current_user_id, 'owner', now());

  return created_workspace_id;
end;
$$;

revoke all on function public.ensure_owner_workspace(text, text) from public;
grant execute on function public.ensure_owner_workspace(text, text) to authenticated;

create table public.shopping_items (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  title text not null,
  category text not null,
  icon text not null default 'package',
  is_recurring boolean not null default false,
  status public.shopping_item_status,
  bought_at timestamptz,
  sort_order integer not null default 0,
  archived_at timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.shopping_purchase_events (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  shopping_item_id uuid not null references public.shopping_items(id) on delete cascade,
  quantity numeric,
  unit text,
  purchased_by uuid references auth.users(id) on delete set null,
  purchased_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table public.activity_events (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  actor_id uuid references auth.users(id) on delete set null,
  action public.activity_event_action not null,
  entity_table text not null,
  entity_id uuid,
  label text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.home_tasks (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  title text not null,
  interval_days integer not null default 0 check (interval_days >= 0),
  completed_at timestamptz,
  completed_by uuid references auth.users(id) on delete set null,
  completed_by_label text,
  archived_at timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.home_notes (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  category text not null,
  note text not null,
  archived_at timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.home_areas (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  name text not null,
  icon text not null default 'package',
  status text not null,
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.garden_tasks (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  title text not null,
  completed_at timestamptz,
  completed_by uuid references auth.users(id) on delete set null,
  archived_at timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.garden_plants (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  name text not null,
  icon text not null default 'sprout',
  planted_at timestamptz not null,
  last_watered_at timestamptz not null,
  watering_interval_days integer not null default 2 check (watering_interval_days > 0),
  note text,
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.garden_notes (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  category text not null,
  note text not null,
  archived_at timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.recipes (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  title text not null,
  prep_time text not null,
  servings text not null,
  tags text[] not null default '{}',
  thumbnail_path text,
  archived_at timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.recipe_ingredients (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  recipe_id uuid not null references public.recipes(id) on delete cascade,
  item text not null,
  amount numeric,
  unit text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table public.recipe_steps (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  recipe_id uuid not null references public.recipes(id) on delete cascade,
  text text not null,
  step_time text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table public.recipe_missing_items (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  recipe_id uuid not null references public.recipes(id) on delete cascade,
  item text not null,
  created_at timestamptz not null default now()
);

create table public.recipe_images (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  recipe_id uuid not null references public.recipes(id) on delete cascade,
  storage_path text not null,
  label text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index workspace_members_user_id_idx on public.workspace_members(user_id);
create index shopping_items_workspace_status_idx on public.shopping_items(workspace_id, status) where archived_at is null;
create index shopping_purchase_events_workspace_item_idx on public.shopping_purchase_events(workspace_id, shopping_item_id, purchased_at desc);
create index activity_events_workspace_created_idx on public.activity_events(workspace_id, created_at desc);
create index home_tasks_workspace_idx on public.home_tasks(workspace_id) where archived_at is null;
create index garden_tasks_workspace_idx on public.garden_tasks(workspace_id) where archived_at is null;
create index garden_plants_workspace_idx on public.garden_plants(workspace_id) where archived_at is null;
create index recipes_workspace_idx on public.recipes(workspace_id) where archived_at is null;
create index recipe_ingredients_recipe_idx on public.recipe_ingredients(recipe_id, sort_order);
create index recipe_steps_recipe_idx on public.recipe_steps(recipe_id, sort_order);
create index recipe_missing_items_recipe_idx on public.recipe_missing_items(recipe_id);
create index recipe_images_recipe_idx on public.recipe_images(recipe_id, sort_order);

create trigger set_profiles_updated_at before update on public.profiles for each row execute function public.set_updated_at();
create trigger set_workspaces_updated_at before update on public.workspaces for each row execute function public.set_updated_at();
create trigger set_shopping_items_updated_at before update on public.shopping_items for each row execute function public.set_updated_at();
create trigger set_home_tasks_updated_at before update on public.home_tasks for each row execute function public.set_updated_at();
create trigger set_home_notes_updated_at before update on public.home_notes for each row execute function public.set_updated_at();
create trigger set_home_areas_updated_at before update on public.home_areas for each row execute function public.set_updated_at();
create trigger set_garden_tasks_updated_at before update on public.garden_tasks for each row execute function public.set_updated_at();
create trigger set_garden_plants_updated_at before update on public.garden_plants for each row execute function public.set_updated_at();
create trigger set_garden_notes_updated_at before update on public.garden_notes for each row execute function public.set_updated_at();
create trigger set_recipes_updated_at before update on public.recipes for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.workspaces enable row level security;
alter table public.workspace_members enable row level security;
alter table public.shopping_items enable row level security;
alter table public.shopping_purchase_events enable row level security;
alter table public.activity_events enable row level security;
alter table public.home_tasks enable row level security;
alter table public.home_notes enable row level security;
alter table public.home_areas enable row level security;
alter table public.garden_tasks enable row level security;
alter table public.garden_plants enable row level security;
alter table public.garden_notes enable row level security;
alter table public.recipes enable row level security;
alter table public.recipe_ingredients enable row level security;
alter table public.recipe_steps enable row level security;
alter table public.recipe_missing_items enable row level security;
alter table public.recipe_images enable row level security;

grant usage on schema public to authenticated;

grant select, insert, update, delete on table
  public.profiles,
  public.workspaces,
  public.workspace_members,
  public.shopping_items,
  public.shopping_purchase_events,
  public.activity_events,
  public.home_tasks,
  public.home_notes,
  public.home_areas,
  public.garden_tasks,
  public.garden_plants,
  public.garden_notes,
  public.recipes,
  public.recipe_ingredients,
  public.recipe_steps,
  public.recipe_missing_items,
  public.recipe_images
to authenticated;

create policy "Users can insert their own profile" on public.profiles
for insert to authenticated
with check ((select auth.uid()) = id);

create policy "Users can read workspace member profiles" on public.profiles
for select to authenticated
using (
  id = (select auth.uid())
  or exists (
    select 1
    from public.workspace_members mine
    join public.workspace_members theirs on theirs.workspace_id = mine.workspace_id
    where mine.user_id = (select auth.uid())
      and theirs.user_id = profiles.id
  )
);

create policy "Users can update their own profile" on public.profiles
for update to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

create policy "Owners can create workspaces" on public.workspaces
for insert to authenticated
with check (created_by = (select auth.uid()));

create policy "Owners can read workspaces" on public.workspaces
for select to authenticated
using (
  public.is_workspace_owner(id)
  or created_by = (select auth.uid())
);

create policy "Owners can update workspaces" on public.workspaces
for update to authenticated
using (public.is_workspace_owner(id))
with check (public.is_workspace_owner(id));

create policy "Members can read memberships" on public.workspace_members
for select to authenticated
using (public.is_workspace_owner(workspace_id));

create policy "Users can create their initial owner membership" on public.workspace_members
for insert to authenticated
with check (
  (
    user_id = (select auth.uid())
    and role = 'owner'
    and exists (
      select 1
      from public.workspaces w
      where w.id = workspace_id
        and w.created_by = (select auth.uid())
    )
  )
  or public.is_workspace_owner(workspace_id)
);

create policy "Owners can manage memberships" on public.workspace_members
for update to authenticated
using (public.is_workspace_owner(workspace_id))
with check (public.is_workspace_owner(workspace_id));

create policy "Owners can delete memberships" on public.workspace_members
for delete to authenticated
using (public.is_workspace_owner(workspace_id));

create policy "Owners can read shopping items" on public.shopping_items
for select to authenticated
using (public.is_workspace_owner(workspace_id));

create policy "Owners can insert shopping items" on public.shopping_items
for insert to authenticated
with check (public.is_workspace_owner(workspace_id));

create policy "Owners can update shopping items" on public.shopping_items
for update to authenticated
using (public.is_workspace_owner(workspace_id))
with check (public.is_workspace_owner(workspace_id));

create policy "Owners can delete shopping items" on public.shopping_items
for delete to authenticated
using (public.is_workspace_owner(workspace_id));

create policy "Owners can read purchase events" on public.shopping_purchase_events
for select to authenticated
using (public.is_workspace_owner(workspace_id));

create policy "Owners can insert purchase events" on public.shopping_purchase_events
for insert to authenticated
with check (public.is_workspace_owner(workspace_id));

create policy "Owners can delete purchase events" on public.shopping_purchase_events
for delete to authenticated
using (public.is_workspace_owner(workspace_id));

create policy "Owners can read activity events" on public.activity_events
for select to authenticated
using (public.is_workspace_owner(workspace_id));

create policy "Owners can insert activity events" on public.activity_events
for insert to authenticated
with check (
  public.is_workspace_owner(workspace_id)
  and actor_id = (select auth.uid())
);

create policy "Owners can manage home tasks" on public.home_tasks
for all to authenticated
using (public.is_workspace_owner(workspace_id))
with check (public.is_workspace_owner(workspace_id));

create policy "Owners can manage home notes" on public.home_notes
for all to authenticated
using (public.is_workspace_owner(workspace_id))
with check (public.is_workspace_owner(workspace_id));

create policy "Owners can manage home areas" on public.home_areas
for all to authenticated
using (public.is_workspace_owner(workspace_id))
with check (public.is_workspace_owner(workspace_id));

create policy "Owners can manage garden tasks" on public.garden_tasks
for all to authenticated
using (public.is_workspace_owner(workspace_id))
with check (public.is_workspace_owner(workspace_id));

create policy "Owners can manage garden plants" on public.garden_plants
for all to authenticated
using (public.is_workspace_owner(workspace_id))
with check (public.is_workspace_owner(workspace_id));

create policy "Owners can manage garden notes" on public.garden_notes
for all to authenticated
using (public.is_workspace_owner(workspace_id))
with check (public.is_workspace_owner(workspace_id));

create policy "Owners can manage recipes" on public.recipes
for all to authenticated
using (public.is_workspace_owner(workspace_id))
with check (public.is_workspace_owner(workspace_id));

create policy "Owners can manage recipe ingredients" on public.recipe_ingredients
for all to authenticated
using (public.is_workspace_owner(workspace_id))
with check (public.is_workspace_owner(workspace_id));

create policy "Owners can manage recipe steps" on public.recipe_steps
for all to authenticated
using (public.is_workspace_owner(workspace_id))
with check (public.is_workspace_owner(workspace_id));

create policy "Owners can manage recipe missing items" on public.recipe_missing_items
for all to authenticated
using (public.is_workspace_owner(workspace_id))
with check (public.is_workspace_owner(workspace_id));

create policy "Owners can manage recipe images" on public.recipe_images
for all to authenticated
using (public.is_workspace_owner(workspace_id))
with check (public.is_workspace_owner(workspace_id));

alter publication supabase_realtime add table
  public.shopping_items,
  public.shopping_purchase_events,
  public.activity_events,
  public.home_tasks,
  public.home_notes,
  public.home_areas,
  public.garden_tasks,
  public.garden_plants,
  public.garden_notes,
  public.recipes,
  public.recipe_ingredients,
  public.recipe_steps,
  public.recipe_missing_items,
  public.recipe_images;

insert into storage.buckets (id, name, public)
values ('recipe-images', 'recipe-images', false)
on conflict (id) do nothing;

create policy "Owners can read recipe images" on storage.objects
for select to authenticated
using (
  bucket_id = 'recipe-images'
  and public.is_workspace_owner((storage.foldername(name))[1]::uuid)
);

create policy "Owners can upload recipe images" on storage.objects
for insert to authenticated
with check (
  bucket_id = 'recipe-images'
  and public.is_workspace_owner((storage.foldername(name))[1]::uuid)
);

create policy "Owners can update recipe images" on storage.objects
for update to authenticated
using (
  bucket_id = 'recipe-images'
  and public.is_workspace_owner((storage.foldername(name))[1]::uuid)
)
with check (
  bucket_id = 'recipe-images'
  and public.is_workspace_owner((storage.foldername(name))[1]::uuid)
);

create policy "Owners can delete recipe images" on storage.objects
for delete to authenticated
using (
  bucket_id = 'recipe-images'
  and public.is_workspace_owner((storage.foldername(name))[1]::uuid)
);
