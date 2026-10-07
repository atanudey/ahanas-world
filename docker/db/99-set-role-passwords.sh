#!/bin/bash
# Runs once, after the SQL migrations, when the database volume is first
# created. 000_init_roles.sql creates the Supabase service roles with a
# placeholder password; this gives them the same password as the main
# postgres user (POSTGRES_PASSWORD from docker-compose / .env), which is also
# what the other services in docker-compose.yml connect with.
set -euo pipefail

psql -v ON_ERROR_STOP=1 -v pw="$POSTGRES_PASSWORD" --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<'EOSQL'
  ALTER ROLE authenticator PASSWORD :'pw';
  ALTER ROLE supabase_admin PASSWORD :'pw';
  ALTER ROLE supabase_auth_admin PASSWORD :'pw';
  ALTER ROLE supabase_storage_admin PASSWORD :'pw';
EOSQL
