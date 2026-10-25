-- Store the existing IndexedDB records without changing their field names or
-- nested details. The application validates payloads before writing them.
-- Every primary and foreign key includes the authenticated owner.
create schema if not exists truck_expenses;

create table if not exists truck_expenses.trips (
  owner_id text not null,
  id text not null,
  payload jsonb not null,
  revision bigint not null default 1,
  primary key (owner_id, id),
  constraint trips_payload_id check (jsonb_typeof(payload) = 'object' and payload->>'id' = id)
);

create table if not exists truck_expenses.expenses (
  owner_id text not null,
  id text not null,
  trip_id text not null,
  payload jsonb not null,
  revision bigint not null default 1,
  primary key (owner_id, id),
  foreign key (owner_id, trip_id) references truck_expenses.trips (owner_id, id) on delete cascade,
  constraint expenses_payload_key check (jsonb_typeof(payload) = 'object' and payload->>'id' = id and payload->>'tripId' = trip_id)
);
create index if not exists expenses_by_trip on truck_expenses.expenses (owner_id, trip_id);

create table if not exists truck_expenses.freight_rates (
  owner_id text not null,
  id text not null,
  payload jsonb not null,
  revision bigint not null default 1,
  primary key (owner_id, id),
  constraint freight_rates_payload_id check (jsonb_typeof(payload) = 'object' and payload->>'id' = id)
);

create table if not exists truck_expenses.trip_loans (
  owner_id text not null,
  id text not null,
  trip_id text not null,
  payload jsonb not null,
  revision bigint not null default 1,
  primary key (owner_id, id),
  foreign key (owner_id, trip_id) references truck_expenses.trips (owner_id, id) on delete cascade,
  constraint trip_loans_payload_key check (jsonb_typeof(payload) = 'object' and payload->>'id' = id and payload->>'tripId' = trip_id)
);
create index if not exists trip_loans_by_trip on truck_expenses.trip_loans (owner_id, trip_id);

create table if not exists truck_expenses.loan_payments (
  owner_id text not null,
  id text not null,
  loan_id text not null,
  payload jsonb not null,
  revision bigint not null default 1,
  primary key (owner_id, id),
  foreign key (owner_id, loan_id) references truck_expenses.trip_loans (owner_id, id) on delete cascade,
  constraint loan_payments_payload_key check (jsonb_typeof(payload) = 'object' and payload->>'id' = id and payload->>'loanId' = loan_id)
);
create index if not exists loan_payments_by_loan on truck_expenses.loan_payments (owner_id, loan_id);

create table if not exists truck_expenses.company_payments (
  owner_id text not null,
  id text not null,
  month text not null,
  payload jsonb not null,
  revision bigint not null default 1,
  primary key (owner_id, id),
  constraint company_payments_payload_key check (jsonb_typeof(payload) = 'object' and payload->>'id' = id and payload->>'month' = month)
);
create index if not exists company_payments_by_month on truck_expenses.company_payments (owner_id, month);

create table if not exists truck_expenses.assistant_wages (
  owner_id text not null,
  id text not null,
  payload jsonb not null,
  revision bigint not null default 1,
  primary key (owner_id, id),
  constraint assistant_wages_payload_id check (jsonb_typeof(payload) = 'object' and payload->>'id' = id)
);

create table if not exists truck_expenses.driver_entries (
  owner_id text not null,
  id text not null,
  payload jsonb not null,
  revision bigint not null default 1,
  primary key (owner_id, id),
  constraint driver_entries_payload_id check (jsonb_typeof(payload) = 'object' and payload->>'id' = id)
);

create table if not exists truck_expenses.driver_rates (
  owner_id text not null,
  id text not null,
  place text not null,
  payload jsonb not null,
  revision bigint not null default 1,
  primary key (owner_id, id),
  unique (owner_id, place),
  constraint driver_rates_payload_key check (jsonb_typeof(payload) = 'object' and payload->>'id' = id and payload->>'place' = place)
);

-- Only the server uses its database credential. No browser-facing role gets
-- access to this schema through the Data API.
revoke all on schema truck_expenses from public;
revoke all on all tables in schema truck_expenses from public;
