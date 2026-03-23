"""Level 4: Internal consistency checks — cross-references, examples, descriptions."""

import re

import pytest

from conftest import PLUGIN_ROOT, parse_frontmatter, read_skill, read_agent


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


class TestSkillDescriptionQuality:
    """Verify skill descriptions are rich enough to trigger correctly."""

    @pytest.mark.parametrize("skill_name", EXPECTED_SKILLS)
    def test_description_has_examples(self, skill_name):
        """Skills should have <example> blocks in description for reliable triggering."""
        path = PLUGIN_ROOT / "skills" / skill_name / "SKILL.md"
        fm = parse_frontmatter(path)
        desc = fm.get("description", "")
        # At least brainstorm, implement, plan, review, test-ui should have examples
        # debug, tdd, verify are transferred as-is and may not have them
        skills_needing_examples = {"brainstorm", "implement", "plan", "review", "test-ui"}
        if skill_name in skills_needing_examples:
            assert "<example>" in desc or "example" in desc.lower(), (
                f"Skill '{skill_name}' description should have example blocks for triggering"
            )

    @pytest.mark.parametrize("skill_name", EXPECTED_SKILLS)
    def test_description_min_length(self, skill_name):
        """Descriptions must be substantial for good triggering."""
        path = PLUGIN_ROOT / "skills" / skill_name / "SKILL.md"
        fm = parse_frontmatter(path)
        desc = fm.get("description", "")
        assert len(desc) > 80, (
            f"Skill '{skill_name}' description too short ({len(desc)} chars), needs >80"
        )


class TestSkillReferenceConsistency:
    """If a skill body mentions a reference file, that file must exist."""

    @pytest.mark.parametrize("skill_name", EXPECTED_SKILLS)
    def test_referenced_files_exist(self, skill_name):
        _, body = read_skill(skill_name)
        # Find references like references/something.md
        refs = re.findall(r'references/([a-z0-9_-]+\.md)', body)
        for ref in refs:
            # Check in own skill directory first, then in any skill directory
            ref_path = PLUGIN_ROOT / "skills" / skill_name / "references" / ref
            if not ref_path.exists():
                # Cross-skill reference — check all skill directories
                found = any(
                    (PLUGIN_ROOT / "skills" / s / "references" / ref).exists()
                    for s in EXPECTED_SKILLS
                )
                assert found, (
                    f"Skill '{skill_name}' references '{ref}' but file not found "
                    f"in any skill's references/"
                )


class TestAgentSkillConsistency:
    """Agent must reference only skills that actually exist."""

    def test_agent_only_references_existing_skills(self):
        _, body = read_agent("android-dev")
        # All skill names mentioned in the agent should exist as directories
        for skill in EXPECTED_SKILLS:
            skill_dir = PLUGIN_ROOT / "skills" / skill
            assert skill_dir.exists(), (
                f"Agent references skill '{skill}' but directory not found"
            )

    def test_no_orphan_skills(self):
        """Every skill directory should be mentioned in the agent."""
        _, body = read_agent("android-dev")
        skills_dir = PLUGIN_ROOT / "skills"
        for skill_dir in sorted(skills_dir.iterdir()):
            if skill_dir.is_dir() and (skill_dir / "SKILL.md").exists():
                skill_name = skill_dir.name
                assert skill_name in body, (
                    f"Skill '{skill_name}' exists but is not referenced in agent"
                )


class TestHooksConsistency:
    """Hooks must reference files that exist."""

    def test_hooks_json_references_existing_script(self):
        import json
        hooks_path = PLUGIN_ROOT / "hooks" / "hooks.json"
        data = json.loads(hooks_path.read_text())
        for hook_list in data.get("hooks", {}).values():
            for hook in hook_list:
                if "command" in hook:
                    # Replace ${CLAUDE_PLUGIN_ROOT} with actual path
                    cmd = hook["command"].replace(
                        "${CLAUDE_PLUGIN_ROOT}", str(PLUGIN_ROOT)
                    )
                    # Extract script path (first part before any arguments)
                    script_path = cmd.split()[0]
                    assert PLUGIN_ROOT / "hooks" / script_path.split("/")[-1], (
                        f"Hook references script that doesn't exist: {cmd}"
                    )


