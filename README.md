# JayFit Tracker

JayFit is an iPhone-first workout tracker built around a 3-day Push / Pull / Legs routine with active recovery, warm-ups, cooldowns, per-set logging, unilateral left/right tracking, PRs, history, and monthly consistency.

## Product principles

- Fast enough to use between sets
- One active exercise at a time during workouts
- Minimal scrolling on iPhone
- 3 working sets by default
- Unilateral movements: 3 sets per side
- Warm-up sets excluded from PR/working-volume calculations
- Online-ready architecture with offline/local fallback
- Real exercise demonstrations instead of generic stick-figure placeholders

## Stack

- React + TypeScript + Vite
- PWA / iPhone Home Screen support
- AWS Amplify Hosting
- Amazon Cognito authentication
- AWS AppSync + DynamoDB via Amplify Data

## Schedule

- Monday — Push + Abs
- Tuesday — Active Recovery
- Wednesday — Pull
- Thursday — Active Recovery
- Friday — Legs + Abs
- Saturday — Light Cardio / Mobility
- Sunday — Complete Rest

## Exercise media

Exercise demonstration photography is sourced from **Free Exercise DB** (`yuhonas/free-exercise-db`). The project releases its dataset and exercise imagery into the public domain under the Unlicense. JayFit uses the dataset's start/end exercise frames and animates those frames in the active workout view. This avoids relying on exercise-GIF mirrors whose media provenance or redistribution rights are unclear.

Source: https://github.com/yuhonas/free-exercise-db

Some JayFit movements intentionally use the closest available public-domain movement-pattern image when the exact machine or mobility drill is not present in the source dataset. The workout name, prescription, and JayFit notes remain authoritative.
