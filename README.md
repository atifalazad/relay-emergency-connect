# RELAY · Emergency Connect

[Open the interactive prototype](https://atif10ala.github.io/relay-emergency-connect/)

A responsive school emergency UI/UX design by **Atif Al Azad · XI-D · 10673 · Rose House**, DPS Modern Indian School, Qatar. The prototype opens in a normal desktop or phone browser. No installation is required.

## Try the journey

Choose a help type, pick a familiar campus location, review and send. Switch to Teacher to open the request as Mrs. Aditi and accept responsibility. Return to Student to see the acknowledgement, reply by text and confirm that an adult is with you. Demo controls provides connection loss, unanswered requests and reset.

## Implementation

The published index.html is self-contained, with the application, typeface, crest, wave texture and favicon embedded. The editable source is supplied in RELAY-source.zip, including src/ and the ready-built dist/. After extracting it, run npm install and npm run build to rebuild, or node serve.mjs to preview the bundled version locally. The root index.html is the GitHub Pages publishing entry.

Requests, pings, teacher availability and replies are browser simulations. No real alert service or GPS tracking is connected. The campus model is an approximate exterior layout. Calling a displayed number opens the device dialler only when the number is selected.

## Assets

Manrope is licensed under the Open Font Licence; Tabler icons and JavaScript dependency licences are included. The official DPS-MIS crest comes from the school website. The wave texture was generated for this project from the participant’s reference. The RELAY layout, interaction flow and model are specific to this project.
