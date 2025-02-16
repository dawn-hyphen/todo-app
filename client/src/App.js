import React, {useState, useEffect} from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./App.css"; // Ensure this path points to the right CSS file

function App() {
    const [todos, setTodos] = useState([]);
    const [newTodo, setNewTodo] = useState("");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // Fetch todos when the page changes
    useEffect(() => {
        const fetchTodos = async () => {
            try {
                const response = await axios.get("http://localhost:5000/todos", {
                    params: {
                        page, limit: 10,
                    }
                });
                setTodos(response.data.todos);
                setTotalPages(response.data.totalPages);
            } catch (err) {
                console.log("Error fetching todos:", err);
            }
        };
        fetchTodos(page);
    }, [page,todos]); // Re-fetch todos whenever page or todos change

    // Add a new to-do item
    const addTodo = async () => {
        if (newTodo.trim()) {
            try {
                const response = await axios.post("http://localhost:5000/todos", {
                    task: newTodo,
                });

                setTodos((preTodos) => {
                    // Check if response.data already has the correct _id field or use id
                    const newTodo = response.data._id ? response.data : {
                        _id: response.data._id,
                        task: response.data.task,
                        completed: false,
                        deleting: false
                    };
                    return [...preTodos, newTodo];
                });

                // Clears the input field after adding a task
                setNewTodo("");
            } catch (err) {
                console.log("Error adding todo:", err);
            }
        }
    }

    // Delete a to-do item
    const deleteTodo = async (id) => {
        if (!id || id === 'undefined') {
            console.error("Todo ID is invalid or undefined");
            return;
        }

        // Optimistically update UI by adding fade-out effect immediately
        setTodos((prevTodos) => prevTodos.map((todo) =>
            todo._id === id ? {...todo, deleting: true} : todo));

        try {
            await axios.delete(`http://localhost:5000/todos/${id}`);
            setTodos((prevTodos) => prevTodos.filter((todo) => todo._id !== id));
        } catch (err) {
            console.error("Error deleting todo:", err);
            // Revert the deletion state if delete failed
            setTodos((prevTodos) => prevTodos.map((todo) =>
                todo._id === id ? {...todo, deleting: false} : todo
            ));
        }
    };

    // Toggle the completed status of a to-do
    const toggleComplete = async (id, currentStatus) => {
        try {
            const response = await axios.put(`http://localhost:5000/todos/${id}`, {
                completed: !currentStatus,
            });

            // Update the todos list with the updated task
            setTodos(todos.map((todo) =>
                todo._id === id ? {...todo, completed: response.data.completed} : todo));
        } catch (err) {
            console.log(err);
        }
    }

    const handleNextPage = () => {
        if (page < totalPages) {
            setPage(page + 1);
        }
    };

    const handlePreviousPage = () => {
        if (page > 1) {
            setPage(page - 1);
        }
    }

    return (
        <div className="container-fluid">
            {/* Main Content */}
            <div className="d-flex flex-column justify-content-start align-items-center mt-5">

                {/* Task List Area */}
                <div className="task-list-container text-center w-75">
                    <h1 className="mb-4">ToDo App</h1>
                    <div className="d-flex justify-content-center align-items-center mb-4">
                        <input
                            type="text"
                            className="form-control mx-2"
                            style={{ width: '400px' }}
                            value={newTodo}
                            onChange={(e) => setNewTodo(e.target.value)}
                            placeholder="Add a new task"
                        />
                        <button className="btn btn-primary" onClick={addTodo} disabled={!newTodo}>
                            Add
                        </button>
                    </div>

                    {/* Task List */}
                    <ul className="list-group" style={{ listStyleType: 'none', padding: 0 }}>
                        {todos.map((todo) => (
                            <li key={todo._id}
                                className={`list-group-item d-flex justify-content-between align-items-center`}>
                                <div className="d-flex align-items-center">
                                    <div className={`circle ${todo.completed ? "checked" : ""}`}
                                         onClick={() => toggleComplete(todo._id, todo.completed)}>
                                        {todo.completed && <span className="checkmark">&#10003;</span>}
                                    </div>
                                    <span style={{ textDecoration: todo.completed ? "line-through" : "none" }}>
                                    {todo.task}
                                </span>
                                </div>
                                <button className="btn btn-sm" onClick={() => deleteTodo(todo._id)}>
                                    <i className="bi bi-trash"></i>
                                </button>
                            </li>
                        ))}
                    </ul>

                    {/* Pagination Controls */}
                    <div className="d-flex justify-content-center align-items-center mt-4">
                        <button className="btn btn-secondary btn-sm" onClick={handlePreviousPage} disabled={page === 1}>
                            Previous
                        </button>
                        <span className="mx-3">Page {page} of {totalPages}</span>
                        <button className="btn btn-secondary btn-sm" onClick={handleNextPage} disabled={page === totalPages}>
                            Next
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default App;
