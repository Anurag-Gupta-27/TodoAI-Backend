const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')
const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

// Import the Task model
const Task = require('./models/Tasks.mongodb.js');

const app = express()
const port = 3000

// Initialize the Gemini model
const MODEL_NAME = "gemini-1.0-pro-latest";
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const model = genAI.getGenerativeModel({ model: MODEL_NAME });

app.use(express.json());
mongoose.connect("mongodb://localhost:27017/Todo-AI");
app.use(cors({credentials: true, origin: 'http://localhost:5173'}));

// Add the new add-task endpoint
app.post('/add-task', async (req, res) => {
  try {
    const { text, completed, description, color } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: 'Task text is required' });
    }

    // Create a new task using the Task model
    const newTask = new Task({
      text,
      completed: completed || false,
      description: description || '',
      color: color || '#ffffff',
    });

    // Save the new task to the database
    await newTask.save();

    res.status(201).json(newTask);
  } catch (error) {
    console.error('Error adding task:', error);
    res.status(500).json({ error: 'Failed to add task' });
  }
});

// Your existing generate-description endpoint
app.post('/generate-description', async (req, res) => {
  try {
    const { task } = req.body;
    
    console.log("Received task:", task);
    if (!task) {
      return res.status(400).json({ error: 'Task is required in the request body' });
    }

    const prompt = `Given the task "${task}", provide a short, helpful reminder or tip (max 15 words) that's relevant and sometimes humorous. Don't repeat the task itself.`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const generatedReminder = response.text();

    console.log("Generated Reminder:", generatedReminder);
    res.status(200).json({ reminder: generatedReminder });
    
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to generate reminder', details: error.message });
  }
});

//get all the tasks from the database
app.get('/tasks', async (req, res) => {
  try {
    const tasks = await Task.find();
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`)
});
