#!/bin/bash
# build.sh

# Stop on any error
set -e

# Step 1: Build the npm app
echo "Building the npm app..."
npm run buildPortal

# Step 2: Go to the build directory
cd build

# Step 3: Copy the Dockerfile to the build directory
echo "Copying Dockerfile to build directory..."
cp ../Dockerfile .

# Step 4: Build the Docker image
echo "Building Docker image..."
docker build -t your-image-name .

echo "Build process completed."
