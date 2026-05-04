#!/bin/bash
echo "Installing Flatpak builder and tools..."
sudo apt install -y flatpak flatpak-builder

echo "Adding Flathub remote..."
flatpak remote-add --user --if-not-exists flathub https://flathub.org/repo/flathub.flatpakrepo

echo "Installing required Flatpak SDKs and Runtimes (this may take a few minutes)..."
flatpak install --user -y flathub org.freedesktop.Platform/x86_64/23.08 org.freedesktop.Sdk/x86_64/23.08 org.electronjs.Electron2.BaseApp/x86_64/23.08

echo "Building the Flatpak from the manifest locally..."
flatpak-builder build-dir com.hrmchat.app.yml --user --install --force-clean

echo ""
echo "=========================================================================="
echo "✅ Build Complete!"
echo "To test run your app locally in the Flatpak sandbox, use the command:"
echo "flatpak run com.hrmchat.app"
echo "=========================================================================="
