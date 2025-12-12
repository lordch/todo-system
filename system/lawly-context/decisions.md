# Architectural Decisions

**Purpose**: Record all significant architectural and process decisions for Lawly  
**Format**: Context → Options → Decision → Rationale

---

## [2024-12-08] Adoption of Research-Plan-Implement Workflow

### Context
The team needed a structured approach for AI-human collaboration on features. The existing `knowledge-system/` with 5-phase SDLC was too heavy for a small team (3 developers, no dedicated PM).

### Problem
- Features getting stuck mid-implementation
- Unclear "what's next" during development
- AI agents losing context and effectiveness
- Difficulty onboarding new developers

### Options Considered

**Option 1: Keep existing 5-phase SDLC system**
- Pros: Already documented, comprehensive
- Cons: Too heavy, rarely followed completely, Epic-focused not Story-focused

**Option 2: Integrate Horthy system as Phase 4 extension**
- Pros: Preserve existing work, gradual adoption
- Cons: Two systems create confusion, still too complex

**Option 3: Replace with Research-Plan-Implement (Horthy system)**
- Pros: Simpler (3 phases), Story-focused, proven effective, better for ADHD-friendly workflow
- Cons: Lose existing documentation, need to rewrite

### Decision
**Option 3: Replace with Research-Plan-Implement**

Archive `knowledge-system/` → `knowledge-system-archive/`  
Implement new `.context/` system with:
- AGENTS.md (operating system for AI)
- WORKFLOW.md (3-phase process)
- Templates (RESEARCH, PLAN, PROGRESS, SPEC)
- Atoms catalog (reusable patterns)

### Rationale

1. **Simplicity**: "Good enough is good enough" - 3 phases easier to follow than 5
2. **Story-focused**: Most work is User Stories, not Epics - focus where the work is
3. **Context engineering**: 40% rule and intentional compaction proven to improve AI effectiveness
4. **ADHD-friendly**: Clear phases with concrete outputs reduce decision fatigue
5. **Proven methodology**: Dex Horthy's system used successfully at HumanLayer

### Key Principles Adopted

- **Managing understanding, not tickets** (preserved from old system)
- **Intentional compaction**: Focused markdown files, <40% context
- **Plan as source of truth**: When stuck → fix plan, not code
- **Human-AI collaboration**: Human decides, AI executes

### Migration Plan

- [x] Create `.context/` structure
- [x] Write AGENTS.md
- [x] Write WORKFLOW.md
- [x] Create templates
- [ ] Retrospectively document US-081 as example
- [ ] Archive old `knowledge-system/`
- [ ] Update team documentation

### Success Metrics

- Developers can complete Research phase in <1 hour
- Plans are detailed enough to execute mechanically
- Context utilization stays <40% during implementation
- Features get unstuck faster (go back to plan, not thrash in code)

---

## [Previous architectural decisions can be added here]

### Template for Future Decisions

```markdown
## [YYYY-MM-DD] Decision Title

### Context
[Why was this decision needed?]

### Options Considered
1. Option 1
   - Pros: ...
   - Cons: ...
2. Option 2
   - Pros: ...
   - Cons: ...

### Decision
[What was decided?]

### Rationale
[Why this decision? What were the key factors?]

### Implications
[What changes because of this decision?]
```

---

## Notes on Decision-Making Process

**When to record a decision:**
- Changes to architecture (Service layer? New pattern?)
- Changes to tech stack (New library? Framework upgrade?)
- Changes to process (New workflow? Tool change?)
- Trade-offs with long-term implications

**When NOT to record:**
- Implementation details (these go in code)
- Temporary workarounds (use code comments with TODO)
- Obvious choices (following existing patterns)

**Who decides:**
- **Architecture**: Team discussion, senior developer has final say
- **Tech stack**: Team consensus required
- **Process**: Try for 1-2 sprints, then evaluate
- **Implementation**: Developer working on feature decides (follow patterns)


