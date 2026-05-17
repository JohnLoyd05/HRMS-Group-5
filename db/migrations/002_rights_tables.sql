-- 002_rights_tables.sql
-- Rights and auth support tables

CREATE TABLE "user" (
  id            UUID         PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email         VARCHAR(100) NOT NULL UNIQUE,
  firstname     VARCHAR(50),
  lastname      VARCHAR(50),
  username      VARCHAR(50),
  user_type     VARCHAR(15)  NOT NULL DEFAULT 'USER',
  record_status VARCHAR(10)  NOT NULL DEFAULT 'INACTIVE',
  stamp         VARCHAR(100)
);

CREATE TABLE "Module" (
  moduleCode  VARCHAR(10)  NOT NULL PRIMARY KEY,
  moduleDesc  VARCHAR(50),
  record_status VARCHAR(10) NOT NULL DEFAULT 'ACTIVE',
  stamp       VARCHAR(60)
);

CREATE TABLE rights (
  rightCode   VARCHAR(15)  NOT NULL PRIMARY KEY,
  rightDesc   VARCHAR(50),
  right_value INT          DEFAULT 1,
  moduleCode  VARCHAR(10)  REFERENCES "Module"(moduleCode),
  record_status VARCHAR(10) NOT NULL DEFAULT 'ACTIVE',
  stamp       VARCHAR(60)
);

CREATE TABLE user_module (
  id          SERIAL       PRIMARY KEY,
  user_id     UUID         REFERENCES "user"(id) ON DELETE CASCADE,
  moduleCode  VARCHAR(10)  REFERENCES "Module"(moduleCode),
  rights_value INT         DEFAULT 0
);

CREATE TABLE "UserModule_Rights" (
  id          SERIAL       PRIMARY KEY,
  user_id     UUID         REFERENCES "user"(id) ON DELETE CASCADE,
  rightCode   VARCHAR(15)  REFERENCES rights(rightCode),
  right_value INT          DEFAULT 0
);