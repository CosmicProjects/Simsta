# Simsta Player Data Sync Setup

This guide explains how to set up real-time player data syncing between the game and `data/userData.json`.

## How It Works

1. **Game saves to localStorage** - All game progress is saved to browser localStorage
2. **PlayerDataManager syncs data** - The manager keeps localStorage and the JSON file in sync
3. **Node.js updater writes to file** - A background Node.js script writes changes to `data/userData.json`

## Setup Instructions

### 1. Install Dependencies

```bash
cd data
npm install
```

### 2. Start the Data Updater

In a terminal, run:

```bash
npm run sync-data
```

You should see:
```
🎮 Simsta Player Data Updater Running
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📡 Server listening on http://localhost:9999
📁 Data file: C:\...\data\userData.json

✓ Open Simsta in your browser and play!
✓ userData.json will update automatically

Press Ctrl+C to stop
```

### 3. Play the Game

- Open `index.html` in your browser
- Play normally - all changes are automatically saved
- The updater will sync changes to `data/userData.json` in real-time

### 4. Edit userData.json

You can edit `data/userData.json` directly:
- Change `followers`, `username`, `profilePicture`, etc.
- Reload the game page
- Your changes will load into the game

## Features

✅ **Real-time sync** - Changes appear in userData.json as you play
✅ **Editable config** - Edit userData.json and reload to load changes
✅ **Automatic backup** - All data is saved to localStorage
✅ **Export/Import** - Use Settings → Export/Import for manual backups

## Troubleshooting

**Port 9999 already in use?**
- Edit `data/update-player-data.js` line 14 and change `PORT = 9999` to another port
- Update the fetch URL in `data/player-data-manager.js` line 111 to match

**userData.json not updating?**
- Make sure the updater script is running (`npm run sync-data`)
- Check browser console for errors
- Verify port 9999 is accessible

**Changes not loading from userData.json?**
- Make sure you reload the page after editing the file
- Check that the file is valid JSON (use a JSON validator)

