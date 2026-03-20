# README Brand Alignment Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Align the README opening brand and introduction with the site's current `Atlas AI Directory` launch positioning.

**Architecture:** This implementation is documentation-only and stays inside `README.md`. We will use a minimal test-first style by first defining the exact text changes to the title and opening description, then updating only those lines and verifying no unrelated README sections changed.

**Tech Stack:** Markdown

---

### Task 1: Define the Required README Opening Copy

**Files:**
- Modify: `README.md`

**Step 1: Write the failing expectation**

Identify the README opening lines that currently conflict with the site brand hierarchy:

- the top-level title
- the opening descriptive paragraph

The desired state is:

- `Atlas AI Directory` becomes the primary README title
- the intro describes the site as an English AI tool directory and decision hub for operators

**Step 2: Verify the current README differs from the target**

Run: `Get-Content README.md -TotalCount 8`

Expected: The output still leads with `AI Agents Decision Hub`, confirming the inconsistency that needs to be fixed.

**Step 3: Write minimal implementation**

Update only the README title and opening paragraph needed to match the agreed brand hierarchy and positioning.

**Step 4: Re-read the updated opening**

Run: `Get-Content README.md -TotalCount 8`

Expected: The output leads with `Atlas AI Directory` and an aligned opening description.

### Task 2: Verify No Unrelated README Drift

**Files:**
- Modify: `README.md`

**Step 1: Review the README diff**

Run: `git diff -- README.md`

Expected: The diff is limited to the README opening brand and introductory copy, with no unrelated command or setup churn.

**Step 2: Fix only out-of-scope wording drift if needed**

If the diff shows unrelated changes, remove them and keep the change focused on the agreed opening copy.

**Step 3: Re-run the same diff check**

Run: `git diff -- README.md`

Expected: Only the intended title and intro adjustments remain
