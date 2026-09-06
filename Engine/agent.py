import os
import json
import sys
import time
from openai import OpenAI
from dotenv import load_dotenv
from tools import read_file, write_file, list_files, run_terminal_command

load_dotenv()

client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=os.getenv("OPENROUTER_API_KEY"),
)

tools = [
    {
        "type": "function",
        "function": {
            "name": "write_file",
            "description": "Writes content to a file. Overwrites if it already exists.",
            "parameters": {
                "type": "object",
                "properties": {
                    "path": {"type": "string", "description": "The relative path to the file"},
                    "content": {"type": "string", "description": "The full content to write"} 
                },
                "required": ["path", "content"]
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "read_file",
            "description": "Reads content from a file.",
            "parameters": {
                "type": "object",
                "properties": {
                    "path": {"type": "string", "description": "The relative path to the file you want to read."},
                },
                "required": ["path"]
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "list_files",
            "description": "Lists all files and folders in the current directory.",
            "parameters": {
                "type": "object",
                "properties": {
                    "directory": {"type": "string", "description": "The directory to list, defaults to current '.'"}
                },
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "run_terminal_command",
            "description": "Run a shell command in the terminal to test code or check system status.",
            "parameters": {
                "type": "object",
                "properties": {
                    "command": {"type": "string", "description": "The command to run, e.g., 'python script.py'"},
                },
                "required": ["command"]
            },
        },
    },
]

available_tools = {
    "write_file": write_file,
    "read_file": read_file,
    "list_files": list_files,
    "run_terminal_command": run_terminal_command,
}

def askAgent(prompt, max_steps=15):
    messages = [
        {
            "role": "system", 
            "content": """You are an execution-focused AI software engineering agent.

CRITICAL INSTRUCTIONS:
1. For any multi-step task, your first step MUST be calling `write_file` to create a `PLAN.md` outlining your approach.
2. Write the complete, non-placeholder python file using `write_file`.
3. Test the python file using `run_terminal_command` (e.g., `python file_name.py`).
4. Update `PLAN.md` as you complete steps."""
        },
        {"role": "user", "content": prompt}
    ]

    step = 0
    while step < max_steps:
        step += 1
        print(f"\n--- STEP {step} ---")
        sys.stdout.flush()

        max_retries = 3
        response = None
        for attempt in range(max_retries):
            try:
                response = client.chat.completions.create(
                    model="openai/gpt-4o-mini",
                    messages=messages,
                    tools=tools,
                    tool_choice="auto"
                )
                break
            except Exception as e:
                print(f"[ERROR]: API call failed on attempt {attempt + 1}. Reason: {str(e)}")
                sys.stdout.flush()
                if attempt == max_retries - 1:
                    return "Task Failed: Upstream API is unresponsive."
                sleep_time = 2 ** attempt
                print(f"[SYSTEM]: Retrying in {sleep_time} seconds...")
                sys.stdout.flush()
                time.sleep(sleep_time)

        response_message = response.choices[0].message
        messages.append(response_message)

        # If the AI calls tools, execute them
        if response_message.tool_calls:
            for tool_call in response_message.tool_calls:
                function_name = tool_call.function.name
                function_to_call = available_tools[function_name]
                function_args = json.loads(tool_call.function.arguments)
                
                print(f"[ACTION]: Calling {function_name}({function_args})")
                sys.stdout.flush()
                
                result = function_to_call(**function_args)
                
                print(f"[OBSERVATION]: {result}")
                sys.stdout.flush()

                messages.append({
                    "tool_call_id": tool_call.id,
                    "role": "tool",
                    "name": function_name,
                    "content": str(result),
                })
        # THE FIX: If there are no tool calls, the AI is talking to the user. We are done!
        else:
            print(f"[FINAL RESPONSE]: {response_message.content}")
            sys.stdout.flush()
            break 

    return "Task Complete."

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("[ERROR]: no prompt provided.")
        sys.stdout.flush()
        sys.exit(1)

    user_prompt = " ".join(sys.argv[1:])
    result = askAgent(user_prompt)
    print(f"[SYSTEM]: {result}")
    sys.stdout.flush()