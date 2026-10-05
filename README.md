# Ward Watch

Cyber protection for hospital networks. Ward Watch finds dangerous network activity around hospital devices and lets a human approve the safest response, so patient care never stops.

**Team name:** [your team name]
**Track:** Hospital Network + Infrastructure
**Challenge number and title:** [copy exactly from the problem list]

## The problem
Hospitals connect life-support devices, staff computers and guest Wi-Fi on one network. If one weak device is attacked, the attacker can move toward patient systems and put care at risk.

## The cyber threats we show
1. A guest's phone tries to open the patient records server.
2. A life-support device sends data to the internet.
3. One computer probes every device in the ICU.

## Our solution
Ward Watch checks every connection against simple rules, explains in plain words why something looks wrong, and suggests the least disruptive fix. The fix only happens when a person approves it. Life-support devices are never switched off.

## How to use the demo
1. Open `index.html` in a browser.
2. Sign in with the demo account: `officer` / `ward123`.
3. Screen 2 shows the problems. Approve or ignore each one.
4. Screen 3 shows the result and a report of who decided what.

## Screenshots
![Login](docs/1-login.png)
![Problem](docs/2-problem.png)
![Fixed](docs/3-fixed.png)
![Report](docs/4-report.png)

## Safety and privacy
- All data is synthetic. No real patients, hospitals, devices or networks are used.
- Nothing is scanned or attacked. It is a simulation in the browser only.
- A human must approve every action (human-in-the-loop).
- The sign-in is a demo. A real hospital would use single sign-on with a second step.

## Technology
HTML, CSS and JavaScript. No AI model is used, so every alert is easy to explain.
Fonts: Bricolage Grotesque and Atkinson Hyperlegible (Google Fonts, open licence).

## Limitations
- Simulation only; rules are hand-written and tested on made-up data.
- Real traffic could cause false alarms, which is why a person reviews each one.

## Future scope
Read real network logs in a hospital pilot, connect to a firewall, and learn what is normal for each device.

## Team
| Name | What they did |
|---|---|
| [name] | [e.g. coding] |
| [name] | [e.g. research] |

## Licence
MIT Licence. See the LICENSE file.
