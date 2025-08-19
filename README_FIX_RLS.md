# Fix RLS Policies for Reports and Articles

## Problem
The edit and delete operations are not working because the Row Level Security (RLS) policies are not properly configured.

## Solution
Run the SQL script in your Supabase dashboard to fix the permissions.

## Steps:

1. **Go to your Supabase Dashboard**
   - Open https://supabase.com/dashboard
   - Select your project

2. **Open SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "New Query"

3. **Copy and Paste the SQL Script**
   - Copy the contents of `fix_rls_policies.sql`
   - Paste it into the SQL editor

4. **Run the Script**
   - Click "Run" button
   - Wait for it to complete

5. **Test the Operations**
   - Go back to your app
   - Try editing and deleting reports
   - Check console logs for any errors

## What the Script Does:
- Enables RLS on reports and articles tables
- Creates policies for users to view, edit, and delete their own content
- Allows anonymous users to insert reports
- Allows public read access for the scam wall
- Creates performance indexes

## If You Still Have Issues:
1. Check the console logs for error messages
2. Use the "Test Update" and "Test Delete" buttons in the debug panel
3. Verify your user ID matches the report's user_id field
