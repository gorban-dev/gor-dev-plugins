"""Level 3: Validate hooks execute correctly and produce expected output."""

import os
import subprocess

from conftest import PLUGIN_ROOT


class TestSessionStartHook:
    def _run_hook(self) -> str:
        """Execute session-start.sh and return stdout."""
        script = PLUGIN_ROOT / "hooks" / "session-start.sh"
        result = subprocess.run(
            [str(script)],
            capture_output=True,
            text=True,
            timeout=5,
            env={**os.environ, "CLAUDE_PLUGIN_ROOT": str(PLUGIN_ROOT)},
        )
        assert result.returncode == 0, f"Hook failed: {result.stderr}"
        return result.stdout

    def test_hook_runs_successfully(self):
        output = self._run_hook()
        assert len(output) > 100, "Hook must produce substantial output"

    def test_hook_lists_all_skills(self):
        output = self._run_hook()
        for skill in ["brainstorm", "plan", "implement", "debug", "tdd", "review", "test-ui", "verify"]:
            assert skill in output, f"Hook output must mention skill '{skill}'"

    def test_hook_has_skill_first_rule(self):
        output = self._run_hook()
        assert "1%" in output, "Hook must contain skill-first 1% rule"

    def test_hook_has_proactive_workflow(self):
        output = self._run_hook()
        assert "review" in output and "verify" in output

    def test_hook_references_rules(self):
        output = self._run_hook()
        assert "android-core.md" in output

    def test_hook_has_workflow_chain(self):
        output = self._run_hook()
        assert "implement" in output and "review" in output and "test-ui" in output
