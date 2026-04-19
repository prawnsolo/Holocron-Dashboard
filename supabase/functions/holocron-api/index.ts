import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { Hono } from "hono";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const MCP_ACCESS_KEY = Deno.env.get("MCP_ACCESS_KEY")!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const app = new Hono();

app.get("*", async (c) => {
  const provided = c.req.header("x-brain-key") || c.req.query("key");
  if (provided !== MCP_ACCESS_KEY) return c.json({ error: "Unauthorized" }, 401);

  try {
    const { data: rawThoughts, error } = await supabase
      .from("thoughts")
      .select("id, content, metadata, created_at")
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) throw error;

    return c.json({
      tasks: rawThoughts
        .filter(t => t.metadata?.type === "task")
        .map(t => ({
          id: t.id,
          text: t.content,
          dueDate: t.metadata?.dates_mentioned?.[0] || t.created_at.split('T')[0],
          status: t.metadata?.status || "todo",
          priority: t.metadata?.priority || "medium",
          project: t.metadata?.topics?.[0] || "General"
        })),
      projects: Array.from(new Set(rawThoughts.flatMap(t => t.metadata?.topics || [])))
        .map((name, i) => ({
          id: i,
          name: name,
          status: "active",
          lastTouched: rawThoughts.find(t => t.metadata?.topics?.includes(name))?.created_at.split('T')[0] || ""
        })),
      people: Array.from(new Set(rawThoughts.flatMap(t => t.metadata?.people || [])))
        .map((name, i) => ({
          id: i,
          name: name,
          lastContact: rawThoughts.find(t => t.metadata?.people?.includes(name))?.created_at.split('T')[0] || ""
        })),
      memories: rawThoughts.slice(0, 10).map(t => ({
        id: t.id,
        content: t.content,
        category: t.metadata?.type || "observation",
        date: t.created_at.split('T')[0]
      })),
      stats: {
        total: rawThoughts.length,
        types: rawThoughts.reduce((acc: any, t) => {
          const type = t.metadata?.type || "other";
          acc[type] = (acc[type] || 0) + 1;
          return acc;
        }, {})
      }
    });
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

Deno.serve(app.fetch);
