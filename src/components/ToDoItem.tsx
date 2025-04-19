import { useState, useEffect } from "react";
import { useUpdateToDo, useDeleteToDo, useGetToDo } from "../hooks/use-to-do";
import type { Schema } from "@/amplify/data/resource";

interface ToDoItemProps {
  todo: Schema["Todo"]["type"];
}

export function ToDoItem({ todo }: ToDoItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(todo.content || "");
  const [content, setContent] = useState(todo.content || "");

  const { mutate: updateTodo, isPending: isUpdating, error: updateError } = useUpdateToDo();
  const { mutate: deleteTodo, isPending: isDeleting, error: deleteError } = useDeleteToDo();
  const { data: todoData, isLoading: isLoading, refetch: refetchTodo } = useGetToDo(todo.id);

  // Refetch the todo data
  const handleRefresh = () => {
    refetchTodo();
  }

  // Update the content when the todo data is updated
  useEffect(() => {
    setContent(todoData?.content || "");
  }, [todoData]);

  // Update the todo content in the database
  const handleEdit = () => {
    if (isEditing) {
      updateTodo({ id: todo.id, content: editContent });
      setIsEditing(false);
    } else {
      setIsEditing(true);
    }
  };

  // Delete the todo from the database
  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this todo?")) {
      deleteTodo(todo.id);
    }
  };

  return (
    <div style={{ backgroundColor: "white", padding: "10px", borderRadius: "5px" }}>
      <span style={{display: "flex", flexDirection: "row", justifyContent: "space-between"}}>
      {isEditing ? (
        <input
          style={{ width: "100%", marginRight: "10px" }}
          type="text"
          value={editContent}
          onChange={(e) => setEditContent(e.target.value)}
          disabled={isUpdating}
        />
      ) : (
        <span>{content}</span>
      )}
      <div style={{ display: "flex", gap: "10px", marginTop: "5px" }}>
        <button
          onClick={handleEdit}
          disabled={isUpdating || isDeleting}
          style={{ padding: "5px 10px" }}
        >
          {isUpdating ? "Saving..." : isEditing ? "Save" : "Edit"}
        </button>
        <button
          onClick={handleDelete}
          disabled={isDeleting || isUpdating}
          style={{ padding: "5px 10px" }}
        >
          {isDeleting ? "Deleting..." : "Delete"}
        </button>
        <button 
          onClick={handleRefresh}
          disabled={isLoading}
          style={{ padding: "5px 10px" }}
        >
          {isLoading ? "Refreshing..." : "Refresh"}
        </button>
      </div>
      </span>

      {(updateError || deleteError) && (
        <div style={{ color: "red", fontSize: "0.8em", marginTop: "5px" }}>
          {updateError?.message || deleteError?.message}
        </div>
      )}
    </div>
  );
} 