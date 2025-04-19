import { useEffect, useState } from "react";
import { useCreateToDo } from "./hooks/use-to-do";
import { client } from "@/src/lib/amplify-client";
import type { Schema } from "@/amplify/data/resource";
import { ToDoItem } from "./components/ToDoItem";

function App() {
  const [todos, setTodos] = useState<Array<Schema["Todo"]["type"]>>([]);
  const { mutate: createTodo, isPending, error } = useCreateToDo();

  function handleCreateTodo() {
    const content = window.prompt("Todo content");
    if (content) {
      createTodo({ content });
    }
  }

  useEffect(() => {
    client.models.Todo.observeQuery().subscribe({
      next: (data) => setTodos([...data.items]),
    });
  }, []);

  return (
    <main>
      <h1>My todos</h1>
      <button onClick={handleCreateTodo} disabled={isPending}>
        {isPending ? "Creating..." : "+ new"}
      </button>
      {error && (
        <div style={{ color: "red", marginTop: "10px" }}>
          Error creating todo: {error.message}
        </div>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: "10px", margin: "10px" }}>
        {todos.map((todo) => (
          <ToDoItem key={todo.id} todo={todo} />
        ))}
      </div>
      <div>
        🥳 App successfully hosted. Try creating a new todo.
        <br />
        <a href="https://docs.amplify.aws/react/start/quickstart/#make-frontend-updates">
          Review next step of this tutorial.
        </a>
      </div>
    </main>
  );
}

export default App;
