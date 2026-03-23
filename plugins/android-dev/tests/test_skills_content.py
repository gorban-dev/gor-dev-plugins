"""Level 2: Verify critical content in skills and agent."""

from conftest import read_skill, read_agent


class TestImplementSkill:
    def test_has_create_mode(self):
        _, body = read_skill("implement")
        assert "CREATE" in body or "create" in body.lower()

    def test_has_modify_mode(self):
        _, body = read_skill("implement")
        assert "MODIFY" in body or "modify" in body.lower()

    def test_has_refactor_mode(self):
        _, body = read_skill("implement")
        assert "REFACTOR" in body or "refactor" in body.lower()

    def test_has_fix_mode(self):
        _, body = read_skill("implement")
        assert "FIX" in body or "fix" in body.lower()

    def test_references_architecture(self):
        _, body = read_skill("implement")
        assert "architecture.md" in body

    def test_references_base_viewmodel(self):
        _, body = read_skill("implement")
        assert "base-viewmodel.md" in body

    def test_references_theme_system(self):
        _, body = read_skill("implement")
        assert "theme-system.md" in body

    def test_references_modification_rules(self):
        _, body = read_skill("implement")
        assert "modification-rules.md" in body

    def test_references_migration_guide(self):
        _, body = read_skill("implement")
        assert "migration-guide.md" in body

    def test_has_validation_checklist(self):
        _, body = read_skill("implement")
        assert "Screen" in body and "View" in body and "ViewModel" in body


class TestBrainstormSkill:
    def test_has_no_implementation_rule(self):
        _, body = read_skill("brainstorm")
        assert "НЕ РЕАЛИЗУЙ" in body or "NO IMPLEMENTATION" in body

    def test_has_multiple_approaches(self):
        _, body = read_skill("brainstorm")
        assert "2-3" in body

    def test_saves_to_docs_designs(self):
        _, body = read_skill("brainstorm")
        assert ".claude/docs/android-dev/designs/" in body

    def test_has_acceptance_proof(self):
        _, body = read_skill("brainstorm")
        assert "acceptance" in body.lower() or "Acceptance" in body

    def test_transitions_to_plan(self):
        _, body = read_skill("brainstorm")
        assert "plan" in body.lower()


class TestPlanSkill:
    def test_has_plan_mode(self):
        _, body = read_skill("plan")
        assert "PLAN" in body or "plan" in body

    def test_has_execute_mode(self):
        _, body = read_skill("plan")
        assert "EXECUTE" in body or "execute" in body

    def test_has_granularity_requirement(self):
        _, body = read_skill("plan")
        assert "2-5" in body

    def test_references_plan_format(self):
        _, body = read_skill("plan")
        assert "plan-format" in body

    def test_saves_to_docs_plans(self):
        _, body = read_skill("plan")
        assert ".claude/docs/android-dev/plans/" in body


class TestReviewSkill:
    def test_has_architecture_pass(self):
        _, body = read_skill("review")
        assert "Architecture" in body or "архитектур" in body.lower()

    def test_has_code_quality_pass(self):
        _, body = read_skill("review")
        assert "Quality" in body or "quality" in body or "качеств" in body.lower()

    def test_has_pass_fail_verdict(self):
        _, body = read_skill("review")
        assert "PASS" in body
        assert "FAIL" in body

    def test_checks_screen(self):
        _, body = read_skill("review")
        assert "Screen" in body

    def test_checks_viewmodel(self):
        _, body = read_skill("review")
        assert "ViewModel" in body

    def test_checks_usecase(self):
        _, body = read_skill("review")
        assert "UseCase" in body

    def test_has_severity_levels(self):
        _, body = read_skill("review")
        assert "Critical" in body
        assert "Important" in body


class TestTestUiSkill:
    def test_uses_claude_in_mobile(self):
        _, body = read_skill("test-ui")
        assert "claude-in-mobile" in body

    def test_has_screenshot_command(self):
        _, body = read_skill("test-ui")
        assert "screenshot" in body

    def test_has_compress_flag(self):
        _, body = read_skill("test-ui")
        assert "--compress" in body

    def test_has_rendering_category(self):
        _, body = read_skill("test-ui")
        assert "Rendering" in body

    def test_has_crash_category(self):
        _, body = read_skill("test-ui")
        assert "Crash" in body

    def test_has_pass_fail_verdict(self):
        _, body = read_skill("test-ui")
        assert "PASS" in body
        assert "FAIL" in body


class TestVerifySkill:
    def test_contains_banned_language_section(self):
        _, body = read_skill("verify")
        assert "Banned Language" in body or "banned" in body.lower()

    def test_bans_should_work(self):
        _, body = read_skill("verify")
        assert "should work" in body.lower()

    def test_requires_fresh_evidence(self):
        _, body = read_skill("verify")
        assert "fresh" in body.lower()

    def test_has_pass_fail_verdict(self):
        _, body = read_skill("verify")
        assert "PASS" in body
        assert "FAIL" in body


class TestDebugSkill:
    def test_has_root_cause_phase(self):
        _, body = read_skill("debug")
        assert "Root Cause" in body or "root cause" in body

    def test_has_hypothesis_phase(self):
        _, body = read_skill("debug")
        assert "Hypothesis" in body or "hypothesis" in body

    def test_references_defense_in_depth(self):
        _, body = read_skill("debug")
        assert "defense-in-depth" in body

    def test_references_root_cause_tracing(self):
        _, body = read_skill("debug")
        assert "root-cause-tracing" in body


class TestTddSkill:
    def test_has_red_green_refactor(self):
        _, body = read_skill("tdd")
        assert "RED" in body
        assert "GREEN" in body
        assert "REFACTOR" in body

    def test_references_testable_design(self):
        _, body = read_skill("tdd")
        assert "testable-design" in body

    def test_references_anti_patterns(self):
        _, body = read_skill("tdd")
        assert "anti-patterns" in body

    def test_references_mocking_strategy(self):
        _, body = read_skill("tdd")
        assert "mocking-strategy" in body


class TestAndroidDevAgent:
    def test_has_skill_first_rule(self):
        _, body = read_agent("android-dev")
        assert "Skill-First" in body or "skill-first" in body.lower() or "Skill" in body

    def test_has_proactive_workflow(self):
        _, body = read_agent("android-dev")
        assert "FULL AUTO" in body or "AUTO" in body or "автоматически" in body.lower()

    def test_has_project_detection(self):
        _, body = read_agent("android-dev")
        assert "Project Detection" in body or "базовый пакет" in body.lower()

    def test_lists_all_skills(self):
        _, body = read_agent("android-dev")
        for skill in ["brainstorm", "plan", "implement", "debug", "tdd", "review", "test-ui", "verify"]:
            assert skill in body, f"Agent must reference skill '{skill}'"

    def test_references_android_core_rules(self):
        _, body = read_agent("android-dev")
        assert "android-core.md" in body

    def test_has_final_report_template(self):
        _, body = read_agent("android-dev")
        assert "отчёт" in body.lower() or "report" in body.lower()
