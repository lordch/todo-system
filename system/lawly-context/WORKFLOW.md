# Research-Plan-Implement Workflow

**Version**: 1.0  
**Last Updated**: 2024-12-08  
**Philosophy**: "No Vibes Allowed" - Research discovers, Plan prescribes, Implement executes

---

## Overview

This workflow breaks down feature development into three distinct phases, each with clear inputs, outputs, and responsibilities. The goal is to **manage understanding**, not just manage tickets.

### The Problem

Without structure:
- ❌ Jump straight to coding ("I'll figure it out as I go")
- ❌ Get stuck, thrash around in code
- ❌ Lose context, start over
- ❌ Unclear what's done, what's next

### The Solution

Research → Plan → Implement:
- ✅ Understand before building (Research)
- ✅ Blueprint before coding (Plan)
- ✅ Execute mechanically (Implement)
- ✅ Clear progress tracking

---

## The Three Phases

### Phase 1: RESEARCH

**Goal**: Understand what exists and what needs to change  
**Question**: "What do I need to know to build this?"  
**Duration**: 30-60 minutes (use subagents for large codebases)

#### Inputs
- User Story or Feature description
- Spec file (if exists in `specs/`)
- Link to related work (JIRA, GitHub issues)

#### Process

1. **Read the Spec**
   - If spec exists in `specs/`, read it
   - Understand: What are we building? Why? What are acceptance criteria?
   - If no spec exists, create one first (use `SPEC-TEMPLATE.md`)

2. **Explore the Codebase**
   - Find relevant models (`*/models.py`)
   - Find relevant services (`*/services/*.py`)
   - Find relevant API endpoints (`*/api.py`)
   - Find existing tests (`*/tests/`)
   - Identify patterns being used

3. **List Files to Touch**
   - For each file: note path and approximate line ranges
   - Example: `lawyers/services/lawyer_service.py (lines 45-80)`
   - Note: "New file" if creating from scratch

4. **Identify Dependencies**
   - Technical: External services, libraries, database schema
   - Internal: Other features, models, migrations
   - Data: Fixtures, seed data needed for testing

5. **Find Potential Blockers**
   - Missing migrations?
   - Circular dependencies?
   - Unclear requirements?
   - Performance concerns?

#### Outputs

Create `research/US-XXX-title.md` containing:
- **Codebase Exploration**: Models, services, APIs found
- **Files to Touch**: List with line ranges
- **Patterns Identified**: Existing patterns to follow
- **Dependencies**: Technical and internal
- **Potential Blockers**: What could go wrong
- **Key Insights**: Important discoveries (3-5 bullet points)

#### Context Management
- **Use subagents** for exploring large files (>300 lines)
- **Use subagents** for multiple file searches
- Keep research file **focused** - insights, not comprehensive notes
- Target: <20% context utilization

---

### Phase 2: PLAN

**Goal**: Create implementation blueprint  
**Question**: "How exactly will I build this?"  
**Duration**: 45-90 minutes

#### Inputs
- `research/US-XXX-title.md`
- Spec file (`specs/US-XXX-title-SPEC.md`)

#### Process

