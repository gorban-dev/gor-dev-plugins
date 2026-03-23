"""Level 1: Validate plugin file structure."""

import json

import pytest

from conftest import PLUGIN_ROOT, parse_frontmatter


EXPECTED_SKILLS = [
    "brainstorm",
    "plan",
    "implement",
    "debug",
    "tdd",
    "review",
    "test-ui",
    "verify",
]

EXPECTED_AGENTS = [
    "android-dev",
]

EXPECTED_EXAMPLES = [
    "ExampleScreen.kt",
    "ExampleView.kt",
    "ExampleViewModel.kt",
    "ExampleViewState.kt",
    "ExampleViewEvent.kt",
    "ExampleViewAction.kt",
    "ExampleUseCase.kt",
    "ExampleData.kt",
    "ExampleResponse.kt",
    "ExampleRepository.kt",
    "IExampleRepository.kt",
    "ExampleDataSource.kt",
    "ExampleDiModuleKoin.kt",
    "ExampleDiModuleKodein.kt",
]

EXPECTED_REFERENCES = {
    "implement": [
        "architecture.md",
        "base-viewmodel.md",
        "theme-system.md",
        "modification-rules.md",
        "migration-guide.md",
    ],
    "plan": ["plan-format.md"],
    "debug": ["defense-in-depth.md", "root-cause-tracing.md"],
    "tdd": ["testable-design.md", "anti-patterns.md", "mocking-strategy.md"],
}


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

    def test_name_is_android_dev(self):
        path = PLUGIN_ROOT / ".claude-plugin" / "plugin.json"
        data = json.loads(path.read_text())
        assert data["name"] == "android-dev"

    def test_version_is_2(self):
        path = PLUGIN_ROOT / ".claude-plugin" / "plugin.json"
        data = json.loads(path.read_text())
        assert data["version"].startswith("2.")


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
        assert "name" in fm, f"Agent '{agent_name}' must have 'name'"
        assert "description" in fm, f"Agent '{agent_name}' must have 'description'"
        assert "model" in fm, f"Agent '{agent_name}' must have 'model'"
        assert "tools" in fm, f"Agent '{agent_name}' must have 'tools'"

    def test_agent_model_is_opus(self):
        path = PLUGIN_ROOT / "agents" / "android-dev.md"
        fm = parse_frontmatter(path)
        assert fm["model"] == "opus"

    def test_agent_has_write_tools(self):
        path = PLUGIN_ROOT / "agents" / "android-dev.md"
        fm = parse_frontmatter(path)
        tools = fm.get("tools", [])
        assert "Read" in tools
        assert "Write" in tools
        assert "Edit" in tools
        assert "Bash" in tools


class TestExampleFiles:
    @pytest.mark.parametrize("example_file", EXPECTED_EXAMPLES)
    def test_example_exists(self, example_file):
        path = PLUGIN_ROOT / "skills" / "implement" / "examples" / example_file
        assert path.exists(), f"Example file '{example_file}' must exist"

    @pytest.mark.parametrize("example_file", EXPECTED_EXAMPLES)
    def test_example_not_empty(self, example_file):
        path = PLUGIN_ROOT / "skills" / "implement" / "examples" / example_file
        content = path.read_text()
        assert len(content) > 50, f"Example '{example_file}' must not be empty"

    def test_example_count(self):
        examples_dir = PLUGIN_ROOT / "skills" / "implement" / "examples"
        kt_files = list(examples_dir.glob("*.kt"))
        assert len(kt_files) == 14, f"Expected 14 example files, got {len(kt_files)}"


class TestReferences:
    @pytest.mark.parametrize(
        "skill_name,ref_file",
        [
            (skill, ref)
            for skill, refs in EXPECTED_REFERENCES.items()
            for ref in refs
        ],
    )
    def test_reference_exists(self, skill_name, ref_file):
        path = PLUGIN_ROOT / "skills" / skill_name / "references" / ref_file
        assert path.exists(), f"Reference {ref_file} must exist for skill '{skill_name}'"

    @pytest.mark.parametrize(
        "skill_name,ref_file",
        [
            (skill, ref)
            for skill, refs in EXPECTED_REFERENCES.items()
            for ref in refs
        ],
    )
    def test_reference_not_empty(self, skill_name, ref_file):
        path = PLUGIN_ROOT / "skills" / skill_name / "references" / ref_file
        content = path.read_text()
        assert len(content) > 100, f"Reference {ref_file} in '{skill_name}' must not be empty"


class TestRules:
    def test_android_core_exists(self):
        path = PLUGIN_ROOT / "rules" / "android-core.md"
        assert path.exists(), "android-core.md rules must exist"

    def test_android_core_not_empty(self):
        path = PLUGIN_ROOT / "rules" / "android-core.md"
        content = path.read_text()
        assert len(content) > 500, "android-core.md must have substantial content"


class TestHooks:
    def test_hooks_json_exists(self):
        path = PLUGIN_ROOT / "hooks" / "hooks.json"
        assert path.exists(), "hooks.json must exist"

    def test_hooks_json_valid(self):
        path = PLUGIN_ROOT / "hooks" / "hooks.json"
        data = json.loads(path.read_text())
        assert "hooks" in data
        assert "SessionStart" in data["hooks"]

    def test_hooks_json_correct_nesting(self):
        """Hook entries must have matcher group → hooks array nesting."""
        path = PLUGIN_ROOT / "hooks" / "hooks.json"
        data = json.loads(path.read_text())
        for event, entries in data["hooks"].items():
            assert isinstance(entries, list), f"{event} must be an array"
            for i, entry in enumerate(entries):
                assert "hooks" in entry, (
                    f"{event}[{i}] must have 'hooks' array (correct nesting)"
                )
                assert isinstance(entry["hooks"], list), (
                    f"{event}[{i}].hooks must be an array"
                )

    def test_session_start_script_exists(self):
        path = PLUGIN_ROOT / "hooks" / "session-start.sh"
        assert path.exists(), "session-start.sh must exist"

    def test_session_start_script_executable(self):
        import os
        path = PLUGIN_ROOT / "hooks" / "session-start.sh"
        assert os.access(path, os.X_OK), "session-start.sh must be executable"


class TestNoCrossReferences:
    def test_no_android_arch_references(self):
        """No skill or agent should reference the old android-arch plugin."""
        for md_file in PLUGIN_ROOT.rglob("*.md"):
            if "node_modules" in str(md_file):
                continue
            content = md_file.read_text()
            assert "android-arch:" not in content, (
                f"{md_file.relative_to(PLUGIN_ROOT)} still references 'android-arch:'"
            )

    def test_no_dev_workflow_references(self):
        """No skill or agent should reference the old dev-workflow plugin."""
        for md_file in PLUGIN_ROOT.rglob("*.md"):
            if "node_modules" in str(md_file):
                continue
            content = md_file.read_text()
            assert "dev-workflow:" not in content, (
                f"{md_file.relative_to(PLUGIN_ROOT)} still references 'dev-workflow:'"
            )
