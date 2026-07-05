# Open Collidoscope — official Downloads (mirror)

These materials are **not part of the source code** in `opencollidoscope/`. They were published separately in the **Downloads** section of the [Open Collidoscope project](https://code.soundsoftware.ac.uk/projects/opencollidoscope) on SoundSoftware Code.

This directory keeps a **PDF-only mirror** alongside this web application repository for reference during development and analysis. Binaries and 3D CAD sources are available from the official site; they are excluded from Git via a whitelist [`.gitignore`](../.gitignore) (tracks `*.pdf`, `*.PDF`, `README.md`, and `license.txt` only).

**This repository's owner is not the author of Open Collidoscope.**

## Mirrored in this repository

| File | Local path |
| --- | --- |
| Introduction to Collidoscope.pdf | [`Introduction to Collidoscope.pdf`](Introduction%20to%20Collidoscope.pdf) |
| Collidoscope MIDI messages reference.pdf | [`Collidoscope MIDI messages reference.pdf`](Collidoscope%20MIDI%20messages%20reference.pdf) |
| Collidoscope Software instructions.pdf | [`Collidoscope Software instructions.pdf`](Collidoscope%20Software%20instructions.pdf) |
| Collidoscope Physical Build.pdf | [`Collidoscope Physical Build.pdf`](Collidoscope%20Physical%20Build.pdf) |
| CAD drawing PDFs (from `CAD.zip`) | [`CAD/Drawings/*.PDF`](CAD/Drawings/) |
| CAD license | [`CAD/license.txt`](CAD/license.txt) |

## Official Downloads only (not in Git)

As listed on <https://code.soundsoftware.ac.uk/projects/opencollidoscope> — download from the official project if needed:

| Official download | Notes |
| --- | --- |
| `libcinder-es2.a` | Cinder static library (release) |
| `libcinder-es2_d.a` | Cinder static library (debug; exceeds GitHub 100 MB limit) |
| `CollidoscopeApp` | Prebuilt Raspberry Pi binary |
| `CAD.zip` | Full CAD package (SolidWorks, STEP, IGS; extract locally for 3D work) |
