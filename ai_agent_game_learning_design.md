# AI Agent Context: Game-Based Learning System (StudyQuest)

## Core Idea
This system blends **learning + gameplay**. The player progresses through "islands" (learning modules), fights enemies, and answers questions to deal damage.

Think of it like this:
- Learning structure = W3Schools Python Tutorial (topics → subtopics → questions)
- Gameplay structure = turn-based battle system

---

## 🏝️ Island System (Learning Modules)

An **Island** represents a major topic section from the W3Schools Python tutorial.

Examples (following W3Schools structure):
- Python Basics (Intro, Syntax, Comments)
- Python Data Fundamentals (Variables, Data Types, Numbers, Casting, Strings, Booleans)
- Python Collections (Lists, Tuples, Sets, Dictionaries)
- Python Control Flow (If...Else, While Loops, For Loops)
- Python Functions & Scope (Functions, Lambda, Scope)
- Python OOP (Classes/Objects, Inheritance, Polymorphism)
- Python Advanced Topics (Modules, Math, JSON, Try...Except, User Input)

Each island contains multiple stages.

---

## 🎯 Stage System

Each **Stage** is a specific subtopic from the W3Schools tutorial.

Examples inside "Python Data Fundamentals" island:
- Python Variables
- Python Data Types
- Python Numbers
- Python Casting
- Python Strings
- Python Booleans

Each stage contains multiple questions.

---

## ⚔️ Question = Combat Mechanic

Questions are not just for learning — they are directly tied to gameplay.

### How it works:
- Each question represents an **attack turn**
- If the player answers correctly:
  - Enemy takes damage
- If the player answers incorrectly:
  - Player takes damage

This creates a loop:
> Answer → Result → Damage → Continue fight

---

## ❤️ Combat Flow

1. Player enters a stage
2. Enemy appears
3. Questions are presented one by one
4. Each answer affects health:
   - Correct → damage to enemy
   - Wrong → damage to player
5. Battle continues until:
   - Enemy HP = 0 → Stage cleared
   - Player HP = 0 → Retry stage

---

## 📚 Learning Structure (W3Schools Style)

The content hierarchy follows the W3Schools Python tutorial layout:


Each question should:
- Be directly related to the W3Schools stage content
- Gradually increase in difficulty (e.g., from syntax recognition to debugging)
- Reinforce learning through repetition

---

## 🧠 AI Agent Responsibilities

The AI agent should:

### 1. Understand Structure
- Recognize islands as W3Schools section groups
- Recognize stages as individual tutorial pages
- Recognize questions as both learning + combat

### 2. Generate Questions
- Based on the current W3Schools stage
- Matching difficulty level (beginner-friendly)
- Clear and concise (like W3Schools examples)

### 3. Evaluate Answers
- Determine correctness
- Trigger correct gameplay outcome (damage system)

### 4. Adapt Difficulty (Optional Advanced Feature)
- If player struggles → easier questions (e.g., true/false or multiple choice with obvious distractors)
- If player performs well → harder questions (e.g., "What is the output of this code?")

---

## ⚙️ Data Structure Concept

Example format based on W3Schools content:

```json
{
  "island": "Python Data Fundamentals",
  "stages": [
    {
      "name": "Python Variables",
      "questions": [
        {
          "question": "Which of the following is the correct way to create a variable in Python?",
          "choices": ["x = 5", "var x = 5", "int x = 5", "# x = 5"],
          "answer": "x = 5"
        },
        {
          "question": "What is the data type of the variable: `x = \"Hello\"`?",
          "choices": ["str", "int", "float", "list"],
          "answer": "str"
        }
      ]
    },
    {
      "name": "Python Lists",
      "questions": [
        {
          "question": "Which method would you use to add an item to the end of a list?",
          "choices": ["append()", "add()", "insert()", "push()"],
          "answer": "append()"
        }
      ]
    }
  ]
}