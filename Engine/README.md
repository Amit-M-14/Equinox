# 🤖 Self-Correcting AI Coding Agent

An autonomous AI engineering agent capable of writing, testing, executing, debugging, and fixing code locally using a dynamic **ReAct (Reason + Act)** loop.

Unlike passive AI chatbots, this agent actively interacts with the filesystem and terminal, observes runtime failures, updates its reasoning context, and self-corrects until execution succeeds.

---

# 🌟 Features

## 🔁 Autonomous Self-Correction
- Detects Python runtime errors automatically
- Captures `Traceback` outputs
- Feeds errors back into the LLM context
- Rewrites broken code dynamically
- Retries execution until success

---

## 🧠 ReAct Agent Architecture
Implements a full:
- **Thought**
- **Action**
- **Observation**
- **Correction**

execution cycle.

---

## 📋 Dynamic Planning System
The agent maintains a live `PLAN.md` file:
- Tracks completed tasks
- Adds debugging subtasks automatically
- Maintains operational alignment during long workflows

---

## 📂 Workspace Awareness
Supports:
- File reading
- File writing
- Directory exploration
- Automatic folder creation

---

## 🛡️ Safe Execution Controls
- Sandboxed subprocess execution
- Timeout protections
- Maximum step thresholds
- Explicit `TERMINATE` completion handling

---

# 🏗️ Architecture Overview

The framework is divided into three core systems:

## 1. The Brain 🧠
Powered by Large Language Models through OpenRouter.

Responsible for:
- Reasoning
- Planning
- Debugging
- Tool selection
- Self-correction

---

## 2. The Hands 🛠️
Deterministic tool wrappers built with Python and Pydantic.

Responsible for:
- File operations
- Shell execution
- Environment interaction

---

## 3. The Memory 📚
Maintains:
- Conversation state
- Runtime observations
- PLAN.md tracking
- Error histories

---

# 🔄 ReAct Execution Loop

```text
[ User Prompt ]
        │
        ▼
 ┌──────────────┐
 │ 1. THOUGHT   │◄────────────────────────────────┐
 └──────┬───────┘                                 │
        │ (Chooses tool & parameters)             │
        ▼                                         │
 ┌──────────────┐                                 │
 │  2. ACTION   │                                 │
 └──────┬───────┘                                 │
        │ (Runs tools.py wrappers)                │
        ▼                                         │
 ┌──────────────┐       ┌──────────────────┐      │
 │3. OBSERVATION│──────►│  4. CORRECTION   │──────┘
 └──────────────┘       │ (Runtime errors │
                        │  & tracebacks)  │
                        └──────────────────┘

```

# 🚀 Getting Started

## 📋 Prerequisites

- Python 3.10+
- OpenRouter API Key
- Git

---

# 📦 Installation

## 1️⃣ Clone the Repository

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd self-correcting-agent
---

## 2️⃣ Create a Virtual Environment

### Linux / macOS

```bash
python -m venv venv
source venv/bin/activate
```

### Windows

```bash
python -m venv venv
venv\Scripts\activate
```

---

## 3️⃣ Install Dependencies

```bash
pip install openai pydantic python-dotenv
```

---

# 🔐 Environment Setup

Create a `.env` file:

```env
OPENROUTER_API_KEY=your_openrouter_api_key_here
```

---

# 🚫 .gitignore

Create a `.gitignore` file:

```gitignore
.env
__pycache__/
*.pyc
.DS_Store
```

---

# 🛠️ Tool Specifications

## `list_files(directory=".") -> str`

Returns a formatted directory tree.

### Example

```python
list_files("src")
```

---

## `read_file(path: str) -> str`

Safely reads text from files.

### Example

```python
read_file("main.py")
```

---

## `write_file(path: str, content: str) -> str`

Creates or overwrites files dynamically.

### Features

- Automatic folder creation
- Nested path support
- Safe overwrite handling

### Example

```python
write_file("tests/test_math.py", code)
```

---

## `run_terminal_command(command: str) -> str`

Executes shell commands safely using `subprocess.run`.

### Features

- Captures stdout/stderr
- Timeout protection
- Returns execution feedback directly to the agent

### Example

```python
run_terminal_command("python test_math.py")
```

---

# 🧠 Self-Correction Workflow

When execution fails:

1. Runtime errors are captured
2. Tracebacks are injected back into the LLM context
3. The agent analyzes the failure
4. The faulty file is rewritten
5. Tests rerun automatically
6. Loop continues until successful execution

---

# 📈 Example Workflow

## User Prompt

```text
Build:
- math_utils.py
- factorial function
- test_math.py
- automated tests
- PLAN.md progress tracking
```

---

## Autonomous Execution

### Step 1

Creates:

```text
PLAN.md
```

Tracking:

- Pending tasks
- Progress states
- Debug subtasks

---

### Step 2

Generates:

```text
math_utils.py
```

Containing:

- Factorial logic
- Edge-case handling

---

### Step 3

Generates:

```text
test_math.py
```

Containing:

```python
assert factorial(5) == 120
```

---

### Step 4

Runs:

```bash
python test_math.py
```

---

### Step 5 — Self-Correction

If execution fails:

- Errors are analyzed
- Files rewritten
- Tests rerun automatically

Once successful:

```text
TERMINATE
```
---

# ⭐ Inspiration

Inspired by:

- ReAct Agents
- Autonomous Software Engineering
- Self-healing execution pipelines
- Tool-augmented LLM systems
- Modern AI coding agents
