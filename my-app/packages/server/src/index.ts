import { Hono } from "hono";
import { logger } from "hono/logger";

import { getDb, todos } from "@repo/db";
import { eq } from "drizzle-orm";



const app = new Hono().basePath("/api");

app.use("*", logger());



app.get("/", async (c) => {
  try {
    const db = getDb();
    const data = await db.select().from(todos);
    return c.json(data);
  } catch (error) {
    console.error("Error fetching todos:", error);
    return c.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Internal server error",
      },
      500
    );
  }
});

app.post("/", async (c) => {
  try {
    const db = getDb();
    const body = await c.req.json();

    const [todo] = await db
      .insert(todos)
      .values({
        text: body.text,
        description: body.description,
        status: body.status,
        startAt: new Date(body.startAt),
        endAt: new Date(body.endAt),
      })
      .returning();

    return c.json(
      {
        success: true,
        data: todo,
      },
      201
    );
  } catch (error) {
    console.error("Error creating todo:", error);
    return c.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Internal server error",
      },
      500
    );
  }
});



app.put("/:id", async (c) => {
  try {
    const db = getDb();
    const id = Number(c.req.param("id"));
    const body = await c.req.json();

    const [todo] = await db
      .update(todos)
      .set({
        text: body.text,
        description: body.description,
        status: body.status,

        startAt: new Date(body.startAt),
        endAt: new Date(body.endAt),
      })
      .where(eq(todos.id, id))
      .returning();

    if (!todo) {
      return c.json(
        {
          success: false,
          message: "Todo not found",
        },
        404
      );
    }

    return c.json({
      success: true,
      data: todo,
    });
  } catch (error) {
    console.error("Error updating todo:", error);
    return c.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Internal server error",
      },
      500
    );
  }
});


app.patch("/:id", async (c) => {
  try {
    const db = getDb();
    const id = Number(c.req.param("id"));
    const body = await c.req.json();

    const updateData: {
      text?: string;
      description?: string;
      status?: "todo" | "backlog" | "inprogress" | "done" | "cancelled";
      startAt?: Date;
      endAt?: Date;
    } = {};

    if (body.text !== undefined)
      updateData.text = body.text;

    if (body.description !== undefined)
      updateData.description = body.description;

    if (body.status !== undefined)
      updateData.status = body.status;

    if (body.startAt !== undefined)
      updateData.startAt = new Date(body.startAt);

    if (body.endAt !== undefined)
      updateData.endAt = new Date(body.endAt);

    const [todo] = await db
      .update(todos)
      .set(updateData)
      .where(eq(todos.id, id))
      .returning();

    if (!todo) {
      return c.json(
        {
          success: false,
          message: "Todo not found",
        },
        404
      );
    }

    return c.json({
      success: true,
      data: todo,
    });
  } catch (error) {
    console.error("Error updating todo:", error);
    return c.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Internal server error",
      },
      500
    );
  }
});

app.delete("/:id", async (c) => {
  try {
    const db = getDb();
    const id = Number(c.req.param("id"));

    const result = await db
      .delete(todos)
      .where(eq(todos.id, id));

    if (result.rowCount === 0) {
      return c.json(
        {
          success: false,
          message: "Todo not found",
        },
        404
      );
    }

    return c.json({
      success: true,
      message: "Todo deleted",
    });
  } catch (error) {
    console.error("Error deleting todo:", error);
    return c.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Internal server error",
      },
      500
    );
  }
});


export { app };
