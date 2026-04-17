# Whitespace & File Hygiene Rules

These rules apply to ALL file modifications during migration. Violations pollute git diffs, hide real changes, and trigger user corrections.

## The Rules

### 1. Use `Edit` for existing files. NEVER `Write` over an existing file.

`Write` overwrites the entire file, which strips whatever whitespace and structural conventions the file already has. Use `Edit` for surgical changes.

`Write` is acceptable ONLY for files that do not yet exist.

### 2. Never strip trailing spaces from blank lines

Some IDEs (Xcode in particular) emit trailing spaces on indented blank lines (e.g. `    \n` — 4 spaces + newline). These look "wrong" but they're part of the file's existing style. Removing them makes the diff noisy.

**Preserve them exactly.**

### 3. Never normalize blank line indentation

A blank line with 4 spaces is NOT the same line as an empty line. If the original has 4-space blank lines inside a function body, your changes must too.

### 4. Never add or remove trailing newlines at end of file

If the file ends without a final newline, do not add one. If it ends with one, do not remove it.

### 5. Never rewrite an entire file just to change a few lines

If you need to change 3 lines in a 200-line file, use 3 small `Edit` calls. Do not `Write` the whole file with the changes baked in.

### 6. Match surrounding whitespace style for new code

When inserting a new method into an existing class, match the indentation, blank-line spacing between methods, and brace style of the surrounding code. Do not impose your own preferences.

### 7. Do not "clean up" whitespace as part of a migration

If the existing file has inconsistent indentation, mixed tabs/spaces, or extra blank lines — leave them alone. Cleanup is a separate task.

## Why

Migration produces large diffs already (new files, type renames, idiom translations). Adding whitespace noise makes review impossible because reviewers can't tell logic changes from formatting churn. Every "harmless" whitespace change is a defect because it costs reviewer attention.

## Verification

In the review phase, the reviewer must check:

- [ ] Every modified file used `Edit`, not `Write` (verify by spot-checking unchanged regions)
- [ ] No unrelated whitespace changes appear in the diff
- [ ] Trailing newlines unchanged
- [ ] Blank-line indentation unchanged
