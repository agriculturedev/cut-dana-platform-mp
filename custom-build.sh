#!/bin/bash
# build.sh

# Stop on any error
set -e

# Github Username and Repository where the container will be stored
GH_USERNAME="jonohas"
GH_REPO="test-deployment"

# Step 1: Build the npm app
echo "Building the npm app..."
npm run elie-buildPortal

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
    cp -r mastercode "$app/"
done

# Step 5: Login to GitHub Container Registry
echo "Logging into GitHub Container Registry..."
echo $GH_TOKEN
echo $GH_TOKEN | docker login ghcr.io -u $GH_USERNAME --password-stdin

# Step 6: Loop through apps, build Docker images, and push to GitHub Container Registry
for app in "${apps[@]}"
do
    echo "Building Docker image for $app..."
    image_name="ghcr.io/$GH_USERNAME/$GH_REPO/$app:latest"
    docker build -t $image_name -f ../elie/docker/Dockerfile "$app/"

    echo "Pushing Docker image for $app..."
    docker push $image_name
done

echo "All builds are completed."
