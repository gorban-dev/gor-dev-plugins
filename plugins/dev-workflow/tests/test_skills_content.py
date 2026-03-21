"""Level 2: Verify critical content in skills and agents."""

import pytest

from conftest import read_skill, read_agent


class TestVerifySkill:
    def test_contains_banned_language_section(self):
        _, body = read_skill("verify")
        assert "Banned Language" in body or "banned" in body.lower()

    def test_bans_should_work(self):
        _, body = read_skill("verify")
        assert "should work" in body.lower()

    def test_bans_probably(self):
        _, body = read_skill("verify")
        assert "probably" in body.lower()

    def test_requires_fresh_evidence(self):
        _, body = read_skill("verify")
        assert "fresh" in body.lower()

    def test_has_pass_fail_verdict(self):
        _, body = read_skill("verify")
        assert "PASS" in body
        assert "FAIL" in body


class TestDebugSkill:
    def test_contains_3_attempts_rule(self):
        _, body = read_skill("debug")
        assert "3" in body and ("attempt" in body.lower() or "fix" in body.lower())

    def test_has_root_cause_phase(self):
        _, body = read_skill("debug")
        assert "Root Cause" in body or "root cause" in body

    def test_has_hypothesis_phase(self):
        _, body = read_skill("debug")
        assert "Hypothesis" in body or "hypothesis" in body

    def test_has_red_flags(self):
        _, body = read_skill("debug")
        assert "Red Flag" in body or "red flag" in body.lower()

    def test_references_defense_in_depth(self):
        _, body = read_skill("debug")
        assert "defense-in-depth" in body

    def test_references_root_cause_tracing(self):
        _, body = read_skill("debug")
        assert "root-cause-tracing" in body


class TestPlanTaskSkill:
    def test_contains_granularity_requirement(self):
        _, body = read_skill("plan-task")
        assert "2-5 min" in body or "2-5 minute" in body

    def test_references_plan_reviewer(self):
        _, body = read_skill("plan-task")
        assert "plan-reviewer" in body

    def test_references_plan_format(self):
        _, body = read_skill("plan-task")
        assert "plan-format" in body

    def test_saves_to_docs_plans(self):
        _, body = read_skill("plan-task")
        assert "docs/plans/" in body


class TestDesignSkill:
    def test_has_multiple_approaches(self):
        _, body = read_skill("design")
        assert "2-3 approach" in body or "2-3 approaches" in body

    def test_saves_to_docs_designs(self):
        _, body = read_skill("design")
        assert "docs/designs/" in body

    def test_transitions_to_plan_task(self):
        _, body = read_skill("design")
        assert "plan-task" in body

    def test_has_verify_by_running(self):
        _, body = read_skill("design")
        assert "running" in body.lower() and "reading" in body.lower()

    def test_has_acceptance_proof(self):
        _, body = read_skill("design")
        assert "acceptance" in body.lower() or "Acceptance" in body

    def test_has_vertical_slices(self):
        _, body = read_skill("design")
        assert "vertical slice" in body.lower()

    def test_has_flag_unknowns(self):
        _, body = read_skill("design")
        assert "⚠️" in body or "unknown" in body.lower()


class TestExecutePlanSkill:
    def test_loads_from_docs_plans(self):
        _, body = read_skill("execute-plan")
        assert "docs/plans/" in body

    def test_references_verify(self):
        _, body = read_skill("execute-plan")
        assert "verify" in body.lower()

    def test_handles_blockers(self):
        _, body = read_skill("execute-plan")
        assert "block" in body.lower()


class TestTddSkill:
    def test_has_red_green_refactor(self):
        _, body = read_skill("tdd")
        assert "RED" in body
        assert "GREEN" in body
        assert "REFACTOR" in body

    def test_has_failing_test_rule(self):
        _, body = read_skill("tdd")
        assert "fail" in body.lower()

    def test_has_anti_patterns(self):
        _, body = read_skill("tdd")
        assert "Anti-Pattern" in body or "anti-pattern" in body.lower()

    def test_defines_good_fit(self):
        _, body = read_skill("tdd")
        assert "Good fit" in body or "good fit" in body.lower()

    def test_references_testable_design(self):
        _, body = read_skill("tdd")
        assert "testable-design" in body

    def test_references_anti_patterns(self):
        _, body = read_skill("tdd")
        assert "anti-patterns" in body

    def test_references_mocking_strategy(self):
        _, body = read_skill("tdd")
        assert "mocking-strategy" in body


class TestCodeReviewerAgent:
    def test_has_scope_verdict_issues_summary(self):
        _, body = read_agent("code-reviewer")
        assert "## Scope" in body
        assert "## Verdict" in body
        assert "## Issues" in body
        assert "## Summary" in body

    def test_has_severity_levels(self):
        _, body = read_agent("code-reviewer")
        assert "Critical" in body
        assert "Important" in body
        assert "Suggestion" in body

    def test_is_read_only(self):
        fm, body = read_agent("code-reviewer")
        assert "NOT modify" in body or "not modify" in body.lower() or "do NOT" in body


class TestPlanReviewerAgent:
    def test_checks_granularity(self):
        _, body = read_agent("plan-reviewer")
        assert "granul" in body.lower()

    def test_checks_dependencies(self):
        _, body = read_agent("plan-reviewer")
        assert "dependenc" in body.lower()

    def test_checks_verification_criteria(self):
        _, body = read_agent("plan-reviewer")
        assert "verif" in body.lower()
