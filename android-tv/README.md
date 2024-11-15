# Eunomia-CCTV Android-TV App

This app is used to load cctv/current calendar on an android-tv base device

### WARNING

This procedure requires to enable development mode and enables Android Debug Bridge on your device. 
It is strongly recommended to turn ADB off when installation is completed

[How to Turn ADB off](#turn-adb-off)

## Pre-Requisite

### Install Java Development Kit and Android Studio

- https://www.oracle.com/ca-en/java/technologies/downloads/
- https://developer.android.com/studio


### Enable Dev mode

#### Put your device in dev mode

> To enable developer options on your Amazon Fire TV, open the Settings Menu, and navigate to 
> `My Fire TV` > `About`. Select your device's name `7 times`, until you see **"No Need, You Are Already a Developer."** The Developer Options menu will then be accessible in your Settings.

https://www.howtogeek.com/813766/fire-tv-developer-options/


#### Enable Dev Mode + Android Debug Bridge 

**TURN OFF WHEN COMPLETED** ([how](#turn-adb-off))

- Go do `My Fire Tv` > `Developer Options` 
- Turn `ADB Debbuging` `On`

https://developer.amazon.com/docs/fire-tv/connecting-adb-to-device.html

#### Automated process

- Get the IP from your device: `My Fire Tv` > `About` > `Network` 

*On our computer terminal, make the `cctv/android-tv` as the current working directory*

*Ensure that you have access to the FireTv as you will need to allow access on the device*

*You might also need to add the following to avoid any error*
```sh
export PATH=~/Library/Android/sdk/platform-tools/:$PATH
```

*Install the app*
```sh
./install-app.sh 192.168.xxx.xxx
```
*Using the remote, you may need to allow installation on the firestick*

*Restart the device after intallation*

When finished, all the apps should be installed on the FireTv and you can continue on the configuration of the AutoStart app (the installation will be done as part of the automated process).

#### Manual process

*Follow those instructions in case you are unable of using the automated process.*

#### Connect to your device using ADB 

*Check that the device is on `debug` mode*

Add `adb` to your command line path. 
*All ADB command assume that `cctv/android-tv` is the current working directory*

```sh
export PATH=~/Library/Android/sdk/platform-tools/:$PATH
```

- Get the IP from your device: `My Fire Tv` > `About` > `Network` 

Connect the device
```sh
adb connect 192.168.xxx.xxx
```

List connected devices (*Optional*)

```sh
adb devices
```

if more than one device connected use `-s 192.168.xxx.xxx:5555` between `adb` and `the command` to identify device
eg:

```sh
adb -s 192.168.xxx.xxx:5555 install ...
adb -s 192.168.xxx.xxx:5555 shell ...
```

## Build the App

*This step is optional as the compiled version is already available on `app/build/outputs/apk` / `debug` or `release`.*

Using Command line run 

```sh
export ANDROID_HOME=~/Library/Android/sdk
./gradlew build
```
Should generate output APK files in `app/build/outputs/apk` / `debug` or `release`

OR use Android Studio UI to build the apk file: Menu `Build` > `Build App Bundles...` > `Build APK(s)`

Make sure `local.properties` is set 
```sh 
echo sdk.dir=$HOME/Library/Android/sdk > local.properties 
```

## Install the app

using `ADB`

```sh
adb install ./app/build/outputs/apk/debug/app-debug.apk
```

### Prevent device to go into sleep / screen turn off 

`sleep_timeout` can be disabled by seeting to `0` <br>
`screen_off_timeout` cannot be disabled :( You need to set to the highest value possible `2147483647` (~24.85 days)

```sh
adb shell settings put secure sleep_timeout 0
adb shell settings put system screen_off_timeout 2147483647
```

## AutoStart the app on boot/wakeup:

Install [Launch-On-Boot](https://github.com/ITVlab/Launch-On-Boot). *Pre-compiled version is included in ./extra-app*

```
adb install ./extra-app/news.androidtv.launchonboot_12.apk
```

Run the app on the device and configure with the following:
- Enabled: `ON`
- Launch Tv App on Boot: `OFF`
- Launch when device wakes up: `ON`
- Select App: `Eunomia CCTV`

Test it: 
- try the test button
- Un-plug / Re-plug to see if works

## Turn ADB off 

To prevent access unwanted to your device using ADB, turn debugger bridge `OFF` when installation is completed.

```sh
adb shell settings put global adb_enabled 0
```

OR 

- Go do `My Fire Tv` > `Developer Options` 
- Turn `ADB Debbuging`: `Off`
