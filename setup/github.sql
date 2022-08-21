-- ----------------------------
-- Table structure for github
-- ----------------------------
DROP TABLE IF EXISTS "github";
CREATE TABLE "github" (
  "id" TEXT NOT NULL,
  "login" TEXT,
  "html_url" TEXT,
  "avatar_url" TEXT,
  "followers" INTEGER,
  "following" INTEGER,
  "query_time" TEXT,
  PRIMARY KEY ("id")
);