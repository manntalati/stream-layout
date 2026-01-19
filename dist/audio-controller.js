// Listener for messages from the parent extension
window.addEventListener('message', (event) => {
    // Basic security check: ensure message is from our extension
    // We expect an object with: type: 'SET_VOLUME' | 'SET_MUTE', payload: { value }

    if (!event.data || !event.data.type) return;

    if (event.data.type === 'SET_VOLUME') {
        const volume = event.data.payload.value; // 0 to 1
        setAllMediaVolume(volume);
    }
    else if (event.data.type === 'SET_MUTE') {
        const isMuted = event.data.payload.value; // boolean
        muteAllMedia(isMuted);
    }
});

function setAllMediaVolume(volume) {
    const mediaElements = document.querySelectorAll('video, audio');
    mediaElements.forEach(media => {
        media.volume = volume;
    });
}

function muteAllMedia(isMuted) {
    const mediaElements = document.querySelectorAll('video, audio');
    mediaElements.forEach(media => {
        media.muted = isMuted;
    });
}
