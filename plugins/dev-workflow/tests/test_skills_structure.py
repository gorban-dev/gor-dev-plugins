"""Level 1: Validate plugin file structure."""

import json
from pathlib import Path

import pytest

from conftest import PLUGIN_ROOT, parse_frontmatter


EXPECTED_SKILLS = [
    "design",
    "plan-task",
    "execute-plan",
    "verify",
    "debug",
    "tdd",
    "code-review",
]

EXPECTED_AGENTS = [
    "code-reviewer",
    "plan-reviewer",
]


class TestPluginJson:
    def test_exists(self):
        path = PLUGIN_ROOT / ".claude-plugin" / "plugin.json"
        assert path.exists(), "plugin.json must exist"

    def test_valid_json(self):
        path = PLUGIN_ROOT / ".claude-plugin" / "plugin.json"
        data = json.loads(path.read_text())
        assert "name" in data
        assert "version" in data
        assert "description" in data

    def test_name_is_dev_workflow(self):
        path = PLUGIN_ROOT / ".claude-plugin" / "plugin.json"
        data = json.loads(path.read_text())
        assert data["name"] == "dev-workflow"


class TestSkillFiles:
    @pytest.mark.parametrize("skill_name", EXPECTED_SKILLS)
    def test_skill_md_exists(self, skill_name):
        path = PLUGIN_ROOT / "skills" / skill_name / "SKILL.md"
        assert path.exists(), f"SKILL.md must exist for skill '{skill_name}'"

    @pytest.mark.parametrize("skill_name", EXPECTED_SKILLS)
    def test_skill_has_frontmatter(self, skill_name):
        path = PLUGIN_ROOT / "skills" / skill_name / "SKILL.md"
        fm = parse_frontmatter(path)
        assert fm, f"Skill '{skill_name}' must have YAML frontmatter"

    @pytest.mark.parametrize("skill_name", EXPECTED_SKILLS)
    def test_skill_has_description(self, skill_name):
        path = PLUGIN_ROOT / "skills" / skill_name / "SKILL.md"
        fm = parse_frontmatter(path)
        assert "description" in fm, f"Skill '{skill_name}' must have a description"
        assert len(fm["description"]) > 50, f"Skill '{skill_name}' description is too short"


class TestAgentFiles:
    @pytest.mark.parametrize("agent_name", EXPECTED_AGENTS)
    def test_agent_file_exists(self, agent_name):
        path = PLUGIN_ROOT / "agents" / f"{agent_name}.md"
        assert path.exists(), f"Agent file must exist for '{agent_name}'"

    @pytest.mark.parametrize("agent_name", EXPECTED_AGENTS)
    def test_agent_has_required_frontmatter(self, agent_name):
        path = PLUGIN_ROOT / "agents" / f"{agent_name}.md"
        fm = parse_frontmatter(path)
        assert "name" in fm, f"Agent '{agent_name}' must have 'name' in frontmatter"
        assert "description" in fm, f"Agent '{agent_name}' must have 'description'"
        assert "model" in fm, f"Agent '{agent_name}' must have 'model'"
        assert "tools" in fm, f"Agent '{agent_name}' must have 'tools'"

    @pytest.mark.parametrize("agent_name", EXPECTED_AGENTS)
    def test_agent_is_read_only(self, agent_name):
        path = PLUGIN_ROOT / "agents" / f"{agent_name}.md"
        fm = parse_frontmatter(path)
        tools = fm.get("tools", [])
        assert "Read" in tools, f"Agent '{agent_name}' must have Read tool"
        write_tools = {"Write", "Edit", "Bash"}
        assert not write_tools.intersection(tools), (
            f"Agent '{agent_name}' must be read-only (no Write/Edit/Bash)"
        )


class TestReferences:
    def test_plan_format_exists(self):
        path = PLUGIN_ROOT / "skills" / "plan-task" / "references" / "plan-format.md"
        assert path.exists(), "plan-format.md reference must exist"

    def test_plan_format_not_empty(self):
        path = PLUGIN_ROOT / "skills" / "plan-task" / "references" / "plan-format.md"
        content = path.read_text()
        assert len(content) > 100, "plan-format.md must not be empty"


class TestHooks:
    def test_hooks_json_exists(self):
        path = PLUGIN_ROOT / "hooks" / "hooks.json"
        assert path.exists(), "hooks.json must exist"

    def test_hooks_json_valid(self):
        path = PLUGIN_ROOT / "hooks" / "hooks.json"
        data = json.loads(path.read_text())
        assert "hooks" in data
        assert "SessionStart" in data["hooks"]
