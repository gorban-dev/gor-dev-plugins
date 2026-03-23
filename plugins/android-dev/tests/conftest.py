"""Shared fixtures for android-dev plugin tests."""

import re
from pathlib import Path

import yaml


PLUGIN_ROOT = Path(__file__).parent.parent


def parse_frontmatter(filepath: Path) -> dict:
    """Parse YAML frontmatter from a markdown file."""
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
