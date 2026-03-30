"use client";
import { useState } from "react";

export default function Home() {
  const [todos, setTodos] = useState([]);
  const [title, setTitle] = useState("");
  const [edit, setEdit] = useState(false);
  const [id, setId] = useState("");

  const handleSUbmit = (e) => {
    e.preventDefault();

    if (!edit) {
      if (title == "") {
        alert("Please enter appropriate value");
        return;
      }

      const min = 1;
      const max = 1000;
      const id = Math.floor(Math.random() * (max - min + 1)) + min;

      setTodos((prev) => [
        ...prev,
        { id: id, title: title, status: "Pending" },
      ]);

      setTitle("");
    } else {
      let updatedTodo = todos.map((todo) =>
        todo.id == id ? { ...todo, title: title } : todo,
      );

      setTodos(updatedTodo);
      setTitle("");
      setEdit(false);
    }
  };

  const handleEdit = (id) => {
    setEdit(true);
    setId(id);

    const record = todos.find((todo) => todo.id == id);

    console.log(record.title);

    setTitle(record.title);
  };

  const handleDelete = (id) => {
    let deleteRecord = confirm("Do You Really Want To Delete This Record?");

    if (deleteRecord) {
      const updatedTodo = todos.filter((todo) => todo.id != id);
      setTodos(updatedTodo);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 font-sans">
      {/* Header */}
      <header className="mb-6 text-center">
        <h1 className="text-3xl font-bold">Todo Application</h1>
      </header>

      <form onSubmit={handleSUbmit}>
        <section className="mb-4 flex gap-2">
          <input
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
            }}
            type="text"
            placeholder="Enter new todo"
            className="flex-1 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
            {edit ? "Edit" : "Submit"}
          </button>
        </section>
      </form>

      {/* Filter Buttons */}
      <section className="mb-4 flex gap-2 justify-center">
        <button className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300">
          All
        </button>
        <button className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300">
          Completed
        </button>
        <button className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300">
          Pending
        </button>
      </section>

      <ul className="divide-y divide-gray-300">
        {todos.map((todo) => (
          <li key={todo.id} className="py-2 flex justify-between">
            <span>{todo.title}</span>
            <span>{todo.status}</span>
            <span>
              <button
                onClick={() => handleEdit(todo.id)}
                className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors"
              >
                Edit
              </button>
            </span>
            <span>
              <button
                onClick={() => handleDelete(todo.id)}
                className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
              >
                Delete
              </button>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
