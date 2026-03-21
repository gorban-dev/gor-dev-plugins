"""Shared fixtures for dev-workflow plugin tests."""

import os
import re
from pathlib import Path

import pytest
import yaml


PLUGIN_ROOT = Path(__file__).parent.parent


@pytest.fixture
def plugin_root():
    """Return the plugin root directory."""
    return PLUGIN_ROOT


@pytest.fixture
def skills_dir():
    """Return the skills directory."""
    return PLUGIN_ROOT / "skills"


@pytest.fixture
def agents_dir():
    """Return the agents directory."""
    return PLUGIN_ROOT / "agents"


def parse_frontmatter(filepath: Path) -> dict:
    """Parse YAML frontmatter from a markdown file.

    Returns the parsed YAML dict, or empty dict if no frontmatter found.
    """
    content = filepath.read_text(encoding="utf-8")
    match = re.match(r"^---\n(.*?)\n---", content, re.DOTALL)
    if not match:
        return {}
    return yaml.safe_load(match.group(1)) or {}


def read_skill(name: str) -> tuple[dict, str]:
    """Read a skill's SKILL.md and return (frontmatter, body)."""
    filepath = PLUGIN_ROOT / "skills" / name / "SKILL.md"
    content = filepath.read_text(encoding="utf-8")
    match = re.match(r"^---\n(.*?)\n---\n(.*)", content, re.DOTALL)
    if not match:
        return {}, content
    frontmatter = yaml.safe_load(match.group(1)) or {}
    body = match.group(2)
    return frontmatter, body


def read_agent(name: str) -> tuple[dict, str]:
    """Read an agent file and return (frontmatter, body)."""
    filepath = PLUGIN_ROOT / "agents" / f"{name}.md"
    content = filepath.read_text(encoding="utf-8")
    match = re.match(r"^---\n(.*?)\n---\n(.*)", content, re.DOTALL)
    if not match:
        return {}, content
    frontmatter = yaml.safe_load(match.group(1)) or {}
    body = match.group(2)
    return frontmatter, body
