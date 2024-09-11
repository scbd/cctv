# CCTV


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
