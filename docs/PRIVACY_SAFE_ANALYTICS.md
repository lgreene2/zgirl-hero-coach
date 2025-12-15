# Privacy-Safe Analytics Policy (Suggested)

## Principles
1) **No message text** is collected or stored for analytics.
2) No advertising IDs, no data selling.
3) Analytics are **aggregated events only** (e.g., “breathing_start”, “hero_moment_save”).

## Default behavior
By default, analytics are stored locally in the browser (counts only).
Remote analytics are off unless explicitly enabled.

## Events tracked
- app_open
- chat_send (no message text)
- mood_select (only “set yes/no”)
- breathing_start
- hero_moment_save
- video_script_generate
- paywall_view
- upgrade_click
- audio_replay

## Optional remote logging
If enabled, the server endpoint receives only event name + small safe properties, and can be routed to your analytics provider.
