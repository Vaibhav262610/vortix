# Security benchmark

Run `node benchmarks/security.js 048f7c0` from the repository root after `npm ci` in `backend/`. The script starts the previous `server.js` from commit `048f7c0` and the current working server with isolated file stores, then sends the same WebSocket probes. It uses the current dependency and store implementation for both runs; the compared registration and login handlers come from each server version.

| Probe | Previous server | Current server |
| --- | --- | --- |
| Unknown agent with a guessed device name and arbitrary password is registered | Yes | No; pairing required |
| Correct password accepted after five wrong agent attempts | Yes | No; five-minute lockout |

The run on 2026-11-03 returned `unknownRegistered=true` and `correctAfterFiveFailures=true` for the previous server, and `false` for both on the current server. The script also prints wall times, but those include process scheduling and local filesystem delays; they are not a performance improvement claim. The outcomes above are covered by automated integration tests.

Future benchmarks should add storage-scan coverage and task-completion measures for native UI Automation and Rescue Autopilot, with the machine, app versions, fixtures, and repeated samples recorded alongside the results.

## Native Windows control smoke check

Run `node benchmarks/ui-controls-windows.js` in a signed-in Windows desktop session. This opens Notepad and Calculator, invokes one named control in each, and checks the resulting app state. It leaves those apps open. On 2026-11-03, two local runs on Windows build 26200 with Node.js 24.21.0, Notepad 10.0.26100.8457, and Calculator 11.2605.9.0 returned:

| Task | Completion | Elapsed time |
| --- | --- | ---: |
| Notepad: invoke File and see New tab | 2/2 | 4,056–5,576 ms |
| Calculator: invoke Two and read Display ending in 2 | 2/2 | 5,061–5,382 ms |

Times include app launch, PowerShell startup, UI Automation discovery, and screenshot capture. These small runs are smoke checks, not a performance comparison. A repeated screenshot-click baseline on the same machine and app versions is still required before claiming a before/after improvement.
