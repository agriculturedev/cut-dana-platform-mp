#!/bin/bash
# build.sh

# Stop on any error
set -e

# Step 1: Build the npm app
echo "Building the npm app..."
npm run buildPortal

# Step 2: Go to the build directory
cd dist

# Step 3: Declare an array of app names for which you want to build Docker images
apps=("mp-guben")

# Step 4: Copy master code to each app directory
echo "Copying master code to app directories..."
for app in "${apps[@]}"
do
    # Create the folder if it doesn't exist
    mkdir -p "$app"
    cp -r mastercode/* "$app/"
done

# Step 5: Loop through apps and build Docker images
for app in "${apps[@]}"
do
    echo "Building Docker image for $app..."
    docker build -t "$app-image" -f ../elie/docker/Dockerfile "$app/"
done

echo "All builds are completed."
