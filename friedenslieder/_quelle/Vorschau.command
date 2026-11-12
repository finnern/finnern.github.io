#!/bin/zsh
# Doppelklick im Finder: startet die Live-Vorschau und öffnet den Browser.
cd "$(dirname "$0")/.."
(sleep 1.5; open "http://localhost:8765/") &
python3 _quelle/vorschau.py
