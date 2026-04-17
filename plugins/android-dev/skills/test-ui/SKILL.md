---
name: test-ui
description: |
  UI testing of an Android feature on a device via the claude-in-mobile CLI. Reads the feature code, builds a test plan, launches the app, tests scenarios, takes screenshots, and reports bugs.

  <example>
  Context: User implemented a new feature and wants to test it on a device
  user: "test the authorization screen on a device"
  assistant: "Using test-ui skill to test the auth feature on a device via claude-in-mobile."
  </example>

  <example>
  Context: User wants to check how a screen looks
  user: "check how the profile screen looks"
  assistant: "Using test-ui skill for visual verification of the profile screen on a device."
  </example>
---

# Test UI — Android UI Testing on Device

You test Android UI on a real device/emulator via the `claude-in-mobile` CLI.

## Input

Task from user: **$ARGUMENTS**

Required parameters:
- **featureName** — name of the feature to test
- **packageName** — application package (from CLAUDE.md or build.gradle)
- **platform** — `android` (default)
- **navigationInstructions** — how to reach the screen under test (ask the user if not obvious)

## Step 1: Read the feature code

1. Find the feature files via Glob:
   - `**/feature/{featureName}/**/View*.kt` or `**/{featureName}/*View.kt`
   - `**/feature/{featureName}/**/ViewState*.kt`
   - `**/feature/{featureName}/**/ViewEvent*.kt`
2. Read `ViewState` — understand what data is displayed on the screen
3. Read `ViewEvent` — understand what actions the user can perform
4. Read `View` — understand the UI structure, all elements, texts, buttons

## Step 2: Build a test plan

Based on the code analysis, compile a list of scenarios:

- **Rendering** — all elements are displayed correctly
- **Interaction** — all buttons, input fields, switches work
- **Navigation** — transitions between screens
- **Data** — data is displayed correctly, loading/error/empty states
- **Edge cases** — empty fields, long texts, screen rotation

## Step 3: Launch the application

Use the `claude-in-mobile` CLI to interact with the device.

### Available commands:

```bash
# Launch the application
claude-in-mobile launch --package {packageName} --platform android

# Screenshot (ALWAYS with --compress)
claude-in-mobile screenshot --platform android --compress

# UI tree (for finding elements)
claude-in-mobile ui-dump --platform android

# Tap by text
claude-in-mobile tap-text --text "{text}" --platform android

# Tap by coordinates
claude-in-mobile tap --x {x} --y {y} --platform android

# Text input
claude-in-mobile input --text "{text}" --platform android

# Swipe
claude-in-mobile swipe --startX {x1} --startY {y1} --endX {x2} --endY {y2} --platform android

# Key press (back, home, enter)
claude-in-mobile key --key {keyName} --platform android

# Wait (seconds)
claude-in-mobile wait --seconds {n} --platform android

# Find element
claude-in-mobile find --text "{text}" --platform android
```

**IMPORTANT:** For `screenshot`, ALWAYS use the `--compress` flag to reduce image size.

### Launch sequence:
1. Launch the app: `claude-in-mobile launch --package {packageName} --platform android`
2. Wait for it to load: `claude-in-mobile wait --seconds 3 --platform android`
3. Navigate to the screen under test using `navigationInstructions`

## Step 4: Execute scenarios

For each scenario from the test plan:

1. **Screenshot BEFORE** — `claude-in-mobile screenshot --platform android --compress`
2. **UI-dump** (if you need to find an element) — `claude-in-mobile ui-dump --platform android`
3. **Action** — tap, input, swipe, etc.
4. **Wait** — `claude-in-mobile wait --seconds 1-3 --platform android`
5. **Screenshot AFTER** — `claude-in-mobile screenshot --platform android --compress`
6. **Analysis** — compare expected and actual behavior
7. **Record the result** — PASS or FAIL with a description

### Testing rules:
- Take a screenshot BEFORE and AFTER each action
- Use `ui-dump` to find elements if `tap-text` does not work
- If an element is not found — try scroll/swipe
- If the app crashed — record as Critical Crash
- For checking long lists, use swipe down

## Step 5: Report

Generate a report based on the test results:

```
## Test Report: {featureName}

### Environment
- Device: {device info from ui-dump}
- Package: {packageName}
- Platform: android

### Verdict
**PASS** / **FAIL**

### Scenarios
| # | Scenario | Status | Notes |
|---|----------|--------|-------|
| 1 | {scenario} | PASS/FAIL | {details} |
| 2 | {scenario} | PASS/FAIL | {details} |

### Issues
{N}. [{Category}] {description}
   Severity: Critical / Major / Minor
   Steps to reproduce: {steps}
   Expected: {expected behavior}
   Actual: {actual behavior}
   Screenshot: {reference to screenshot}

### Issue Categories:
- **[Rendering]** — element not displayed, incorrect size/color/position
- **[Interaction]** — button not responding, incorrect behavior on tap
- **[Navigation]** — incorrect transition, missing back navigation
- **[Data]** — incorrect data, not updating, empty state not handled
- **[Accessibility]** — no content description, touch target too small
- **[Crash]** — application crashed

### Summary
Scenarios: {total} (Passed: {N}, Failed: {N})
Issues: {N} (Critical: {N}, Major: {N}, Minor: {N})
```

## Rules

- **ALWAYS use `--compress`** when calling `screenshot`
- **ALWAYS take a screenshot before and after** each action
- **Use `ui-dump`** if you cannot find an element by text
- **Record ALL deviations** from expected behavior
- **Do not fix code** — only test and report
