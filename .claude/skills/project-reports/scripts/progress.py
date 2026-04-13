#!/usr/bin/env python3
"""
progress.py — Updates progress.md with current project state.
Archives modules marked ✅ that haven't changed in 14 days.

Usage:
  python3 progress.py
"""

import subprocess
import sys
import re
from datetime import datetime, timedelta
from pathlib import Path


def get_project_root() -> Path:
    result = subprocess.run(
        ["git", "rev-parse", "--show-toplevel"],
        capture_output=True, text=True
    )
    if result.returncode != 0:
        print("❌ Error: not inside a git repository.")
        sys.exit(1)
    return Path(result.stdout.strip())


def get_current_branch() -> str:
    result = subprocess.run(
        ["git", "branch", "--show-current"],
        capture_output=True, text=True
    )
    return result.stdout.strip() or "main"


def get_recent_commits(days: int = 7) -> list[str]:
    """Get commit messages from last N days."""
    result = subprocess.run(
        [
            "git", "log",
            f"--since={days} days ago",
            "--pretty=format:- `%h` %s",
        ],
        capture_output=True, text=True
    )
    return [l for l in result.stdout.strip().split("\n") if l]


def get_changed_files_recently(days: int = 7) -> list[str]:
    """Files changed in last N days."""
    result = subprocess.run(
        [
            "git", "log",
            f"--since={days} days ago",
            "--name-only",
            "--pretty=format:"
        ],
        capture_output=True, text=True
    )
    files = set()
    for line in result.stdout.strip().split("\n"):
        line = line.strip()
        if line:
            files.add(line)
    return sorted(files)[:20]


def parse_progress_sections(content: str) -> list[dict]:
    """Parse progress.md into sections."""
    sections = []
    current = None
    lines = content.split("\n")

    for line in lines:
        if line.startswith("## "):
            if current:
                sections.append(current)
            current = {"title": line[3:].strip(), "lines": [], "raw": line}
        elif current:
            current["lines"].append(line)

    if current:
        sections.append(current)

    return sections


def should_archive_section(section: dict, daily_dir: Path) -> bool:
    """
    Check if a section should be archived.
    Archives if ALL items are ✅ and no related commits in 14 days.
    """
    all_done = all(
        line.strip().startswith("✅") or not line.strip() or line.strip().startswith("#")
        for line in section["lines"]
        if line.strip()
    )

    if not all_done:
        return False

    # Check git activity in last 14 days related to section keywords
    keywords = section["title"].lower().split()
    cutoff = datetime.now() - timedelta(days=14)

    result = subprocess.run(
        [
            "git", "log",
            f"--since={cutoff.strftime('%Y-%m-%d')}",
            "--pretty=format:%s"
        ],
        capture_output=True, text=True
    )

    recent_messages = result.stdout.lower()
    for kw in keywords:
        if len(kw) > 3 and kw in recent_messages:
            return False  # Still active

    return True


def build_progress_template(project_name: str) -> str:
    """Build initial progress.md if it doesn't exist."""
    branch = get_current_branch()
    now = datetime.now().strftime("%d %m %Y")

    return f"""# {project_name} — Project Progress

> Last updated: {now} | Branch: `{branch}`

---

## Architecture
- 📋 Add your architecture items here

## Modules
- 📋 Module name — status

## Integrations
- 📋 API / service name — status

## Technical Debt
- 📋 Items to fix later

---

*Status icons: ✅ Done · 🔄 In Progress · ♻️ Rework · 📋 Planned · ❌ Blocked*
"""


def update_last_updated(content: str) -> str:
    """Update the 'Last updated' line in progress.md."""
    now = datetime.now().strftime("%d %m %Y")
    branch = get_current_branch()
    new_line = f"> Last updated: {now} | Branch: `{branch}`"

    # Replace existing line or add after title
    lines = content.split("\n")
    updated = False
    for i, line in enumerate(lines):
        if line.startswith("> Last updated:"):
            lines[i] = new_line
            updated = True
            break

    if not updated:
        # Insert after first heading
        for i, line in enumerate(lines):
            if line.startswith("# "):
                lines.insert(i + 1, "")
                lines.insert(i + 2, new_line)
                break

    return "\n".join(lines)


def main():
    root = get_project_root()
    project_name = root.name
    reports_dir = root / ".claude" / "reports"
    reports_dir.mkdir(parents=True, exist_ok=True)

    progress_path = reports_dir / "progress.md"
    archive_path = reports_dir / "progress_archive.md"
    daily_dir = reports_dir / "daily"

    # Create progress.md if it doesn't exist
    if not progress_path.exists():
        progress_path.write_text(build_progress_template(project_name))
        print(f"✅ Created progress.md")
        print(f"   Edit it to reflect your project state:")
        print(f"   {progress_path}")
        return

    # Read current progress.md
    content = progress_path.read_text()

    # Update last updated timestamp
    content = update_last_updated(content)

    # Check for sections to archive
    sections = parse_progress_sections(content)
    archived_titles = []

    for section in sections:
        if should_archive_section(section, daily_dir):
            archived_titles.append(section["title"])

    # Archive old sections
    if archived_titles:
        # Add to archive
        archive_content = ""
        if archive_path.exists():
            archive_content = archive_path.read_text()

        now_str = datetime.now().strftime("%d %m %Y")
        archive_additions = [f"\n\n---\n*Archived: {now_str}*\n"]

        for section in sections:
            if section["title"] in archived_titles:
                archive_additions.append(f"\n## {section['title']}")
                archive_additions.extend(section["lines"])

        archive_path.write_text(archive_content + "\n".join(archive_additions))

        # Remove archived sections from progress.md
        for title in archived_titles:
            pattern = rf"## {re.escape(title)}.*?(?=\n## |\Z)"
            content = re.sub(pattern, "", content, flags=re.DOTALL)

        print(f"📦 Archived {len(archived_titles)} completed section(s):")
        for t in archived_titles:
            print(f"   - {t}")

    # Write updated progress.md
    progress_path.write_text(content)

    # Show recent activity summary
    recent_commits = get_recent_commits(7)
    changed_files = get_changed_files_recently(7)

    print(f"\n✅ progress.md updated: {progress_path}")
    print(f"\n📊 Last 7 days activity:")
    print(f"   Commits: {len(recent_commits)}")
    print(f"   Files changed: {len(changed_files)}")

    if recent_commits:
        print(f"\n   Recent commits:")
        for c in recent_commits[:5]:
            print(f"   {c}")


if __name__ == "__main__":
    main()
