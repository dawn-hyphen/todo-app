const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Initialize the Express app
const app = express();

// Middleware
app.use(cors()); // Allows the frontend to access this API
app.use(express.json()); // Parses incoming JSON payloads in request

// MongoDB Connection
mongoose.connect("mongodb://localhost:27017/todoapp",
    {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }).then(() => console.log("Connected to MongoDB!")).catch(err => console.error("MongoDB connection error", err));

// To-Do Schema
const ToDOSchema = new mongoose.Schema({
    task: {type: String, required: true},
    completed: {type: Boolean, default: false}
});

// To-Do Model
const ToDo = mongoose.model("ToDo", ToDOSchema);

// Routes

// Get all todos
app.get("/todos", async (req, res) => {
    try {
        // Get page and limit from query parameters
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        // Calculate the skip value based on the page and limit
        const skip = (page - 1) * limit;

        // Fetch the todos from MongoDB with pagination
        const todos = await ToDo.find().skip(skip).limit(limit);

        // Count total todos to calculate total pages
        const totalTodos = await ToDo.countDocuments();
        // Calculate total pages
        const totalPages = Math.ceil(totalTodos / limit);

        res.json({todos, currentPage: page, totalPages, totalTodos}); // Send todos as JSON to the client
    } catch (err) {
        console.error(err);
        res.status(500).json({error: "Filed to fetch todos"})
    }
});


// Add a new todo
app.post("/todos", async (req, res) => {
    try {
        const {task} = req.body;
        if (!task || typeof task !== "string" || typeof task === null) {
            return res.status(400).json({error: "Task is required and must be a non-empty string"});
        }

        const todo = new ToDo({task: req.body.task,});
        await todo.save(); // Save the new task to the database
        res.json(todo); // Respond with the newly created task
    } catch (err) {
        console.error(err);
        res.status(500).json({error: "Failed to create todo"});
    }
});

// Delete a todo by ID
app.delete("/todos/:id", async (req, res) => {
    try {
        await ToDo.findByIdAndDelete(req.params.id);
        if (!todo) {
            return res.status(404).json({ error: "Todo not found" });
        }

        res.status(200).json({ message: "Todo deleted successfully" }); // Send success message
    } catch (err) {
        console.error(err);
        res.status(500).json({err: "Failed to delete todo"});
    }
});

// Update a todo by ID
app.put("/todos/:id", async (req, res) => {
    try {
        const {id} = req.params;
        const {completed} = req.body;

        if (typeof completed != "boolean") {
            return res.status(400).json({error: "Completed status must be a boolean"});
        }

        const todo = await ToDo.findByIdAndUpdate(id,
            {completed}, // Update `completed` status from the request body
            {new: true}// Return the updated document instead of the old one
        );

        if (!todo) {
            return res.status(404).json({error: "Todo not found"});
        }

        res.json(todo); // Send the updated To-Do back to the client
    } catch (err) {
        console.error(err);
        res.status(500).json({error: "Failed to update todo"});
    }
})

// Start the server
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
