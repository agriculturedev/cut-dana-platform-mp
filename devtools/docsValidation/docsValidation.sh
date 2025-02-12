#!/bin/sh

# Activates the Python virtual environment and then validates the documentation.
if [ -f ".venv/bin/activate" ]; then

    . .venv/bin/activate
    python -m mkdocs build --strict
    deactivate

else
     echo "You are missing the local Python virtual environment in a folder named '.venv'. Please follow these steps:"
     echo "1. Install Python"
     echo "2. Run 'python -m venv .venv' to create a virtual environment"
     echo "3. Activate the venv by running 'source .venv/bin/activate'"
     echo "4. Run 'pip install -r .\python-dependencies.txt'"
     echo "Now the virtual environment is setup and you can rerun this npm task."
     exit 1
fi
