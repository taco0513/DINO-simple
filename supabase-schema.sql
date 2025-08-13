-- Note: auth.users table RLS is already enabled by Supabase by default

-- Create stays table
create table public.stays (
  id text primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  country_code text not null,
  city text,
  from_country_code text,
  from_city text,
  entry_date date not null,
  exit_date date,
  visa_type text default 'visa-free',
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on stays table
alter table public.stays enable row level security;

-- Create policies for stays table
create policy "Users can view their own stays" on public.stays
  for select using (auth.uid() = user_id);

create policy "Users can insert their own stays" on public.stays
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own stays" on public.stays
  for update using (auth.uid() = user_id);

create policy "Users can delete their own stays" on public.stays
  for delete using (auth.uid() = user_id);

-- Create function to automatically update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Create trigger for updated_at
create trigger handle_stays_updated_at
  before update on public.stays
  for each row execute function public.handle_updated_at();