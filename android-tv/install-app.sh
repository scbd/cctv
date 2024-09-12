#!/bin/bash
if [ -z "$1" ]; then
    echo "No IP address provided. Usage: ./installApp.sh <IP_ADDRESS>"
    exit 1
fi

ip_address=$1


ipv4_regex="^([0-9]{1,3}\.){3}[0-9]{1,3}$"

if [[ $ip_address =~ $ipv4_regex ]]; then
    # Validate each octet is between 0 and 255
    IFS='.' read -r -a octets <<< "$ip_address"
    valid=true
    for octet in "${octets[@]}"; do
        if ((octet < 0 || octet > 255)); then
            valid=false
            break
        fi
    done

    if [ "$valid" = true ]; then
        echo "Loading apps to FireStick."
        adb connect $ip_address
        echo "Confirm the this machine has access to the ADB configuration screen."
        echo "And press <ENTER> to continue."
        read -p 
        adb install ./app/build/outputs/apk/debug/app-debug.apk
        adb shell settings put secure sleep_timeout 0
        adb shell settings put system screen_off_timeout 2147483647
        adb install ./extra-app/news.androidtv.launchonboot_12.apk
        adb shell settings put global adb_enabled 0
        echo "Loading done."
    else
        echo "Invalid IPv4 address: Octets must be between 0 and 255."
    fi
else
    echo "Invalid IPv4 address format."
fi
