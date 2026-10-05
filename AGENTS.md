# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `yarn install` - install deps (postinstall symlinks `node_modules/@bower_components` to `app/libs`)
- `yarn build` / `yarn dev` - Rollup bundle of `app/boot.js` into `dist/` (dev = watch)
- `yarn server` - run Express server on `PORT` (default 2000)

No test suite; CI (`.github/workflows/ci.yml`) only builds the Docker image and curls it to check `<base href>`.

## Architecture

- `server.js`: Express server. Proxies `/api/*` to `API_URL`, serves `dist/`, `app/` and bower libs under `/app`, `/current` redirects to the active conference's CCTV stream, everything else renders `app/template.ejs` with the base path (from `BASE_PATH` or the `base_url` request header).
- `app/`: AngularJS 1.5 SPA loaded via RequireJS. Rollup bundles it as AMD; library modules declared in `app/boot.js` `require.config` paths are treated as externals and loaded at runtime from `app/libs`. Import alias `~/` = `app/`.
- `app/services/cctv-stream.js`: core loop that fetches the stream and cycles frames/news; views in `app/views/frames/` render them.
- `android-tv/`: separate Kotlin kiosk app wrapping the web page (see its README).
