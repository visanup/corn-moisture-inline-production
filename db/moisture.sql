-- 1. Create schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS moisture;

-- 2. Create result table
CREATE TABLE IF NOT EXISTS moisture.result (
    id SERIAL PRIMARY KEY,
    ins_lot    VARCHAR(255) NOT NULL,
    material   VARCHAR(255) NOT NULL,
    batch      VARCHAR(255) NOT NULL,
    plant      VARCHAR(255) NOT NULL,
    sample_no  VARCHAR(255) NOT NULL,
    queue      VARCHAR(255) NOT NULL,
    result     JSONB,
    statistics JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Create interface table for aggregated statistics (one record per queue)
CREATE TABLE IF NOT EXISTS moisture.interface (
    id               SERIAL       PRIMARY KEY,
    ins_lot          VARCHAR(255) NOT NULL,
    material         VARCHAR(255) NOT NULL,
    batch            VARCHAR(255) NOT NULL,
    plant            VARCHAR(255) NOT NULL,
    sample_no        VARCHAR(255) NOT NULL,
    interface_status VARCHAR(50)  NOT NULL DEFAULT 'pending',
    statistics       JSONB,
    created_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    UNIQUE (ins_lot, material, batch, plant, sample_no)
);

-- 4. Indexes for result Indexes for result
CREATE INDEX IF NOT EXISTS idx_result_queue     ON moisture.result(queue);
CREATE INDEX IF NOT EXISTS idx_result_ins_lot   ON moisture.result(ins_lot);
CREATE INDEX IF NOT EXISTS idx_result_material  ON moisture.result(material);
CREATE INDEX IF NOT EXISTS idx_result_batch     ON moisture.result(batch);
CREATE INDEX IF NOT EXISTS idx_result_plant     ON moisture.result(plant);
CREATE INDEX IF NOT EXISTS idx_result_sample_no ON moisture.result(sample_no);

-- 5. Create users table (no updated_at)
CREATE TABLE IF NOT EXISTS moisture.users (
    id             SERIAL PRIMARY KEY,
    email          VARCHAR(255) UNIQUE NOT NULL,
    name           VARCHAR(255),
    password_hash  VARCHAR(255) NOT NULL,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Add email column if missing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
      FROM information_schema.columns
     WHERE table_schema = 'moisture'
       AND table_name   = 'users'
       AND column_name  = 'email'
  ) THEN
    ALTER TABLE moisture.users
      ADD COLUMN email VARCHAR(255);

    UPDATE moisture.users
       SET email = 'user' || id || '@example.com'
     WHERE email IS NULL;

    ALTER TABLE moisture.users
      ALTER COLUMN email SET NOT NULL;
    CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email
      ON moisture.users(email);
  END IF;
END;
$$ LANGUAGE plpgsql;

-- 7. Create refresh_tokens table
CREATE TABLE IF NOT EXISTS moisture.refresh_tokens (
    id          SERIAL PRIMARY KEY,
    user_id     INT NOT NULL REFERENCES moisture.users(id) ON DELETE CASCADE,
    token       TEXT NOT NULL UNIQUE,
    issued_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at  TIMESTAMPTZ NOT NULL,
    revoked     BOOLEAN NOT NULL DEFAULT FALSE
);

-- 8. Indexes for refresh_tokens
CREATE INDEX IF NOT EXISTS idx_rt_user_id    ON moisture.refresh_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_rt_expires_at  ON moisture.refresh_tokens(expires_at);
CREATE INDEX IF NOT EXISTS idx_rt_revoked     ON moisture.refresh_tokens(revoked);
CREATE INDEX IF NOT EXISTS idx_rt_active      ON moisture.refresh_tokens(expires_at) WHERE revoked = FALSE;
