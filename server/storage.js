import { createClient } from "@supabase/supabase-js";
import { promises as fs } from "node:fs";
import path from "node:path";

const STORE_ROW_ID = "primary";

export function createStorage({ rootDir, buildDefaultStore, nowIso }) {
  const dataDir = process.env.DATA_DIR ? path.resolve(process.env.DATA_DIR) : path.join(rootDir, "data");
  const dataFile = path.join(dataDir, "onyx.json");
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseTable = process.env.SUPABASE_STORE_TABLE || "onyx_store";

  const mode = supabaseUrl && supabaseServiceRoleKey ? "supabase" : "file";
  const description = mode === "supabase" ? `table ${supabaseTable}` : `file ${dataFile}`;

  const supabase = mode === "supabase"
    ? createClient(supabaseUrl, supabaseServiceRoleKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      })
    : null;

  let writeChain = Promise.resolve();

  function normalizeStore(rawStore) {
    const baseStore = rawStore && typeof rawStore === "object" ? rawStore : buildDefaultStore();
    return {
      ...baseStore,
      sources: Array.isArray(baseStore.sources) ? baseStore.sources : [],
      articles: Array.isArray(baseStore.articles) ? baseStore.articles : [],
      meta: baseStore.meta && typeof baseStore.meta === "object" ? baseStore.meta : {},
    };
  }

  async function fileExists(targetPath) {
    try {
      const stat = await fs.stat(targetPath);
      return stat.isFile();
    } catch {
      return false;
    }
  }

  async function ensureLocalStore() {
    await fs.mkdir(dataDir, { recursive: true });
    if (!(await fileExists(dataFile))) {
      await fs.writeFile(dataFile, JSON.stringify(buildDefaultStore(), null, 2), "utf8");
    }
  }

  function wrapSupabaseError(error) {
    const message = error instanceof Error ? error.message : String(error || "Unknown Supabase error");
    return new Error(
      `Supabase storage error on table \"${supabaseTable}\": ${message}. ` +
      "Create the schema from supabase/schema.sql and check SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY.",
    );
  }

  async function ensureSupabaseStore() {
    const { data, error } = await supabase
      .from(supabaseTable)
      .select("id")
      .eq("id", STORE_ROW_ID)
      .maybeSingle();

    if (error) {
      throw wrapSupabaseError(error);
    }

    if (!data) {
      const defaultStore = normalizeStore(buildDefaultStore());
      const { error: insertError } = await supabase
        .from(supabaseTable)
        .upsert(
          {
            id: STORE_ROW_ID,
            payload: defaultStore,
            updated_at: nowIso(),
          },
          { onConflict: "id" },
        );

      if (insertError) {
        throw wrapSupabaseError(insertError);
      }
    }
  }

  async function ensureReady() {
    if (mode === "supabase") {
      await ensureSupabaseStore();
      return;
    }

    await ensureLocalStore();
  }

  async function readStore() {
    if (mode === "supabase") {
      await ensureSupabaseStore();
      const { data, error } = await supabase
        .from(supabaseTable)
        .select("payload")
        .eq("id", STORE_ROW_ID)
        .maybeSingle();

      if (error) {
        throw wrapSupabaseError(error);
      }

      return normalizeStore(data?.payload || buildDefaultStore());
    }

    await ensureLocalStore();
    const raw = await fs.readFile(dataFile, "utf8");
    return normalizeStore(JSON.parse(raw));
  }

  async function writeStore(nextStore) {
    const finalStore = normalizeStore({
      ...nextStore,
      meta: {
        ...(nextStore.meta || {}),
        updatedAt: nowIso(),
      },
    });

    writeChain = writeChain.then(async () => {
      if (mode === "supabase") {
        await ensureSupabaseStore();
        const { error } = await supabase
          .from(supabaseTable)
          .upsert(
            {
              id: STORE_ROW_ID,
              payload: finalStore,
              updated_at: nowIso(),
            },
            { onConflict: "id" },
          );

        if (error) {
          throw wrapSupabaseError(error);
        }

        return;
      }

      const tmpFile = `${dataFile}.tmp`;
      await fs.writeFile(tmpFile, JSON.stringify(finalStore, null, 2), "utf8");
      await fs.rename(tmpFile, dataFile);
    });

    return writeChain;
  }

  return {
    mode,
    description,
    ensureReady,
    readStore,
    writeStore,
  };
}