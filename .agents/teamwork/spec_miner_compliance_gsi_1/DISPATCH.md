## 2026-10-19T21:09:25Z

You are spec_miner_compliance_gsi_1 (archetype: teamwork_preview_spec_miner).
Your working directory is: c:\Users\conta\Desktop\CS2Agent\.agents\teamwork\spec_miner_compliance_gsi_1
Project root directory is: c:\Users\conta\Desktop\CS2Agent
The authoritative user request is located at: c:\Users\conta\Desktop\CS2Agent\.agents\teamwork\ORIGINAL_REQUEST.md. You MUST read this file in full before starting work.

Your task:
Mine and document all specifications and requirements for:
1. Valve & Steam Compliance:
   - Primary sources: Steam Subscriber Agreement, CS2 Trusted Mode (https://help.steampowered.com/en/faqs/view/09C5-DNSY-W1CB-F0BB), Valve Anti-Cheat (VAC), Game State Integration (https://developer.valvesoftware.com/wiki/Counter-Strike:_Global_Offensive_Game_State_Integration), and tournament/coaching rules.
   - Exact URLs, verification dates, and explicit prohibition against claiming "VAC-proof", "100% VAC safe", or "Officially Valve approved".
   - The Feature Compliance Matrix (VERIFIED PERMITTED, REQUIRES APPROVAL, PROHIBITED) and how it actively gates runtime capabilities across environments (COMPETITIVE_PROTECTED, PRACTICE_SERVER, SIMULATION_PREVIEW).
   - Anti-cheat compliance rules: zero DLL injection, zero memory reading, zero process concealment, zero input automation, zero unauthorized hooks, zero unauthorized scraping.
2. GSI Protocol & Live Match Engine:
   - GSI config (gamestate_integration_*.cfg), HTTP POST listener, authentication token, JSON payload structure (provider, map, round, player, allplayers, bomb, phase_countdowns, grenades).
   - Separation of live GSI from Demonstration / Simulation Mode.
   - Tactical Memory and event provenance (CONFIRMED, REPORTED, INFERRED), decay/expiration, observation vs interpretation discipline (e.g. Player Y killing Player X at Palace records victim at Palace, NOT killer at Palace).
   - Last Known Information Overlay (opponent last-seen, elapsed time, visual decay).
   - Lineup Execution State Machine (INACTIVE -> NEARBY -> POSITIONING -> ALIGNING -> READY -> EXECUTED -> NEXT), hysteresis, cooldowns, completion types (Attempted, Confirmed thrown, Confirmed landed, Manually completed).
   - Bomb Timer (BOMB PLANTED 00:24, latency awareness, auto-removal).
   - Global HUD Manager (priority arbitrage: CRITICAL, CONTEXTUAL, INFORMATIONAL, PASSIVE, safe zones, scaling/opacity, compliance gating).
3. Write your report to c:\Users\conta\Desktop\CS2Agent\.agents\teamwork\spec_miner_compliance_gsi_1\compliance_gsi_spec.md and handoff to c:\Users\conta\Desktop\CS2Agent\.agents\teamwork\spec_miner_compliance_gsi_1\handoff.md.
4. Send a message to the orchestrator when finished.
