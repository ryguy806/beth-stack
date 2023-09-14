import html from "@elysiajs/html";
import { Elysia, t } from "elysia";
import * as elements from "typed-html";

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
  .get("/todos", () => <TodoList todos={db} />)
  .post(
    "/todos/toggle/:id",
    ({ params }) => {
      const todo = db.find((todo) => todo.id === params.id);
      if (todo) {
        todo.completed = !todo.completed;
        return <TodoItem {...todo} />;
      }
    },
    {
      params: t.Object({
        id: t.Numeric(),
      }),
    }
  )
  .delete(
    "/todos/:id",
    ({ params }) => {
      const todo = db.find((todo) => todo.id === params.id);
      if (todo) {
        db.splice(db.indexOf(todo), 1);
      }
    },
    {
      params: t.Object({
        id: t.Numeric(),
      }),
    }
  )
  .post(
    "/todos",
    ({ body }) => {
      if (body.content.length === 0) {
        throw new Error("Content cannot be empty");
      }
      const newTodo = {
        id: lastID++,
        content: body.content,
        completed: false,
      };
      db.push(newTodo);
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

type Todo = {
  id: number;
  content: string;
  completed: boolean;
};

let lastID = 2;
const db: Todo[] = [
  { id: 1, content: "learn beth stack", completed: false },
  { id: 2, content: "learn vim", completed: false },
];

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
    >
      <input type='text' name='content' class='border border-black' />
      <button type='submit'>Add</button>
    </form>
  );
};
