#!/bin/sh

#
# Gradle start up script for POSIX systems
#

APP_NAME="Gradle"
APP_BASE_NAME=`basename "$0"`

# Attempt to locate gradle on PATH or download via wrapper
if command -v gradle >/dev/null 2>&1; then
    exec gradle "$@"
fi

# Fallback wrapper invocation
WRAPPER_JAR="gradle/wrapper/gradle-wrapper.jar"
if [ -f "$WRAPPER_JAR" ]; then
    exec java -jar "$WRAPPER_JAR" "$@"
fi

echo "Gradle is not installed and gradle-wrapper.jar is not found. Please install Gradle or run with GitHub Actions / Android Studio."
exit 1
