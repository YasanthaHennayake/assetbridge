# BUG-XXX: [Brief Description]

**Status:** Active
**Severity:** [Critical | High | Medium | Low]
**Created:** YYYY-MM-DD
**Resolved:** [Date when fixed]
**Component:** [Backend | Frontend | Database | CI/CD | Other]

---

## Description

Clear description of what's broken or not working as expected.

## Steps to Reproduce

1. Step one
2. Step two
3. Step three
4. Observe the error

## Expected Behavior

What should happen?

## Actual Behavior

What actually happens?

## Environment

- **OS:** macOS / Windows / Linux
- **Browser:** Chrome 120 / Firefox / Safari (if frontend bug)
- **Node Version:** 18.x.x
- **Branch:** feature/branch-name
- **Commit:** abc1234

## Error Messages / Logs

```
Paste error messages, stack traces, or logs here
```

## Screenshots

[Attach screenshots if applicable]

## Initial Investigation

What you've noticed or checked so far:
- Checked X, found Y
- Tried Z, result was...

---

## Debugging Process

### [Date] - Investigation Step 1

**Hypothesis:** [What you think might be causing it]

**Actions Taken:**
- Checked file `src/path/to/file.ts:45`
- Tested scenario X
- Added logging at line Y

**Results:**
- Found that...
- Discovered...

**Code Examined:**
```typescript
// Code snippet with line numbers
function example() {
  // ...
}
```

### [Date] - Investigation Step 2

**New Findings:**
- ...

**Tests Performed:**
- ...

---

## Root Cause Analysis

### What Caused the Bug?

Detailed explanation of what went wrong and why.

### Why Did It Happen?

Underlying reason (logic error, missing validation, race condition, etc.)

### Code Location

- **File:** `packages/backend/src/file.ts`
- **Line:** 123
- **Function:** `functionName()`

---

## Solution

### Fix Implemented

Description of how the bug was fixed.

### Code Changes

**Before:**
```typescript
// Old code
```

**After:**
```typescript
// Fixed code
```

### Files Modified

- `packages/backend/src/file1.ts` - Fixed logic error
- `packages/backend/src/file2.ts` - Added validation
- `packages/backend/src/file.test.ts` - Added test case

### Tests Added

```typescript
// New test to prevent regression
test('should not fail when...', () => {
  // test code
});
```

---

## Verification

### How to Verify the Fix

Steps to confirm the bug is resolved:
1. Run `npm test`
2. Start app and navigate to...
3. Verify that...

### Regression Testing

- [ ] Unit tests pass
- [ ] E2E tests pass
- [ ] Manual testing completed
- [ ] No new issues introduced

---

## Prevention

### How to Avoid This in the Future

- Add validation for X
- Implement error handling for Y
- Add integration test for Z
- Update documentation

### Related Issues

- Link to similar bugs (if any)
- Link to GitHub Issue #
- Link to PR #

---

## Lessons Learned

Key takeaways from debugging this issue:
- Learned that...
- Important to remember...
- Watch out for...

## References

- Documentation link
- Stack Overflow link
- Related article

---

## Timeline

- **Discovered:** YYYY-MM-DD HH:MM
- **Investigation Started:** YYYY-MM-DD
- **Fix Committed:** YYYY-MM-DD
- **Verified:** YYYY-MM-DD
- **Moved to Resolved:** YYYY-MM-DD
