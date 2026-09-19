# postgame

Spotify Wrapped for a single coding session. Run it in your project folder after a session with Claude Code, and get a link to a shareable recap card.

```
npx postgame
```

The card shows the story of the session: your **boss fight** (the hardest stretch between commits), your longest **flow state**, your **MVP file**, how much of the code **Claude wrote**, and how often you **stopped Claude**.

## Options

| Flag | What it does |
|---|---|
| `--last <hours>` | Recap a fixed window, e.g. `--last 24` for a whole hackathon |
| `--from <date> --to <date>` | Recap a past window, e.g. `--from 2026-09-15T10:00 --to 2026-09-15T18:00` |
| `--dry-run` | Print exactly what would be uploaded, and upload nothing |

With no flags it picks your most recent session with a commit in it (a pause of 30+ minutes ends a session).

## Privacy

Everything is computed on your machine from your git history and your Claude Code logs (`~/.claude/projects`). Only numbers, the repo name, file paths and one commit message are uploaded. No source code, no prompt text, no file contents. Run `--dry-run` to see the exact payload.

No Claude Code logs? It still works, with a git-only card.

Not affiliated with Anthropic.
