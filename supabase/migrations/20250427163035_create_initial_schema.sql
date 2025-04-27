-- Migration: create_initial_schema
-- Description: Creates the initial database schema for the 10x-cards application
-- Created at: 2025-04-27 16:30:35 UTC
-- Author: AI Assistant

-- Enable RLS on all tables by default
alter database postgres set row_security = on;

-- Create the flashcards table
create table if not exists public.flashcards (
    id bigserial primary key,
    front varchar(200) not null,
    back varchar(500) not null,
    source varchar not null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    generation_id bigint,
    user_id uuid not null references auth.users(id) on delete cascade,
    constraint valid_source check (source in ('ai-full', 'ai-edited', 'manual'))
);

-- Create indexes for flashcards
create index if not exists flashcards_user_id_idx on public.flashcards(user_id);
create index if not exists flashcards_generation_id_idx on public.flashcards(generation_id);

-- Enable RLS on flashcards
alter table public.flashcards enable row level security;

-- Create RLS policies for flashcards
-- Policy for authenticated users to select their own flashcards
create policy "Users can view own flashcards" 
    on public.flashcards for select 
    to authenticated 
    using (auth.uid() = user_id);

-- Policy for authenticated users to insert their own flashcards
create policy "Users can insert own flashcards" 
    on public.flashcards for insert 
    to authenticated 
    with check (auth.uid() = user_id);

-- Policy for authenticated users to update their own flashcards
create policy "Users can update own flashcards" 
    on public.flashcards for update 
    to authenticated 
    using (auth.uid() = user_id);

-- Policy for authenticated users to delete their own flashcards
create policy "Users can delete own flashcards" 
    on public.flashcards for delete 
    to authenticated 
    using (auth.uid() = user_id);

-- Create the generations table
create table if not exists public.generations (
    id bigserial primary key,
    user_id uuid not null references auth.users(id) on delete cascade,
    model text not null,
    source_text_hash text not null,
    source_text_length integer not null,
    generated_count integer not null,
    accepted_unedited_count integer,
    accepted_edited_count integer,
    generation_duration integer not null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    constraint valid_text_length check (source_text_length between 1000 and 10000)
);

-- Create indexes for generations
create index if not exists generations_user_id_idx on public.generations(user_id);
create index if not exists generations_source_text_hash_idx on public.generations(source_text_hash);

-- Enable RLS on generations
alter table public.generations enable row level security;

-- Create RLS policies for generations
-- Policy for authenticated users to select their own generations
create policy "Users can view own generations" 
    on public.generations for select 
    to authenticated 
    using (auth.uid() = user_id);

-- Policy for authenticated users to insert their own generations
create policy "Users can insert own generations" 
    on public.generations for insert 
    to authenticated 
    with check (auth.uid() = user_id);

-- Policy for authenticated users to update their own generations
create policy "Users can update own generations" 
    on public.generations for update 
    to authenticated 
    using (auth.uid() = user_id);

-- Policy for authenticated users to delete their own generations
create policy "Users can delete own generations" 
    on public.generations for delete 
    to authenticated 
    using (auth.uid() = user_id);

-- Add foreign key constraint to flashcards.generation_id
alter table public.flashcards
    add constraint flashcards_generation_id_fkey
    foreign key (generation_id)
    references public.generations(id)
    on delete cascade;

-- Create the generation_error_logs table
create table if not exists public.generation_error_logs (
    id bigserial primary key,
    user_id uuid not null references auth.users(id) on delete cascade,
    model text not null,
    source_text_hash text not null,
    source_text_length integer not null,
    error_code varchar(100) not null,
    error_message text not null,
    created_at timestamptz not null default now(),
    constraint valid_text_length check (source_text_length between 1000 and 10000)
);

-- Create indexes for generation_error_logs
create index if not exists generation_error_logs_user_id_idx on public.generation_error_logs(user_id);
create index if not exists generation_error_logs_source_text_hash_idx on public.generation_error_logs(source_text_hash);

-- Enable RLS on generation_error_logs
alter table public.generation_error_logs enable row level security;

-- Create RLS policies for generation_error_logs
-- Policy for authenticated users to select their own error logs
create policy "Users can view own error logs" 
    on public.generation_error_logs for select 
    to authenticated 
    using (auth.uid() = user_id);

-- Policy for authenticated users to insert their own error logs
create policy "Users can insert own error logs" 
    on public.generation_error_logs for insert 
    to authenticated 
    with check (auth.uid() = user_id);

-- Added schema description and functions for updating timestamps
comment on table public.flashcards is 'Stores flashcards created by users';
comment on table public.generations is 'Stores records of AI generations for flashcards';
comment on table public.generation_error_logs is 'Logs of errors that occurred during AI generation';

-- Create trigger function for updating the updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Add update triggers for flashcards and generations tables
create trigger set_updated_at
before update on public.flashcards
for each row
execute procedure public.handle_updated_at();

create trigger set_updated_at
before update on public.generations
for each row
execute procedure public.handle_updated_at(); 