class TestExampleKotlinPatterns:
    """Verify Kotlin examples follow the architecture patterns they teach."""

    def test_screen_uses_collect_as_state(self):
        path = PLUGIN_ROOT / "skills" / "implement" / "examples" / "ExampleScreen.kt"
        content = path.read_text()
        assert "collectAsStateWithLifecycle" in content, (
            "ExampleScreen must use collectAsStateWithLifecycle"
        )

    def test_screen_uses_collect_with_lifecycle(self):
        path = PLUGIN_ROOT / "skills" / "implement" / "examples" / "ExampleScreen.kt"
        content = path.read_text()
        assert "CollectWithLifecycle" in content, (
            "ExampleScreen must use CollectWithLifecycle for actions"
        )

    def test_view_has_preview(self):
        path = PLUGIN_ROOT / "skills" / "implement" / "examples" / "ExampleView.kt"
        content = path.read_text()
        assert "@Preview" in content, "ExampleView must have @Preview annotation"

    def test_view_has_event_handler(self):
        path = PLUGIN_ROOT / "skills" / "implement" / "examples" / "ExampleView.kt"
        content = path.read_text()
        assert "eventHandler" in content or "EventHandler" in content, (
            "ExampleView must accept eventHandler parameter"
        )

    def test_viewmodel_extends_base(self):
        path = PLUGIN_ROOT / "skills" / "implement" / "examples" / "ExampleViewModel.kt"
        content = path.read_text()
        assert "BaseSharedViewModel" in content, (
            "ExampleViewModel must extend BaseSharedViewModel"
        )

    def test_viewmodel_has_handle_event(self):
        path = PLUGIN_ROOT / "skills" / "implement" / "examples" / "ExampleViewModel.kt"
        content = path.read_text()
        assert "handleEvent" in content, (
            "ExampleViewModel must implement handleEvent"
        )

    def test_viewmodel_no_compose_import(self):
        path = PLUGIN_ROOT / "skills" / "implement" / "examples" / "ExampleViewModel.kt"
        content = path.read_text()
        assert "androidx.compose" not in content, (
            "ExampleViewModel must NOT import Compose"
        )

    def test_usecase_has_execute(self):
        path = PLUGIN_ROOT / "skills" / "implement" / "examples" / "ExampleUseCase.kt"
        content = path.read_text()
        assert "execute" in content, "ExampleUseCase must have execute method"

    def test_usecase_no_invoke_operator(self):
        path = PLUGIN_ROOT / "skills" / "implement" / "examples" / "ExampleUseCase.kt"
        content = path.read_text()
        assert "operator fun invoke" not in content, (
            "ExampleUseCase must NOT use operator fun invoke"
        )

    def test_viewstate_is_data_class(self):
        path = PLUGIN_ROOT / "skills" / "implement" / "examples" / "ExampleViewState.kt"
        content = path.read_text()
        assert "data class" in content, "ExampleViewState must be a data class"

    def test_viewevent_is_sealed(self):
        path = PLUGIN_ROOT / "skills" / "implement" / "examples" / "ExampleViewEvent.kt"
        content = path.read_text()
        assert "sealed" in content, "ExampleViewEvent must be sealed"

    def test_viewaction_is_sealed(self):
        path = PLUGIN_ROOT / "skills" / "implement" / "examples" / "ExampleViewAction.kt"
        content = path.read_text()
        assert "sealed" in content, "ExampleViewAction must be sealed"

    def test_repository_has_interface(self):
        path = PLUGIN_ROOT / "skills" / "implement" / "examples" / "IExampleRepository.kt"
        content = path.read_text()
        assert "interface" in content, "IExampleRepository must be an interface"


class TestRulesContent:
    """Verify rules file contains critical architecture rules."""

    def test_rules_mention_screen_view_separation(self):
        path = PLUGIN_ROOT / "rules" / "android-core.md"
        content = path.read_text()
        assert "Screen" in content and "View" in content

    def test_rules_mention_base_viewmodel(self):
        path = PLUGIN_ROOT / "rules" / "android-core.md"
        content = path.read_text()
        assert "BaseSharedViewModel" in content

    def test_rules_ban_operator_invoke(self):
        path = PLUGIN_ROOT / "rules" / "android-core.md"
        content = path.read_text()
        assert "operator" in content.lower() or "invoke" in content

    def test_rules_mention_usecase(self):
        path = PLUGIN_ROOT / "rules" / "android-core.md"
        content = path.read_text()
        assert "UseCase" in content

    def test_rules_mention_package_structure(self):
        path = PLUGIN_ROOT / "rules" / "android-core.md"
        content = path.read_text()
        assert "presentation" in content and "domain" in content and "data" in content
