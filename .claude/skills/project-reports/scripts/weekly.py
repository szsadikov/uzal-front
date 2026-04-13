#!/usr/bin/env python3
"""
weekly.py — Generates a weekly summary from daily reports.

Usage:
  python3 weekly.py              # current week
  python3 weekly.py --week 15   # specific week number
"""

import subprocess
import sys
import argparse
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


def get_week_dates(week_number: int, year: int) -> list[datetime]:
    """Returns list of 7 dates for given ISO week."""
    first_day = datetime.strptime(f"{year}-W{week_number:02d}-1", "%Y-W%W-%w")
    return [first_day + timedelta(days=i) for i in range(7)]


def format_date(dt: datetime) -> str:
    return dt.strftime("%d_%m_%Y")


def format_date_human(dt: datetime) -> str:
    return dt.strftime("%d %m %Y")


def read_daily_report(reports_dir: Path, dt: datetime) -> dict | None:
    """Read a daily report and extract key data."""
    path = reports_dir / f"{format_date(dt)}.md"
    if not path.exists():
        return None

    content = path.read_text()
    lines = content.split("\n")

    commits = []
    files = []
    in_progress = []
    blockers = []

    section = None
    for line in lines:
        if line.startswith("## ✅ Коммиты"):
            section = "commits"
        elif line.startswith("## 📁 Изменённые файлы"):
            section = "files"
        elif line.startswith("## 🔄 В работе"):
            section = "progress"
        elif line.startswith("## ❌ Блокеры"):
            section = "blockers"
        elif line.startswith("## "):
            section = None
        elif line.startswith("- ") and section:
            value = line[2:].strip()
            if not value or value in ("None", "Нет"):
                continue
            if section == "commits":
                commits.append(value)
            elif section == "files":
                files.append(value)
            elif section == "progress":
                in_progress.append(value)
            elif section == "blockers":
                blockers.append(value)

    return {
        "date": dt,
        "commits": commits,
        "files": files,
        "in_progress": in_progress,
        "blockers": blockers,
        "has_data": len(commits) > 0 or len(in_progress) > 0
    }


def build_weekly_report(
    project_name: str,
    week_number: int,
    year: int,
    days: list[dict]
) -> str:
    """Build weekly summary markdown."""
    active_days = [d for d in days if d and d["has_data"]]
    all_commits = []
    all_blockers = []
    in_progress_items = []

    for day in active_days:
        all_commits.extend(day["commits"])
        all_blockers.extend(day["blockers"])
        in_progress_items.extend(day["in_progress"])

    # Deduplicate
    all_blockers = list(set(all_blockers))
    in_progress_items = list(set(in_progress_items))

    lines = [
        "---",
        f"week: W{week_number:02d}_{year}",
        f"project: {project_name}",
        f"generated: {datetime.now().strftime('%d_%m_%Y')}",
        "---",
        "",
        f"# Неделя {week_number} {year} | {project_name}",
        "",
        f"**Активных дней:** {len(active_days)} / 7",
        f"**Всего коммитов:** {len(all_commits)}",
        "",
    ]

    # Daily breakdown
    lines.append("## 📅 Сводка по дням")
    for day in days:
        if day is None:
            continue
        date_str = format_date_human(day["date"])
        commit_count = len(day["commits"])
        if commit_count > 0:
            lines.append(f"- **{date_str}** — {commit_count} коммитов")
        else:
            lines.append(f"- **{date_str}** — коммитов нет")
    lines.append("")

    # All commits this week
    if all_commits:
        lines.append("## ✅ Все коммиты за неделю")
        for c in all_commits:
            lines.append(f"- {c}")
        lines.append("")

    # Still in progress
    if in_progress_items:
        lines.append("## 🔄 В работе")
        for item in in_progress_items:
            lines.append(f"- {item}")
        lines.append("")

    # Blockers this week
    if all_blockers:
        lines.append("## ❌ Блокеры за неделю")
        for b in all_blockers:
            lines.append(f"- {b}")
        lines.append("")

    # Summary for progress.md
    lines += [
        "## 📎 Заметки на следующую неделю",
        "- ",
        "",
    ]

    return "\n".join(lines)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--week", type=int, default=None)
    parser.add_argument("--year", type=int, default=datetime.now().year)
    args = parser.parse_args()

    now = datetime.now()
    week_number = args.week or now.isocalendar()[1]
    year = args.year

    root = get_project_root()
    project_name = root.name
    daily_dir = root / ".claude" / "reports" / "daily"
    weekly_dir = root / ".claude" / "reports" / "weekly"
    weekly_dir.mkdir(parents=True, exist_ok=True)

    week_dates = get_week_dates(week_number, year)

    print(f"📊 Генерирую недельный отчёт W{week_number:02d} {year}...")

    days_data = []
    for dt in week_dates:
        data = read_daily_report(daily_dir, dt)
        days_data.append(data)
        status = "✅" if data and data["has_data"] else "—"
        print(f"  {status} {format_date_human(dt)}")

    report = build_weekly_report(project_name, week_number, year, days_data)

    report_path = weekly_dir / f"W{week_number:02d}_{year}.md"
    report_path.write_text(report)

    active = len([d for d in days_data if d and d["has_data"]])
    print(f"\n✅ Недельный отчёт сохранён: {report_path}")
    print(f"   Активных дней: {active}/7")


if __name__ == "__main__":
    main()
