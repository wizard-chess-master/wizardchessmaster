import React, { useState, useEffect } from 'react';
import { Play, Pause, SkipForward, SkipBack, Shuffle, Volume2, VolumeX, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { musicPlaylistManager, MusicTrack } from '@/lib/audio/musicPlaylistManager';

interface MusicPlaylistControlsProps {
  className?: string;
}

export function MusicPlaylistControls({ className = '' }: MusicPlaylistControlsProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<MusicTrack | null>(null);
  const [volume, setVolume] = useState(0.42);
  const [muted, setMuted] = useState(false);
  const [tracks, setTracks] = useState<MusicTrack[]>([]);
  const [showAddTrack, setShowAddTrack] = useState(false);

  // Update state from playlist manager
  useEffect(() => {
    const updateState = () => {
      const state = musicPlaylistManager.getState();
      setIsPlaying(state.isPlaying);
      setCurrentTrack(state.currentTrack);
      setVolume(state.volume);
      setMuted(state.muted);
      setTracks(musicPlaylistManager.getPlaylist());
    };

    // Initial state
    updateState();

    // Update every second to track changes
    const interval = setInterval(updateState, 1000);
    return () => clearInterval(interval);
  }, []);

  const handlePlayPause = () => {
    if (isPlaying) {
      musicPlaylistManager.stop();
    } else {
      musicPlaylistManager.play();
    }
  };

  const handleNext = () => {
    musicPlaylistManager.next();
  };

  const handlePrevious = () => {
    musicPlaylistManager.previous();
  };

  const handleShuffle = () => {
    musicPlaylistManager.shuffle();
    setTracks(musicPlaylistManager.getPlaylist());
  };

  const handleVolumeChange = (newVolume: number) => {
    musicPlaylistManager.setVolume(newVolume);
  };

  const handleMuteToggle = () => {
    musicPlaylistManager.setMuted(!muted);
  };

  const handleAddTrack = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    Array.from(files).forEach((file, index) => {
      if (file.type.startsWith('audio/')) {
        const url = URL.createObjectURL(file);
        const track: MusicTrack = {
          id: `custom-${Date.now()}-${index}`,
          name: file.name.replace(/\.[^/.]+$/, ''), // Remove extension
          file: url,
          mood: 'ambient' // Default mood for custom tracks
        };
        
        musicPlaylistManager.addTrack(track);
      }
    });

    setTracks(musicPlaylistManager.getPlaylist());
    setShowAddTrack(false);
  };

  return (
    <Card className={`w-80 ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          🎵 Background Music
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAddTrack(!showAddTrack)}
            className="ml-auto h-6 w-6 p-0"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Current Track Display */}
        <div className="text-center">
          <div className="text-sm font-medium text-gray-900 truncate">
            {currentTrack?.name || 'No track playing'}
          </div>
          {currentTrack?.mood && (
            <div className="text-xs text-gray-500 capitalize">
              {currentTrack.mood} • {tracks.length} tracks
            </div>
          )}
        </div>

        {/* Playback Controls */}
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrevious}
            disabled={tracks.length <= 1}
            className="h-8 w-8 p-0"
          >
            <SkipBack className="h-4 w-4" />
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handlePlayPause}
            className="h-10 w-10 p-0"
          >
            {isPlaying ? (
              <Pause className="h-5 w-5" />
            ) : (
              <Play className="h-5 w-5" />
            )}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleNext}
            disabled={tracks.length <= 1}
            className="h-8 w-8 p-0"
          >
            <SkipForward className="h-4 w-4" />
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleShuffle}
            disabled={tracks.length <= 1}
            className="h-8 w-8 p-0"
          >
            <Shuffle className="h-4 w-4" />
          </Button>
        </div>

        {/* Volume Control */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleMuteToggle}
            className="h-6 w-6 p-0"
          >
            {muted ? (
              <VolumeX className="h-4 w-4" />
            ) : (
              <Volume2 className="h-4 w-4" />
            )}
          </Button>
          
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={volume}
            onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
            className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          
          <span className="text-xs text-gray-500 w-8">
            {Math.round(volume * 100)}%
          </span>
        </div>

        {/* Add Track Interface */}
        {showAddTrack && (
          <div className="border-t pt-3">
            <label className="text-xs font-medium text-gray-700 block mb-2">
              Add Music Files (MP3, WAV, OGG)
            </label>
            <input
              type="file"
              accept="audio/*"
              multiple
              onChange={handleAddTrack}
              className="w-full text-xs file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:font-medium file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
            />
            <div className="text-xs text-gray-500 mt-1">
              Files will be added to your playlist for this session
            </div>
          </div>
        )}

        {/* Track List */}
        {tracks.length > 0 && (
          <div className="border-t pt-3">
            <div className="text-xs font-medium text-gray-700 mb-2">
              Playlist ({tracks.length} tracks)
            </div>
            <div className="max-h-32 overflow-y-auto space-y-1">
              {tracks.map((track, index) => (
                <div
                  key={track.id}
                  className={`text-xs p-2 rounded cursor-pointer transition-colors ${
                    currentTrack?.id === track.id
                      ? 'bg-blue-100 text-blue-900'
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                  }`}
                  onClick={() => musicPlaylistManager.playTrack(track.id)}
                >
                  <div className="font-medium truncate">{track.name}</div>
                  <div className="text-gray-500 capitalize">{track.mood}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}