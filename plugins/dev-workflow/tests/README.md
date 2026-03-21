# dev-workflow Plugin Tests

Integration tests for the dev-workflow plugin skills and agents.

## Test Levels

### Level 1 — Structure Validation (`test_skills_structure.py`)
Validates that all plugin files have correct structure:
- SKILL.md files have YAML frontmatter with `description`
- Agent files have frontmatter with `name`, `description`, `model`, `tools`
- Reference files exist and are non-empty
- plugin.json is valid JSON

### Level 2 — Content Verification (`test_skills_content.py`)
Checks that skill and agent content includes critical instructions:
- `verify` skill contains banned language section
- `debug` skill contains the 3+ attempts rule
- `plan-task` skill contains granularity requirement (2-5 minutes)
- `code-reviewer` agent uses Scope/Verdict/Issues/Summary format
- `tdd` skill contains RED-GREEN-REFACTOR cycle

## Running Tests

```bash
cd plugins/dev-workflow
python -m pytest tests/ -v
```

## Requirements

- Python 3.8+
- pytest
- pyyaml

Install dependencies:
```bash
pip install pytest pyyaml
```
