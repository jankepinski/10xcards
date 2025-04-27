-- Migration: disable_policies
-- Description: Disables all row-level security policies for flashcards, generations, and generation_error_logs tables
-- Created at: 2025-04-30 00:00:00 UTC

-- Disable policies for flashcards table
drop policy if exists "Users can view own flashcards" on public.flashcards;
drop policy if exists "Users can insert own flashcards" on public.flashcards;
drop policy if exists "Users can update own flashcards" on public.flashcards;
drop policy if exists "Users can delete own flashcards" on public.flashcards;

-- Disable policies for generations table
drop policy if exists "Users can view own generations" on public.generations;
drop policy if exists "Users can insert own generations" on public.generations;
drop policy if exists "Users can update own generations" on public.generations;
drop policy if exists "Users can delete own generations" on public.generations;

-- Disable policies for generation_error_logs table
drop policy if exists "Users can view own error logs" on public.generation_error_logs;
drop policy if exists "Users can insert own error logs" on public.generation_error_logs; 