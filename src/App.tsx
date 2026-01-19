import React, { useState, useEffect } from 'react';

interface Stream {
    id: string;
    url: string;
    isMuted: boolean;
    volume: number;
    isFullscreen: boolean;
}

function App() {
    const [streams, setStreams] = useState<Stream[]>([]);
    const [urlInput, setUrlInput] = useState('');
    const iframeRefs = React.useRef<{ [key: string]: HTMLIFrameElement | null }>({});

    const addStream = () => {
        if (!urlInput) return;

        let formattedUrl = urlInput;
        if (!formattedUrl.startsWith('http')) {
            formattedUrl = 'https://' + formattedUrl;
        }

        const newStream: Stream = {
            id: Math.random().toString(36).substring(2, 11),
            url: formattedUrl,
            isMuted: true,
            volume: 0,
            isFullscreen: false,
        };

        setStreams([...streams, newStream]);
        setUrlInput('');
    };

    const removeStream = (id: string) => {
        setStreams(streams.filter(s => s.id !== id));
    };

    const toggleMute = (id: string) => {
        const stream = streams.find(s => s.id === id);
        if (!stream) return;

        const newMuted = !stream.isMuted;
        setStreams(streams.map(s => s.id === id ? { ...s, isMuted: newMuted } : s));
        sendMessage(id, 'SET_MUTE', { value: newMuted });

        // If unmuting, ensure volume is restored
        if (!newMuted) {
            sendMessage(id, 'SET_VOLUME', { value: stream.volume / 100 || 1 });
        }
    };

    const handleVolumeChange = (id: string, newVolume: number) => {
        setStreams(streams.map(s => s.id === id ? { ...s, volume: newVolume, isMuted: newVolume === 0 } : s));
        sendMessage(id, 'SET_VOLUME', { value: newVolume / 100 });
        if (newVolume > 0) {
            sendMessage(id, 'SET_MUTE', { value: false });
        }
    };

    const sendMessage = (streamId: string, type: string, payload: any) => {
        const iframe = iframeRefs.current[streamId];
        if (iframe && iframe.contentWindow) {
            iframe.contentWindow.postMessage({ type, payload }, '*');
        }
    };

    const getGridTemplate = () => {
        const count = streams.length;
        if (count === 0) return {};
        if (count === 1) return { gridTemplateColumns: '1fr', gridTemplateRows: '1fr' };
        if (count === 2) return { gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr' };
        if (count <= 4) return { gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr' };
        if (count <= 6) return { gridTemplateColumns: '1fr 1fr 1fr', gridTemplateRows: '1fr 1fr' };
        return { gridTemplateColumns: '1fr 1fr 1fr', gridTemplateRows: '1fr 1fr 1fr' };
    };

    return (
        <div className="dashboard">
            <header className="top-bar">
                <div className="logo">STREAM LAYOUT</div>
                <div className="url-input-group">
                    <input
                        type="text"
                        className="url-input"
                        placeholder="Enter stream URL (e.g. youtube.com, twitch.tv)"
                        value={urlInput}
                        onChange={(e) => setUrlInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && addStream()}
                    />
                    <button className="btn" onClick={addStream}>ADD STREAM</button>
                </div>
                <div style={{ width: '120px' }}></div> {/* Spacer */}
            </header>

            <main className="grid-container" style={getGridTemplate()}>
                {streams.length === 0 ? (
                    <div className="empty-state">
                        <h1>No Active Streams</h1>
                        <p>Enter a URL above to start watching</p>
                    </div>
                ) : (
                    streams.map((stream) => (
                        <div key={stream.id} className="stream-card">
                            <div className="stream-controls">
                                <button
                                    className="control-btn"
                                    onClick={() => toggleMute(stream.id)}
                                    title={stream.isMuted ? "Unmute" : "Mute"}
                                >
                                    {stream.isMuted ? '🔇' : '🔊'}
                                </button>
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={stream.isMuted ? 0 : stream.volume}
                                    onChange={(e) => handleVolumeChange(stream.id, Number(e.target.value))}
                                    className="volume-slider"
                                    style={{ width: '60px', marginLeft: '5px', marginRight: '5px' }}
                                />
                                <button
                                    className="control-btn"
                                    onClick={() => removeStream(stream.id)}
                                    title="Remove"
                                >
                                    ✕
                                </button>
                            </div>
                            <iframe
                                ref={(el: HTMLIFrameElement | null) => { if (el) iframeRefs.current[stream.id] = el }}
                                src={stream.url}
                                allow="autoplay; encrypted-media; fullscreen"
                                title={`Stream ${stream.id}`}
                            />
                        </div>
                    ))
                )}
            </main>
        </div>
    );
}

export default App;
