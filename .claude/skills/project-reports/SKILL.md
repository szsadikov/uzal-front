---
name: project-reports
description: Automatically generates daily, weekly, and progress reports for a project based on git commits. Use this skill when the user types /daily, /weekly, /update-progress, or when session has been idle. Always trigger this skill at the end of a working session or when the user asks to log work, record progress, write a report, or update project status.
---

# Project Reports Skill

Generates structured reports based on **real git data** — not memory.
Reports are saved in `.claude/reports/` inside the current project folder.

## Folder Structure

```
.claude/
├── reports/
│   ├── daily/
│   │   └── DD_MM_YYYY.md
│   ├── weekly/
│   │   └── WXX_YYYY.md
│   ├── progress.md
│   └── progress_archive.md
└── settings.json
```

## Commands

| Command | Action |
|---|---|
| `/daily` | Write today's daily report manually |
| `/weekly` | Generate weekly summary from daily reports |
| `/update-progress` | Update progress.md with current project state |

## How to Run

For each command, run the corresponding script:

```bash
# Daily report (manual)
python3 .claude/skills/project-reports/scripts/daily.py --mode manual

# Weekly report
python3 .claude/skills/project-reports/scripts/weekly.py

# Update progress.md
python3 .claude/skills/project-reports/scripts/progress.py
```

## Rules

1. **Never write from memory** — always use git log as data source
2. **Never overwrite a manual report** — check `written_by` flag first
3. **Archive completed modules** — if marked ✅ and untouched for 14 days, move to progress_archive.md
4. **One report per project** — determined by current working directory

## Status Icons

| Icon | Meaning |
|---|---|
| ✅ | Done and stable |
| 🔄 | In progress |
| ♻️ | Rework (was done, requirements changed) |
| 📋 | Planned, not started |
| ❌ | Blocked |

## on_idle Hook

When Claude has been idle for 30 minutes, run:

```bash
python3 .claude/skills/project-reports/scripts/daily.py --mode auto
```

The script checks if a manual report already exists for today.
If yes — skip. If no — write auto report from git log.

## Context for Next Session

At the start of a new session, read:
```
.claude/reports/daily/DD_MM_YYYY.md   ← yesterday's report
.claude/reports/progress.md            ← current project state
```
This replaces the need to explain context manually.
