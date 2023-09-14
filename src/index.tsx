import html from "@elysiajs/html";
import { Elysia, t } from "elysia";
import * as elements from "typed-html";
import { db } from "./db";
import { Todo, todos } from "./db/schema";
import { eq } from "drizzle-orm";

const app = new Elysia()
  .use(html())
  .get("/", ({ html }) =>
    html(
      <BaseHTML>
        <body
          class='flex w-full h-screen justify-center items-center'
          hx-get='/todos'
          hx-trigger='load'
        ></body>
      </BaseHTML>
    )
  )
  .get("/todos", async () => {
    //Get all
    const data = await db.select().from(todos).all();
    return <TodoList todos={data} />;
  })
  .post(
    //Update Todo as completed
    "/todos/toggle/:id",
    async ({ params }) => {
      const oldTodo = await db
        .select()
        .from(todos)
        .where(eq(todos.id, params.id))
        .get();
      const newTodo = await db
        .update(todos)
        .set({ completed: !oldTodo?.completed })
        .returning()
        .get();
      return <TodoItem {...newTodo} />;
    },
    {
      params: t.Object({
        id: t.Numeric(),
      }),
    }
  )
  .delete(
    //Delete Todo
    "/todos/:id",
    async ({ params }) => {
      await db.delete(todos).where(eq(todos.id, params.id)).run();
    },
    {
      params: t.Object({
        id: t.Numeric(),
      }),
    }
  )
  .post(
    //Create new Todo
    "/todos",
    async ({ body }) => {
      if (body.content.length === 0) {
        throw new Error("Content cannot be empty");
      }
      const newTodo = await db.insert(todos).values(body).returning().get();
      return <TodoItem {...newTodo} />;
    },
    {
      body: t.Object({
        content: t.String(),
      }),
    }
  )
  .listen(3000);

const BaseHTML = ({ children }: elements.Children) => `
  <DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>The BETH Stack</title>
        <script src="https://unpkg.com/htmx.org@1.9.3"></script>
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      ${children}
    </html>
  </DOCTYPE>
`;

const TodoItem = ({ content, completed, id }: Todo) => {
  return (
    <div class='flex flex-row space-x-3'>
      <p>{content}</p>
      <input
        type='checkbox'
        checked={completed}
        hx-post={`todos/toggle/${id}`}
        hx-target='closest div'
        hx-swap='outerHTML'
      />
      <button
        class='text-red-500'
        hx-delete={`/todos/${id}`}
        hx-target='closest div'
        hx-swap='outerHTML'
      >
        X
      </button>
    </div>
  );
};

const TodoList = ({ todos }: { todos: Todo[] }) => {
  return (
    <div>
      {todos.map((todo) => (
        <TodoItem {...todo} />
      ))}
      <TodoForm />
    </div>
  );
};

const TodoForm = () => {
  return (
    <form
      hx-post='/todos'
      hx-swap='beforebegin'
      class='flex flex-row space-x-3'
      _='on submit target.reset()'
    >
      <input type='text' name='content' class='border border-black' />
      <button type='submit'>Add</button>
    </form>
  );
};
