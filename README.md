# CCTV

## Environment variables

| Variable    | Default                   | Description                                                                                     |
| ----------- | ------------------------- | ----------------------------------------------------------------------------------------------- |
| `API_URL`   | `https://api.cbd.int:443` | Target for the `/api/*` proxy and the `/current` conference lookup                              |
| `BASE_PATH` | none                      | Path the app is served under (eg `/cctv/`); if unset, uses the `base_url` request header or `/` |
| `PORT`      | `2000` (`8000` in Docker) | HTTP listen port                                                                                |

## Use of iframe.html

- Copy the `iframe.html` file to the local machine
- make the browser start by opening the `iframe.html` whit the 2 query string parameters
- `url` of the page to load (must be uerlEncoded use https://meyerweb.com/eric/tools/dencoder/)
- `ttl` time in minutes before the page reload (eg: ttl=15 wil reloade the app every 15 minutes)

Create a shortcut int the computer startup. eg:
```
chrome.exe --kiosk file:///path/to/iframe.html?ttl=15&url=https%3A%2F%2Fwww.cbd.int%2Fcctv%3FstreamId%3D{streamId}
```

# CCTV Android App

Use [these instructions](./android-tv/README.md) to build/install app on android-tv device (eg FireTv stick)

# CI/CD

GitHub Actions ([ci.yml](.github/workflows/ci.yml)) builds and tests the Docker image `scbd/cctv` on every push. It pushes calver tags (`YYYY.N.N`, also tagged `latest`), `master` and `dev`; other branches are built but not pushed.

| Secret               | Scope | Description                                               |
| -------------------- | ----- | --------------------------------------------------------- |
| `DOCKERHUB_USERNAME` | org   | Docker Hub username                                       |
| `DOCKERHUB_TOKEN`    | org   | Docker Hub access token                                   |
| `WEBHOOK_URL_MASTER` | repo  | Portainer service webhook to redeploy `master` (optional) |
| `WEBHOOK_URL_DEV`    | repo  | Portainer service webhook to redeploy `dev` (optional)    |
