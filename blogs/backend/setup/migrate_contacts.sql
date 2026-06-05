-- CodimAI — Contacts table migration
-- Run this once on any existing database to bring the schema up to date.
-- Safe to run multiple times (uses IF NOT EXISTS / MODIFY).

-- 1. Add notes column (skip if already present)
ALTER TABLE contacts
  ADD COLUMN IF NOT EXISTS notes TEXT AFTER message;

-- 2. Update status values: new / in_progress / responded
ALTER TABLE contacts
  MODIFY COLUMN status ENUM('new','in_progress','responded') NOT NULL DEFAULT 'new';

-- Verify
DESCRIBE contacts;
