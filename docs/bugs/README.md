# Bug Tracking Documentation

This directory contains documentation for bugs encountered during AssetBridge development. As a solo developer, this serves as your debugging journal and knowledge base.

## Purpose

- 📝 **Document debugging process** - Keep track of investigation steps
- 🧠 **Learning archive** - Remember how you solved complex problems
- 🔍 **Reference** - Quick lookup for similar issues later
- 📊 **Track patterns** - Identify recurring problems

## Directory Structure

```
bugs/
├── active/          # Bugs currently being investigated or fixed
├── resolved/        # Fixed bugs with complete documentation
├── TEMPLATE.md      # Template for new bug reports
└── README.md        # This file
```

## Workflow

### 1. Bug Discovered

When you encounter a bug:

```bash
# Copy the template
cp bugs/TEMPLATE.md bugs/active/BUG-001-brief-description.md

# Edit the file and fill in initial details
```

**Naming Convention:**
- `BUG-XXX-brief-description.md`
- Use sequential numbers (001, 002, 003...)
- Keep description short and clear
- Examples:
  - `BUG-001-api-timeout-on-large-datasets.md`
  - `BUG-002-login-button-not-responding.md`
  - `BUG-003-mongodb-connection-drops.md`

### 2. During Investigation

Update the bug file as you debug:

- Document each investigation step with date
- Record hypotheses and test results
- Add code snippets with line numbers
- Include error messages and logs
- Note what worked and what didn't

**Benefits:**
- Keeps your thoughts organized
- Easy to resume after breaks
- Helps if you need to ask for help
- Shows your problem-solving approach

### 3. Bug Fixed

When the bug is resolved:

1. **Complete the documentation:**
   - Root cause analysis
   - Solution implemented
   - Code changes made
   - Tests added

2. **Verify the fix:**
   - Run all tests
   - Manual verification
   - Check for regressions

3. **Move to resolved:**
   ```bash
   mv bugs/active/BUG-001-description.md \
      bugs/resolved/BUG-001-description-RESOLVED-2024-10-14.md
   ```

4. **Update the file:**
   - Change status to "Resolved"
   - Add resolution date
   - Complete "Prevention" section

## Bug Severity Levels

Use these to prioritize:

| Severity | Description | Examples |
|----------|-------------|----------|
| **Critical** | System crash, data loss, security vulnerability | Database corruption, authentication bypass |
| **High** | Major feature broken, blocks development | API endpoint returns 500, build fails |
| **Medium** | Feature partially works, workaround available | Slow query, UI glitch on specific screen |
| **Low** | Minor issue, cosmetic problem | Typo in UI, console warning |

## Component Tags

Tag bugs by component for easier searching:

- **Backend** - API, database, server logic
- **Frontend** - UI, React components, styling
- **Database** - MongoDB, schemas, queries
- **CI/CD** - GitHub Actions, Heroku deployment
- **Testing** - Jest, Vitest, Playwright
- **Configuration** - Build tools, environment setup

## Tips for Effective Bug Documentation

### DO ✅

- **Be specific** - Include exact error messages
- **Add context** - What were you doing when it happened?
- **Include code** - Snippets with line numbers
- **Use screenshots** - For UI bugs
- **Update regularly** - Log investigation steps as you go
- **Document learning** - What did this teach you?

### DON'T ❌

- **Be vague** - "Something is broken" isn't helpful
- **Skip steps** - Document even unsuccessful attempts
- **Forget dates** - Timestamp your investigation steps
- **Delete old hypotheses** - Keep them even if wrong (shows thinking process)
- **Rush the post-mortem** - Take time to understand the root cause

## Example Bug Documentation

See `TEMPLATE.md` for the complete structure.

### Quick Reference

**Minimal viable bug report:**
```markdown
# BUG-001: API returns 500 on /api/users

**Status:** Active
**Severity:** High
**Created:** 2024-10-14

## Description
GET request to /api/users endpoint returns 500 error.

## Steps to Reproduce
1. Start backend server
2. Navigate to http://localhost:5001/api/users
3. See error

## Error Message
```
TypeError: Cannot read property 'map' of undefined
  at getUserList (users.ts:45)
```

## Investigation
Checking users.ts:45...
```

## Searching for Bugs

Use your IDE or command line:

```bash
# Find all active bugs
ls bugs/active/

# Search for bugs related to "authentication"
grep -r "authentication" bugs/

# Find all critical bugs
grep -r "Severity: Critical" bugs/

# List bugs by component
grep -r "Component: Frontend" bugs/
```

## When to Document a Bug

**Always document:**
- Bugs that took >30 minutes to fix
- Issues that required significant investigation
- Problems that might recur
- Interesting or tricky bugs (learning opportunity)
- Bugs with non-obvious solutions

**Optional documentation:**
- Simple typos
- Obvious configuration mistakes
- Quick fixes (<5 minutes)

## Integration with Git

**Commit messages reference bugs:**
```bash
git commit -m "Fix API timeout issue (BUG-001)

- Increased query timeout to 30s
- Added connection pooling
- See bugs/resolved/BUG-001-api-timeout.md for details"
```

**Branch naming:**
```bash
git checkout -b fix/BUG-001-api-timeout
```

## Benefits of This System

1. **Personal Knowledge Base** - Build expertise over time
2. **Faster Future Debugging** - Reference similar past issues
3. **Portfolio Material** - Shows problem-solving skills
4. **Learning Tool** - Reflect on mistakes and solutions
5. **Avoid Repeated Mistakes** - Prevention section helps
6. **Context Switching** - Easy to resume after breaks
7. **Self-Documentation** - Remember your thought process

## Periodic Review

Monthly, review your resolved bugs:
- What patterns do you see?
- Are certain types of bugs recurring?
- What can be improved in code/process?
- What did you learn this month?

## Questions?

If you're unsure:
- Start simple, improve the doc as you learn more
- It's okay to not know the root cause immediately
- Document what you tried, even if it didn't work
- Use the template as a guide, not a strict requirement

---

**Remember:** This is YOUR debugging journal. Write it in a way that helps YOU. The template is flexible - adapt it to your needs!
