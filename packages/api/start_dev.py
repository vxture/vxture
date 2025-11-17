#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Development environment startup script - optimized for pnpm dev:api (Windows only)
"""
import sys
import os
import subprocess
from pathlib import Path

def check_uvicorn(venv_python: Path) -> bool:
    """Check if uvicorn is installed in the virtual environment."""
    try:
        result = subprocess.run(
            [str(venv_python), "-m", "uvicorn", "--version"],
            capture_output=True, text=True, check=True
        )
        print(f"Uvicorn version: {result.stdout.strip()}")
        return True
    except subprocess.CalledProcessError:
        print("Uvicorn is not installed in the virtual environment.")
        print("Please run: pip install -r requirements.txt")
        return False

def load_dotenv(api_dir: Path) -> None:
    """Load .env file if exists (for local development)."""
    dotenv_path = api_dir / ".env"
    if dotenv_path.exists():
        try:
            from dotenv import load_dotenv
            load_dotenv(dotenv_path)
            print(f"Loaded environment variables from {dotenv_path}")
        except ImportError:
            print("python-dotenv not installed, skipping .env loading.")

def main() -> None:
    # Get API directory and venv python path
    api_dir = Path(__file__).parent.absolute()
    venv_python = api_dir / ".venv" / "Scripts" / "python.exe"

    print(f"API directory: {api_dir}")
    print(f"Python interpreter: {venv_python}")

    # Check Windows platform
    if os.name != "nt":
        print("This script is for Windows only.")
        sys.exit(1)

    # Check virtual environment
    if not venv_python.exists():
        print(f"Virtual environment not found: {venv_python}")
        print("Please create it first: python -m venv .venv")
        sys.exit(1)

    # Check app directory
    app_dir = api_dir / "app"
    if not app_dir.exists():
        print(f"app directory not found: {app_dir}")
        sys.exit(1)

    # Check uvicorn
    if not check_uvicorn(venv_python):
        sys.exit(1)

    # Load .env if exists
    load_dotenv(api_dir)

    # Build command
    cmd = [
        str(venv_python),
        "-m", "uvicorn",
        "app.main:app",
        "--host", "0.0.0.0",
        "--port", "8000",
        "--reload"
    ]

    print(f"Launch command: {' '.join(cmd)}")
    print(f"Working directory: {api_dir}")
    print("=" * 50)

    try:
        os.chdir(api_dir)
        subprocess.run(cmd, check=True)
    except subprocess.CalledProcessError as e:
        print(f"Startup failed: {e}")
        sys.exit(1)
    except KeyboardInterrupt:
        print("\nServer stopped")
        sys.exit(0)

if __name__ == "__main__":
    main()
