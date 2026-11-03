# Roadmap

This list separates shipped controls from work that still needs implementation and measurement.

## Next engineering work

1. Expand the [security benchmark](benchmarks/RESULTS.md) to storage scans and screen workflows. Publish repeated measurements, scenarios, machine details, and before/after results; do not claim results from live apps until measured.
2. Improve the read-only Rescue Autopilot with configurable schedules, retention controls, and stronger whole-drive trend coverage.
3. Expand native Windows UI Automation beyond Notepad and Calculator. The first two app controls have a reproducible smoke benchmark; compare repeated task completion and time against screenshot-only control on the same apps and machine.
4. Persist workflow checkpoints so restarts can resume safely without repeating a send or destructive action.
5. Add preview, local confirmation, Recycle Bin move, and undo before any cleanup action.
6. Split dashboard and backend files by UI component and message domain; add browser component and message-router coverage as each boundary is extracted.
7. Replace reusable device passwords with per-installation asymmetric device keys and add a local confirmation option for high-risk commands. Complete a third-party security review before making broad trust claims.

The CI badge shows that automated checks ran; it is not a security certification.
