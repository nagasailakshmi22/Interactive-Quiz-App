const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// MongoDB Connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/quizapp';
mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log('MongoDB error:', err));

// Question Schema
const questionSchema = new mongoose.Schema({
  question: String,
  options: [String],
  answer: String,
  category: String
});
const Question = mongoose.model('Question', questionSchema);

// Score Schema
const scoreSchema = new mongoose.Schema({
  playerName: String,
  score: Number,
  total: Number,
  date: { type: Date, default: Date.now }
});
const Score = mongoose.model('Score', scoreSchema);

// Seed sample questions
async function seedQuestions() {
  const count = await Question.countDocuments();
  if (count === 0) {
    await Question.insertMany([
      { question: "What does HTML stand for?", options: ["HyperText Markup Language", "High Tech Modern Language", "HyperText Modern Links", "None"], answer: "HyperText Markup Language", category: "Web" },
      { question: "Which language runs in a web browser?", options: ["Java", "Python", "JavaScript", "C++"], answer: "JavaScript", category: "Web" },
      { question: "What is Node.js?", options: ["A browser", "A JavaScript runtime", "A database", "A framework"], answer: "A JavaScript runtime", category: "Backend" },
      { question: "What does API stand for?", options: ["Application Programming Interface", "App Program Integration", "Automated Process Interface", "None"], answer: "Application Programming Interface", category: "General" },
      { question: "Which database is NoSQL?", options: ["MySQL", "PostgreSQL", "MongoDB", "SQLite"], answer: "MongoDB", category: "Database" },
      { question: "What is the use of Express.js?", options: ["Frontend styling", "Backend web framework", "Database management", "None"], answer: "Backend web framework", category: "Backend" },
      { question: "What does CSS stand for?", options: ["Cascading Style Sheets", "Computer Style System", "Creative Style Sheets", "None"], answer: "Cascading Style Sheets", category: "Web" },
      { question: "Which HTTP method is used to send data?", options: ["GET", "POST", "DELETE", "HEAD"], answer: "POST", category: "General" },
      { question: "What is MongoDB?", options: ["SQL Database", "NoSQL Database", "A programming language", "A framework"], answer: "NoSQL Database", category: "Database" },
      { question: "What is REST?", options: ["A sleep pattern", "Representational State Transfer", "A database", "None"], answer: "Representational State Transfer", category: "General" },
    ]);
    console.log('Sample questions seeded!');
  }
}
seedQuestions();

// ROUTES

// Get all questions
app.get('/api/questions', async (req, res) => {
  try {
    const questions = await Question.find().select('-answer');
    res.json(questions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Submit quiz and get score
app.post('/api/submit', async (req, res) => {
  try {
    const { playerName, answers } = req.body;
    const questions = await Question.find();
    let score = 0;
    questions.forEach(q => {
      if (answers[q._id] === q.answer) score++;
    });
    await Score.create({ playerName, score, total: questions.length });
    res.json({ score, total: questions.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get leaderboard
app.get('/api/scores', async (req, res) => {
  try {
    const scores = await Score.find().sort({ score: -1 }).limit(10);
    res.json(scores);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Serve frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
