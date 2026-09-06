import os 
import subprocess
from pydantic import BaseModel , Field

class TerminalInput(BaseModel):
    command:str=Field(description="The shell command to run (e.g.,'python app.py')")

class ReadFileInputs(BaseModel):
    path:str = Field(description="The relative path to the file you want to read.")   #instructions to the AI.

class WriteFileInputs(BaseModel):
    path : str = Field(description="The relative path where you want to save the file.")
    content : str = Field(description="The full content to write into the files.")

# read files
def read_file (path:str) -> str:
    """Reads a file from local file system"""
    try:
        with open(path , "r" , encoding="utf-8")as f:
            return f.read()
    except Exception as e:
        return f"error readif files:{str(e)}"
    
# write files
def write_file (path:str , content:str) -> str:
    """Write in a file from local file system"""
    try:
        os.makedirs(os.path.dirname(path) , exist_ok= True) if os.path.dirname(path) else None
        with open(path , "w" , encoding="utf-8")as f:
            f.write(content)
        return f"Successfully wrote to {path}"
    except Exception as e:
        return f"Error writing file: {str(e)}"
    
# list files
def list_files(directory: str = ".") -> str:
    """Lists all files and folders in a given directory."""
    try:
        items = os.listdir(directory)
        return "\n".join(items)
    except Exception as e:
        return f"Error listing directory: {str(e)}"

# terminal commands files
def run_terminal_command(command:str) -> str:
    """Executes the shell commands and returns the output or error."""
    try:
        result = subprocess.run(
            command,
            shell = True,
            capture_output=True,
            text = True,
            timeout=30
        )

        output = result.stdout
        error = result.stderr

        if error:
            return f"Command error: \n{error}"
        return f"Command output: \n{output}"
    
    except subprocess.TimeoutExpired:
        return "Error: Command timed out after 30 seconds."
    except Exception as e:
        return f"Unexpected Error: {str(e)}"