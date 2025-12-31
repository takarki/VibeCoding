document.addEventListener('DOMContentLoaded', async () => {
    // State
    let podcastData = null;
    let currentIndex = -1;
    let isPlaying = false;
    let isLoading = false;
    let apiKey = '';

    // Constants
    const SPEAKERS = {
        KEN: { name: "ケン", voice: "Kore", label: "専門家" },
        MIKA: { name: "ミカ", voice: "Aoede", label: "聞き手" }
    };

    // Elements
    const audioPlayer = document.getElementById('audio-player');
    const playPauseBtn = document.getElementById('play-pause-btn');
    const playIcon = document.getElementById('play-icon');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const progressBar = document.getElementById('progress-bar');
    const progressText = document.getElementById('progress-text');
    const segmentTitle = document.getElementById('current-segment-title');
    const segmentInfo = document.getElementById('segment-info');
    const transcriptList = document.getElementById('transcript-list');
    const pulseBg = document.getElementById('pulse-bg');
    const visualizer = document.getElementById('visualizer');
    const playbackStatus = document.getElementById('playback-status');
    const totalSegmentsLabel = document.getElementById('total-segments');

    // Load API Key and Data
    const settings = await chrome.storage.local.get(['geminiApiKey', 'podcastData']);
    apiKey = settings.geminiApiKey || '';
    podcastData = settings.podcastData || null;

    if (!apiKey) {
        document.getElementById('api-key-banner').classList.remove('hidden');
    }

    if (podcastData) {
        initPlayer(podcastData);
    } else {
        segmentTitle.textContent = 'データがありません';
        segmentInfo.textContent = 'Geminiでポッドキャスト台本を生成してください';
    }

    document.getElementById('open-settings-btn').addEventListener('click', () => {
        chrome.runtime.openOptionsPage();
    });

    function initPlayer(data) {
        document.getElementById('podcast-title').textContent = data.title || 'ポッドキャスト台本';
        document.getElementById('podcast-subtitle').textContent = `Episode: ${data.episode || '1'}`;
        totalSegmentsLabel.textContent = `${data.script.length} SEGMENTS`;

        renderTranscript(data.script);
    }

    function renderTranscript(script) {
        transcriptList.innerHTML = '';
        script.forEach((item, idx) => {
            const div = document.createElement('div');
            div.className = `group cursor-pointer p-6 rounded-3xl transition-all border bg-zinc-800/20 border-transparent hover:bg-zinc-800/40 text-zinc-500`;
            div.id = `segment-${idx}`;

            const speakerInfo = SPEAKERS[item.speaker] || { name: item.speaker, label: "話者" };
            const speakerClass = item.speaker === 'KEN' ? 'bg-indigo-900/50 text-indigo-400' : 'bg-fuchsia-900/50 text-fuchsia-400';

            div.innerHTML = `
                <div class="flex justify-between items-start mb-3">
                    <span class="text-[10px] font-black uppercase px-2.5 py-1 rounded-lg tracking-wider ${speakerClass}">
                        ${speakerInfo.name} • ${speakerInfo.label}
                    </span>
                    <span class="text-[11px] font-mono text-zinc-600 group-hover:text-zinc-400 font-bold">${item.time || '00:00'}</span>
                </div>
                <p class="text-[15px] leading-relaxed transition-colors duration-300 group-hover:text-zinc-300">
                    ${item.text}
                </p>
            `;

            div.addEventListener('click', () => playLine(idx));
            transcriptList.appendChild(div);
        });
    }

    async function playLine(index) {
        if (!podcastData || index < 0 || index >= podcastData.script.length) {
            isPlaying = false;
            currentIndex = -1;
            updateUI();
            return;
        }

        if (isLoading) return;

        currentIndex = index;
        const line = podcastData.script[index];

        // Highlight active segment
        highlightSegment(index);

        // Fetch audio if key provided
        if (apiKey) {
            isLoading = true;
            updateUI();
            const url = await fetchAudio(line);
            isLoading = false;

            if (url) {
                audioPlayer.src = url;
                audioPlayer.play();
                isPlaying = true;
            }
        } else {
            // No API key, just simulate playback
            isPlaying = true;
            setTimeout(() => {
                if (isPlaying && currentIndex === index) {
                    playLine(index + 1);
                }
            }, 3000); // 3 sec per line mock
        }
        updateUI();
    }

    function highlightSegment(index) {
        // Remove highligh from all
        document.querySelectorAll('[id^="segment-"]').forEach(el => {
            el.className = 'group cursor-pointer p-6 rounded-3xl transition-all border bg-zinc-800/20 border-transparent hover:bg-zinc-800/40 text-zinc-500';
            el.classList.remove('translate-x-2');
        });

        // Add to active
        const active = document.getElementById(`segment-${index}`);
        if (active) {
            active.className = 'group cursor-pointer p-6 rounded-3xl transition-all border bg-indigo-600/15 border-indigo-500/40 shadow-[inset_0_0_20px_rgba(99,102,241,0.1)] ring-1 ring-indigo-500/20 translate-x-2';
            active.querySelector('p').classList.add('text-zinc-100', 'font-medium');
            active.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }

    async function fetchAudio(line) {
        const speakerInfo = SPEAKERS[line.speaker] || { name: line.speaker, voice: "Aoede" };
        const payload = {
            contents: [{ parts: [{ text: `${speakerInfo.name}: ${line.text}` }] }],
            generationConfig: {
                responseModalities: ["AUDIO"],
                speechConfig: {
                    voiceConfig: {
                        multiSpeakerVoiceConfig: {
                            speakerVoiceConfigs: [
                                { speaker: "ケン", voiceConfig: { prebuiltVoiceConfig: { voiceName: SPEAKERS.KEN.voice } } },
                                { speaker: "ミカ", voiceConfig: { prebuiltVoiceConfig: { voiceName: SPEAKERS.MIKA.voice } } }
                            ]
                        }
                    }
                }
            },
            model: "gemini-2.0-flash-exp" // Use stable or available TTS model
        };

        try {
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-goog-api-key': apiKey
                },
                body: JSON.stringify(payload)
            });
            if (!response.ok) return null;
            const result = await response.json();
            const { data } = result.candidates[0].content.parts[0].inlineData;
            return `data:audio/wav;base64,${data}`; // Simplify for demo, standard pcm2wav might be needed for real binary
        } catch (e) {
            console.error('Audio fetch failed:', e);
            return null;
        }
    }

    function updateUI() {
        // Visualizer
        if (isPlaying && !isLoading) {
            pulseBg.classList.add('opacity-100', 'scale-110');
            pulseBg.classList.remove('opacity-0', 'scale-90');
            visualizer.querySelectorAll('div').forEach(el => el.classList.add('animate-bounce'));
            playbackStatus.innerHTML = '<span class="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>On Air';
            playIcon.textContent = 'pause';
        } else {
            pulseBg.classList.remove('opacity-100', 'scale-110');
            pulseBg.classList.add('opacity-0', 'scale-90');
            visualizer.querySelectorAll('div').forEach(el => el.classList.remove('animate-bounce'));
            playbackStatus.innerHTML = '<span class="w-2 h-2 rounded-full bg-indigo-500"></span>' + (isLoading ? 'Loading...' : 'Paused');
            playIcon.textContent = 'play_arrow';
        }

        if (isLoading) {
            playPauseBtn.innerHTML = '<div class="w-10 h-10 border-4 border-zinc-900 border-t-transparent rounded-full animate-spin"></div>';
        } else {
            playPauseBtn.innerHTML = `<span id="play-icon" class="material-icons text-5xl">${isPlaying ? 'pause' : 'play_arrow'}</span>`;
        }

        // Info
        if (currentIndex >= 0 && podcastData) {
            segmentTitle.textContent = podcastData.script[currentIndex].text.substring(0, 30) + '...';
            segmentInfo.textContent = `Chapter: ${currentIndex + 1} of ${podcastData.script.length}`;
            const progress = ((currentIndex + 1) / podcastData.script.length) * 100;
            progressBar.style.width = `${progress}%`;
            progressText.textContent = `${Math.round(progress)}% Completed`;
        }
    }

    playPauseBtn.addEventListener('click', () => {
        if (isPlaying) {
            audioPlayer.pause();
            isPlaying = false;
        } else {
            if (currentIndex === -1) {
                playLine(0);
            } else {
                audioPlayer.play();
                isPlaying = true;
            }
        }
        updateUI();
    });

    prevBtn.addEventListener('click', () => {
        if (currentIndex > 0) playLine(currentIndex - 1);
    });

    nextBtn.addEventListener('click', () => {
        if (podcastData && currentIndex < podcastData.script.length - 1) playLine(currentIndex + 1);
    });

    audioPlayer.onEnded = () => {
        if (podcastData && currentIndex < podcastData.script.length - 1) {
            playLine(currentIndex + 1);
        } else {
            isPlaying = false;
            updateUI();
        }
    };
});
