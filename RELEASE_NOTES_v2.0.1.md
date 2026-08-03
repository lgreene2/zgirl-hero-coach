# Z-Girl Open v2.0.1 Release Notes

## Natural Voice Patch

- Waits for the browser or device voice catalog before playing the first greeting.
- Fixes the settings-loading issue that prevented saved voice, speed, and pitch preferences from reliably returning.
- Introduces **Z-Girl Natural Voice** as the recommended default.
- Prefers the strongest available feminine, natural-sounding voice that matches the selected language.
- Uses a warmer default delivery at `0.94×` speed and `1.03` pitch.
- Adds a one-click, localized voice preview using the same voice configuration as coach replies.
- Remembers a different preferred device voice for every supported language.
- Keeps English, Spanish, French, Portuguese, and German speech options.
- Places device voice, speed, and pitch controls under an accessible Advanced voice options disclosure.
- Separates spoken output controls from microphone-input controls.
- Pauses automatic spoken output when no matching-language voice is available instead of silently using a mismatched default.
- Updates the service-worker cache version so installed copies receive the patch.

## Platform note

Voice quality still depends on the voices installed by the user’s browser and operating system. This release improves selection and transparency without sending spoken text to a new third-party voice provider.
