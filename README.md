# RELAY · Emergency Connect

[Open the app](https://atif10ala.github.io/relay-emergency-connect/)

An original school-assistance UI/UX submission by Atif Al Azad · XI-D · 10673 · Rose House. Open the link in a browser; no download is required.

## Four focused steps

Location, help type, review and response are separate phone screens. Large hazard icons and visible Back/Next controls fit without page scrolling at the tested phone viewports. The optional block, nearby detail and exterior campus map remain available. Medical help is the default.

The response shows delivery, a 30-second countdown and pending adult arrival. An unanswered request opens a dedicated office-follow-up screen. Choosing No, I still need help keeps the request and location active and marks the duty inbox Student still waiting. Handover closes only after explicit confirmation.

## Demonstration scope

Requests, staff messages, pings and office escalation are simulated within the browser session. No real school notification service is connected. Duty teacher is a generic demonstration role. No personal teacher name or phone number is included. Ping means an in-app notification, not SMS or WhatsApp. Calls open the device dialler. Staff positions are not tracked; the optional campus map is approximate. The 30-second threshold is illustrative and requires school approval for real use.

## Phone presentation and checks

Phone frames use 417×868 outer proportions, a 393×844 screen and a 393×751 app viewport. The status bar and green Dynamic Island dot are presentation graphics, with no camera/microphone access. Responsive checks also covered approximately 375×667 CSS pixels. The app was tested in a desktop browser; physical iPhone installation was not tested.

Request-model checks verify the timer boundary, offline escalation, no-adult follow-up, retained location and explicit-only handover closure. The app supports home-screen installation and can reopen offline after its first successful load. Sending requires connectivity.

## Submission files

RELAY-submission.pdf: eight concise pages, including all main screens, follow-up and reliability states; approximately 1.3 MB.
RELAY-statement.pdf: separate one-page Statement.
RELAY-statement.txt: plain text copy.
RELAY-screen-exports.zip: sixteen phone PNG exports.
RELAY-source.zip: editable React/Three.js sources, assets, licences and lifecycle checks.

## Assets

Original RELAY layout and flow. Manrope, Tabler icons, React and Three.js retain their licences. The monochrome school doodle pattern was generated with the built-in image tool; see asset-notes.txt. It does not depict verified school architecture.
