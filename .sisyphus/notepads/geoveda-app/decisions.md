# Architectural Decisions - Geoveda Traceability MVP

This file tracks key design and technical choices made during implementation.

## [INIT] Session Start
**Session**: ses_3c6ed5b84ffepGFPAZFmc0zQiM  
**Started**: 2026-02-07T17:51:51.797Z

---


## [PHASE-5] On-Chain Anchoring Documentation
**Decision**: Defer implementation of on-chain anchoring logic and smart contracts for MVP.
**Rationale**: To minimize initial complexity and gas costs while focusing on core traceability flows. Documentation establishes the standard (Keccak256 hashing + TX input data) to ensure forward compatibility with future on-chain verification features.
**Status**: Documented in `docs/phase-5-onchain-anchoring.md`.
