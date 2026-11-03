# Security benchmark

Run `node benchmarks/security.js 048f7c0` from the repository root after `npm ci` in `backend/`. The script starts the previous `server.js` from commit `048f7c0` and the current working server with isolated file stores, then sends the same WebSocket probes. It uses the current dependency and store implementation for both runs; the compared registration and login handlers come from each server version.

| Probe | Previous server | Current server |
| --- | --- | --- |
| Unknown agent with a guessed device name and arbitrary password is registered | Yes | No; pairing required |
| Correct password accepted after five wrong agent attempts | Yes | No; five-minute lockout |

The run on 2026-11-03 returned `unknownRegistered=true` and `correctAfterFiveFailures=true` for the previous server, and `false` for both on the current server. The script also prints wall times, but those include process scheduling and local filesystem delays; they are not a performance improvement claim. The outcomes above are covered by automated integration tests.

Future benchmarks should add storage-scan coverage and task-completion measures for native UI Automation and Rescue Autopilot, with the machine, app versions, fixtures, and repeated samples recorded alongside the results.
