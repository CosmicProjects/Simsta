// Audio Manager - Sound Effects System for Simsta

class AudioManager {
    constructor() {
        this.soundEnabled = true;
        this.volume = 0.5;
        this.audioContext = null;
        this.sounds = {};
        this.loadSoundSettings();
        this.initAudioContext();
    }

    loadSoundSettings() {
        const saved = localStorage.getItem('simsta_sound_enabled');
        const savedVolume = localStorage.getItem('simsta_sound_volume');
        if (saved !== null) this.soundEnabled = JSON.parse(saved);
        if (savedVolume !== null) this.volume = parseFloat(savedVolume);
    }

    saveSoundSettings() {
        localStorage.setItem('simsta_sound_enabled', JSON.stringify(this.soundEnabled));
        localStorage.setItem('simsta_sound_volume', this.volume.toString());
    }

    initAudioContext() {
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.audioContext = new AudioContext();
        } catch (e) {
            console.warn('Web Audio API not supported');
        }
    }

    // Create simple beep sounds using Web Audio API
    playBeep(frequency = 800, duration = 100, type = 'sine') {
        if (!this.soundEnabled || !this.audioContext) return;
        
        try {
            const now = this.audioContext.currentTime;
            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();
            
            osc.connect(gain);
            gain.connect(this.audioContext.destination);
            
            osc.frequency.value = frequency;
            osc.type = type;
            
            gain.gain.setValueAtTime(this.volume * 0.3, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + duration / 1000);
            
            osc.start(now);
            osc.stop(now + duration / 1000);
        } catch (e) {
            console.warn('Error playing beep:', e);
        }
    }

    // Notification sound (ascending beep)
    playNotification() {
        this.playBeep(600, 80);
        setTimeout(() => this.playBeep(800, 80), 100);
    }

    // Like sound (pleasant chime)
    playLike() {
        this.playBeep(523, 100); // C5
        setTimeout(() => this.playBeep(659, 100), 80); // E5
    }

    // Follow sound (two ascending notes)
    playFollow() {
        this.playBeep(440, 120); // A4
        setTimeout(() => this.playBeep(554, 120), 100); // C#5
    }

    // Share sound (three ascending notes)
    playShare() {
        this.playBeep(392, 80); // G4
        setTimeout(() => this.playBeep(494, 80), 70); // B4
        setTimeout(() => this.playBeep(587, 80), 140); // D5
    }

    // Comment sound (gentle double beep)
    playComment() {
        this.playBeep(700, 90);
        setTimeout(() => this.playBeep(700, 90), 100);
    }

    // Viral sound (exciting ascending scale)
    playViral() {
        const notes = [523, 587, 659, 784]; // C5, D5, E5, G5
        notes.forEach((freq, i) => {
            setTimeout(() => this.playBeep(freq, 100), i * 80);
        });
    }

    // Post published sound (satisfying chord)
    playPostPublished() {
        this.playBeep(523, 150); // C5
        setTimeout(() => this.playBeep(659, 150), 50); // E5
        setTimeout(() => this.playBeep(784, 150), 100); // G5
    }

    // Error sound (descending beep)
    playError() {
        this.playBeep(600, 100);
        setTimeout(() => this.playBeep(400, 100), 100);
    }

    // Milestone sound (celebratory)
    playMilestone() {
        const notes = [523, 659, 784, 1047]; // C5, E5, G5, C6
        notes.forEach((freq, i) => {
            setTimeout(() => this.playBeep(freq, 120), i * 100);
        });
    }

    // Toggle sound on/off
    toggleSound() {
        this.soundEnabled = !this.soundEnabled;
        this.saveSoundSettings();
        return this.soundEnabled;
    }

    // Set volume (0-1)
    setVolume(vol) {
        this.volume = Math.max(0, Math.min(1, vol));
        this.saveSoundSettings();
    }
}

// Initialize global audio manager
const audioManager = new AudioManager();

