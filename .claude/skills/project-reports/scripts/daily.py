#!/usr/bin/env python3
"""
daily.py — Generates a daily report based on git commits.

Usage:
  python3 daily.py --mode manual   # /daily command
  python3 daily.py --mode auto     # on_idle hook (skips if manual exists)
  python3 daily.py --date 12_04_2026  # write report for a specific date
"""

import subprocess
import sys
import os
import argparse
from datetime import datetime, timedelta
from pathlib import Path


def get_project_root():
    """Find the git root of the current project."""
    result = subprocess.run(
        ["git", "rev-parse", "--show-toplevel"],
        capture_output=True, text=True
    )
    if result.returncode != 0:
        print("❌ Error: not inside a git repository.")
        sys.exit(1)
    return Path(result.stdout.strip())


def get_project_name(root: Path) -> str:
    return root.name


def get_reports_dir(root: Path) -> Path:
    reports_dir = root / ".claude" / "reports" / "daily"
    reports_dir.mkdir(parents=True, exist_ok=True)
    return reports_dir


def format_date(dt: datetime) -> str:
    """Returns DD_MM_YYYY format."""
    return dt.strftime("%d_%m_%Y")


def format_date_human(dt: datetime) -> str:
    """Returns DD MM YYYY for display."""
    return dt.strftime("%d %m %Y")


def get_report_path(reports_dir: Path, dt: datetime) -> Path:
    return reports_dir / f"{format_date(dt)}.md"


def is_manual_report(report_path: Path) -> bool:
    """Check if existing report was written manually."""
    if not report_path.exists():
        return False
    content = report_path.read_text()
    return "written_by: manual" in content


def get_git_commits(since: datetime, until: datetime) -> list[dict]:
    """Get commits in a date range."""
    since_str = since.strftime("%Y-%m-%d %H:%M:%S")
    until_str = until.strftime("%Y-%m-%d %H:%M:%S")

    result = subprocess.run(
        [
            "git", "log",
            f"--after={since_str}",
            f"--before={until_str}",
            "--pretty=format:%h|%s|%an|%ad",
            "--date=format:%H:%M"
        ],
        capture_output=True, text=True
    )

    commits = []
    for line in result.stdout.strip().split("\n"):
        if not line:
            continue
        parts = line.split("|", 3)
        if len(parts) == 4:
            commits.append({
                "hash": parts[0],
                "message": parts[1],
                "author": parts[2],
                "time": parts[3]
            })
    return commits


def get_changed_files(since: datetime, until: datetime) -> list[str]:
    """Get files changed in a date range with stats."""
    since_str = since.strftime("%Y-%m-%d %H:%M:%S")
    until_str = until.strftime("%Y-%m-%d %H:%M:%S")

    # Get the range of commits
    result = subprocess.run(
        [
            "git", "log",
            f"--after={since_str}",
            f"--before={until_str}",
            "--pretty=format:%h"
        ],
        capture_output=True, text=True
    )

    hashes = [h for h in result.stdout.strip().split("\n") if h]
    if not hashes:
        return []

    # Diff from oldest to newest commit
    oldest = hashes[-1]
    newest = hashes[0]

    result = subprocess.run(
        ["git", "diff", "--stat", f"{oldest}^", newest],
        capture_output=True, text=True
    )

    lines = []
    for line in result.stdout.strip().split("\n"):
        line = line.strip()
        if line and "file" not in line and "|" in line:
            lines.append(f"- {line}")

    return lines[:15]  # max 15 files


def get_current_branch() -> str:
    result = subprocess.run(
        ["git", "branch", "--show-current"],
        capture_output=True, text=True
    )
    return result.stdout.strip() or "main"


def build_report(
    project_name: str,
    dt: datetime,
    commits: list[dict],
    changed_files: list[str],
    mode: str
) -> str:
    """Build the markdown report content."""
    date_human = format_date_human(dt)
    branch = get_current_branch()
    written_by = mode  # "manual" or "auto"
    protected = "true" if mode == "manual" else "false"

    lines = [
        "---",
        f"date: {format_date(dt)}",
        f"project: {project_name}",
        f"written_by: {written_by}",
        f"protected: {protected}",
        "---",
        "",
        f"# {date_human} | {project_name}",
        f"Branch: `{branch}`",
        "",
    ]

    # Commits section
    if commits:
        lines.append("## ✅ Commits")
        for c in commits:
            lines.append(f"- `{c['hash']}` {c['time']} — {c['message']}")
        lines.append("")
    else:
        lines.append("## ✅ Commits")
        lines.append("- No commits today")
        lines.append("")

    # Changed files
    if changed_files:
        lines.append("## 📁 Changed Files")
        lines.extend(changed_files)
        lines.append("")

    # Sections for manual mode (filled by user/Claude)
    if mode == "manual":
        lines += [
            "## 🔄 In Progress",
            "- ",
            "",
            "## ❌ Blockers",
            "- None",
            "",
            "## 📎 Context for Next Session",
            "- Continue from: ",
            "- Waiting for: ",
            "",
        ]
    else:
        lines += [
            "## 📎 Auto-generated",
            f"- Report generated automatically (on_idle trigger)",
            "- Edit manually to add context for next session",
            "",
        ]

    return "\n".join(lines)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--mode",
        choices=["manual", "auto"],
        default="manual",
        help="manual = /daily command, auto = on_idle hook"
    )
    parser.add_argument(
        "--date",
        default=None,
        help="Write report for specific date DD_MM_YYYY (default: today)"
    )
    args = parser.parse_args()

    # Determine target date
    if args.date:
        try:
            dt = datetime.strptime(args.date, "%d_%m_%Y")
        except ValueError:
            print(f"❌ Invalid date format: {args.date}. Use DD_MM_YYYY.")
            sys.exit(1)
    else:
        dt = datetime.now()

    root = get_project_root()
    project_name = get_project_name(root)
    reports_dir = get_reports_dir(root)
    report_path = get_report_path(reports_dir, dt)

    # Auto mode: skip if manual report exists
    if args.mode == "auto" and is_manual_report(report_path):
        print(f"✅ Manual report already exists for {format_date_human(dt)}. Skipping.")
        sys.exit(0)

    # Get git data for the day
    day_start = dt.replace(hour=0, minute=0, second=0)
    day_end = dt.replace(hour=23, minute=59, second=59)

    commits = get_git_commits(day_start, day_end)
    changed_files = get_changed_files(day_start, day_end)

    # Build and write report
    report = build_report(project_name, dt, commits, changed_files, args.mode)
    report_path.write_text(report)

    print(f"✅ Report saved: {report_path}")
    print(f"   Commits found: {len(commits)}")
    print(f"   Files changed: {len(changed_files)}")

    if args.mode == "manual":
        print(f"\n📝 Open the file to add context for next session:")
        print(f"   {report_path}")


if __name__ == "__main__":
    main()