1. **Design the Solution**
   - Based on research, decide approach
   - Follow existing patterns (don't invent new ones)
   - Identify atoms to reuse (see `.context/atoms.md`)

2. **Break Down Into Steps**
   - Order: Backend first, then Frontend
   - Number each step (Step 1, Step 2, etc.)
   - One file per step (or logical grouping)

3. **Detail Each Step**
   - **File**: Path to file
   - **Change**: What exactly changes (code snippet or description)
   - **Reason**: Why this change
   - **Tests**: What tests cover this

4. **Define Test Strategy**
   - Unit tests: What functions/methods to test
   - Integration tests: What endpoints/flows to test
   - Manual tests: What to verify manually
   - Edge cases: What unusual scenarios to handle

5. **Plan for Failure**
   - Rollback plan: How to revert if something breaks
   - Edge cases: What could go wrong
   - Validation: How to know it works

#### Outputs

Create `plans/US-XXX-title.md` containing:
- **Implementation Strategy**: High-level approach (2-3 sentences)
- **Step-by-Step Implementation**: Numbered steps with details
- **Test Strategy**: Unit, integration, manual tests
- **Edge Cases**: List with handling approach
- **Rollback Plan**: How to revert safely

#### Key Principle: Plan as Source of Truth

**When implementation fails → come back here and fix the plan**

Don't thrash in code. If you're stuck:
1. Stop coding
2. Open `plans/US-XXX-title.md`
3. Update the plan (add details, fix approach)
4. Return to implementation with clearer plan

#### Context Management
- Plan should be **detailed enough to execute mechanically**
- But **not exhaustive** - focus on "what" and "why", not full code
- Target: <15% context utilization

---

### Phase 3: IMPLEMENT

**Goal**: Execute the plan  
**Question**: "Does it work?"  
**Duration**: 2-8 hours (varies by feature size)

#### Inputs
- `plans/US-XXX-title.md`
- Clean git branch: `feature/US-XXX-title`

#### Process

1. **Create Progress File**
   - Copy `templates/PROGRESS-TEMPLATE.md` to `progress/US-XXX-title.md`
   - Initialize with steps from plan
   - Track status: 🟡 In Progress

2. **Execute Step by Step**
   - Follow plan mechanically
   - After each step: Update progress file (mark as [x])
   - Commit frequently (meaningful messages)
   - Run tests after each logical unit

3. **When Stuck**
   - **STOP coding**
   - Document blocker in progress file
   - Open `plans/US-XXX-title.md`
   - Fix the plan (add details, change approach)
   - Update progress file with new approach
   - Resume implementation

4. **Monitor Context**
   - Check context utilization periodically
   - If >40% → you're in "dumb zone"
   - Solution: Use subagent, or simplify task

5. **Testing**
   - Run unit tests: `pytest path/to/test_file.py`
   - Run integration tests if applicable
   - Manual testing per test strategy in plan
   - All tests must pass before considering done

#### Outputs
- **Working code** (all tests passing)
- `progress/US-XXX-title.md` (final state: 🟢 Done)
- Git commits (clean history)

#### When Complete
1. Update progress file: Status → 🟢 Done
2. Run full test suite: `pytest`
3. Run linters: `black`, `isort`, `ruff`
4. Create PR (link to spec, research, plan in description)
5. Archive: Move research/plan/spec to `archive/US-XXX/`

#### Red Flags

Watch for these signs of trouble:

🚩 **"You're absolutely right"** from AI
- AI has lost the thread of understanding
- Stop, reassess context, simplify

🚩 **Context >40%**
- Entering "dumb zone" where AI effectiveness drops
- Use subagent or split task

🚩 **Stuck on same issue for >30 min**
- You're thrashing, plan is insufficient
- Go back to PLAN phase, update blueprint

🚩 **Improvising solutions**
- "Let me try this...", "Maybe if I..."
- Stop. You've deviated from plan. Update plan first.

---

## Lifecycle Diagram

```
[User Story / Feature Idea]
         ↓
    Create Spec
         ↓
  [specs/US-XXX-SPEC.md]
         ↓
─────────────────────────
    PHASE 1: RESEARCH
─────────────────────────
- Explore codebase
- Identify files & patterns
- Find dependencies
- Document blockers
         ↓
  [research/US-XXX.md]
         ↓
─────────────────────────
    PHASE 2: PLAN
─────────────────────────
- Design solution
- Break into steps
- Detail each change
- Define tests
         ↓
  [plans/US-XXX.md]
         ↓
─────────────────────────
    PHASE 3: IMPLEMENT
─────────────────────────
- Create progress file
- Execute step-by-step
- Run tests
- Track progress
         ↓
  [Working Code + progress/US-XXX.md]
         ↓
  Tests Pass + PR Created
         ↓
─────────────────────────
       ARCHIVE
─────────────────────────
Move to archive/US-XXX/
- research.md
- plan.md
- spec.md
```

---

## Integration with Git

### Branching Strategy
- Create branch: `git checkout -b feature/US-XXX-title`
- One branch per User Story
- Keep branches short-lived (1-3 days)

### Commit Strategy
- **After Research**: `git commit -m "docs: Add research for US-XXX"`
- **After Plan**: `git commit -m "docs: Add implementation plan for US-XXX"`
- **During Implement**: Meaningful commits per logical unit
  - `feat: Add LawyerProfile auto-creation signal (US-XXX)`
  - `test: Add tests for profile creation (US-XXX)`
  - `refactor: Extract auth helper to reduce duplication (US-XXX)`

### What to Commit
- ✅ Commit: `specs/`, `research/`, `plans/` (transparency for team)
- ❌ Don't commit: `progress/` files (mid-implementation, constantly changing)
- ✅ Commit: Final `progress/` when done (marks completion)

### PR Description Template
```markdown
## US-XXX: [Title]

**Spec**: .context/specs/US-XXX-title-SPEC.md  
**Research**: .context/research/US-XXX-title.md  
**Plan**: .context/plans/US-XXX-title.md

## Summary
[1-2 sentence summary]

## Changes
- Change 1
- Change 2

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed
- [ ] All linters pass

## Screenshots (if UI changes)
[Add screenshots]
```

---

## Context Engineering Best Practices

### Intentional Compaction

**Goal**: Keep only essential information in context

**Do**:
- ✅ Focus on insights, not comprehensive notes
- ✅ Use bullet points, not paragraphs
- ✅ Reference files with paths, not full contents
- ✅ Summarize findings in 3-5 key points

**Don't**:
- ❌ Copy-paste entire files into research
- ❌ Write comprehensive documentation (save for later)
- ❌ Include obvious information ("users have emails")

### The 40% Rule

**Why**: Above 40% context utilization, AI effectiveness drops ("dumb zone")

**How to measure**: Check token count (estimate: 1 token ≈ 4 characters)

**When >40%**:
- Use subagent for research (separate conversation)
- Simplify task (split into smaller User Stories)
- Remove non-essential context

### Subagents

**When to use**:
- Exploring large files (>300 lines)
- Multiple file searches
- Research-heavy tasks (reading docs, examples)
- Context approaching 40%

**How**:
- Start separate conversation
- Give focused task: "Find all places where LawyerProfile is created"
- Bring back only summary/insights to main context

---

## Examples

### Good Research File (Focused)
```markdown
# Research: US-081 Profile Management

## Files to Touch
1. `lawyers/signals.py` - Add auto-create signal
2. `lawyers/services/lawyer_service.py` - Add create_profile()
3. `lawyers/api.py` - Add POST /me/profile/
4. `lawyers/tests/` - Add test files

## Patterns Identified
- Signal pattern for auto-creation (users app uses this)
- Service layer for business logic
- Django Ninja for API

## Key Insights
- LawyerProfile already exists (just empty)
- Need signal to auto-create on User registration
- Follow service layer pattern from users app
```

### Bad Research File (Too Comprehensive)
```markdown
# Research: US-081 Profile Management

## LawyerProfile Model
[Full 50-line model definition pasted]

## User Model
[Full 100-line model definition pasted]

## Signal Pattern Explanation
[3 paragraphs explaining Django signals]

## Service Layer Pattern
[5 paragraphs explaining service pattern]

## Every file in lawyers/ app
[List of 20 files with full descriptions]
```

---

## For New Developers

If you're new to this workflow:

1. **Start with small US**: Pick something simple (1-2 files to modify)
2. **Follow templates exactly**: Don't innovate on process yet
3. **Over-document at first**: Better to have too much detail in plan than too little
4. **Use subagents liberally**: Don't try to hold everything in one context
5. **Review archived examples**: Look at `.context/archive/` for patterns

**Remember**: This workflow is about managing understanding. Take time in Research and Plan phases - it pays off in Implement.

---

## Questions?

- See examples in `.context/archive/`
- Check `.context/AGENTS.md` for conventions
- Review `.context/atoms.md` for reusable patterns
- Ask team for clarification (don't guess!)


