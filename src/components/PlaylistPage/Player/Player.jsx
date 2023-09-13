import React, { useEffect, useRef } from 'react';
import { connect } from 'react-redux';
import ReactPlayer from 'react-player/youtube';
import PropTypes from 'prop-types';
import {
  isPlaying,
  currentSong,
  setProgress,
  setVideoDuration,
  setPercentage,
  setSeeking,
  setArtist,
  setTitle,
} from '../../../redux/actions/playerActions';
import { lastPlayedIndexPlaylistDetails } from '../../../redux/actions/playlistDetailsActions';

function Player({
  player,
  isPlaying,
  currentSong,
  playlistSongsById,
  setVideoDuration,
  setProgress,
  setPercentage,
  playlistDetails,
  setArtist,
  setTitle,
  lastPlayedIndexPlaylistDetails,
}) {
  const playerRef = useRef(null);

  const findPlaylistIndex = playlistDetails.findIndex(
    (element) => element.playlistId === player.currentActivePlaylistId,
  );

  const afterSongEnds = () => {
    const currIndex = playlistDetails[findPlaylistIndex].currentIndex;
    if (
      playlistDetails[findPlaylistIndex].currentIndex
      < playlistSongsById[player.currentActivePlaylistId].length - 1
    ) {
      const lastPlayedObj = {
        currentIndex: playlistDetails[findPlaylistIndex].currentIndex + 1,
        playlistId: player.currentActivePlaylistId,
      };
      lastPlayedIndexPlaylistDetails(lastPlayedObj);
      currentSong(
        playlistSongsById[player.currentActivePlaylistId][currIndex + 1]
          ?.snippet.resourceId.videoId,
      );
    } else if (playlistDetails[findPlaylistIndex].currentIndex
      === playlistSongsById[player.currentActivePlaylistId].length - 1) {
      // empty
    }
  };

  const handleEnd = () => {
    if (
      playlistDetails[findPlaylistIndex].currentIndex
      === playlistSongsById[player.currentActivePlaylistId].length
    ) {
      // empty
      isPlaying(false);
    } else {
      afterSongEnds();
    }
  };
  // When some songs can't be played outside of youtube this function will trigger
  // and playlist the next song, or if it is the last the playlist will end
  const handleError = () => {
    const currIndex = playlistDetails[findPlaylistIndex].currentIndex;
    // eslint-disable-next-line
    if (
      currIndex
      === playlistDetails[findPlaylistIndex].playlistLength
    ) {
      // empty
      isPlaying(false);
    } else afterSongEnds();
  };

  useEffect(() => {
    if (player.seeking === true) {
      playerRef.current.seekTo(player.seekTo);
      setSeeking(false);
    }
  }, [player.seekTo]);

  const handlePlay = () => {
    isPlaying(true);
  };
  const handlePause = () => {
    isPlaying(false);
  };

  const getTitleAndArtist = (title, ownerTitle) => {
    try {
      const joinedTitleAndOwnerTitle = [title, ownerTitle];
      if (title === 'Private video') {
        return title;
      }
      if (joinedTitleAndOwnerTitle[0].includes('-')) {
        const regex = /^(.*?)-(.*)$/;
        const match = joinedTitleAndOwnerTitle[0].match(regex);

        const [, artist, title] = match;

        return [title, artist];
      }
      if (joinedTitleAndOwnerTitle[0].includes('//')) {
        const regex = /^(.*?)\s\/\/\s(.*)$/;
        const match = joinedTitleAndOwnerTitle[0].match(regex);

        const [, artist, title] = match;

        return [title, artist];
      }
      if (joinedTitleAndOwnerTitle[1].includes(' - Topic')) {
        const regex = /^(.*?)\s-\sTopic$/;
        const match = joinedTitleAndOwnerTitle[1].match(regex);
        const artist = match[1];
        return [title, artist];
      }
      return [title, ownerTitle];
    } catch (error) {
      return title;
    }
  };

  const handleReady = () => {
    const [title, artist] = getTitleAndArtist(
      playlistSongsById[player.currentActivePlaylistId][
        playlistDetails[findPlaylistIndex].currentIndex
      ].snippet.title,
      playlistSongsById[player.currentActivePlaylistId][
        playlistDetails[findPlaylistIndex].currentIndex
      ].snippet.videoOwnerChannelTitle,
    );
    setTitle(`${playlistDetails[findPlaylistIndex].currentIndex + 1} - ${title}`);
    setArtist(artist);
    setProgress(0);
    setVideoDuration(playerRef.current.getDuration());
    isPlaying(true);
  };
  const getPercentage = (a, b) => {
    const trimmedA = Math.floor(a);
    const percentage = (trimmedA / b) * 100;
    setPercentage(Math.floor(percentage));
  };

  const handleProgress = (e) => {
    setProgress(Math.floor(e.playedSeconds));
    getPercentage(e.playedSeconds, player.videoDuration);
  };

  return (
    <div className="player h-full aspect-auto md:w-full md:mx-2 md:h-full">
      {/* https://img.youtube.com/vi/Eeb4aZObp-0/0.jpg */}
      <ReactPlayer
        playing={player.isPlaying}
        ref={playerRef}
        muted={player.isMutedActive}
        passive="true"
        onProgress={(e) => handleProgress(e)}
        onError={() => handleError()}
        onPlay={() => handlePlay()}
        onPause={() => handlePause()}
        config={{
          youtube: {
            playerVars: {
              color: 'white',
              controls: 1,
            },
          },
        }}
        onReady={() => handleReady()}
        onEnded={() => handleEnd()}
        volume={player.volume}
        width="100%"
        height="100%"
        controls
        loop={player.isLoopActive}
        url={`https://www.youtube.com/embed/${player.currentSong}`}
      />
    </div>
  );
}

Player.propTypes = {
  player: PropTypes.shape({
    isPlaying: PropTypes.bool.isRequired,
    currentSong: PropTypes.string.isRequired,
    isShuffleActive: PropTypes.bool.isRequired,
    isLoopActive: PropTypes.bool.isRequired,
    currentActivePlaylistId: PropTypes.string.isRequired,
    isMutedActive: PropTypes.bool.isRequired,
    videoDuration: PropTypes.number.isRequired,
    volume: PropTypes.number.isRequired,
    seeking: PropTypes.bool.isRequired,
    seekTo: PropTypes.number.isRequired,

  }).isRequired,
  playlistDetails: PropTypes.arrayOf(PropTypes.shape({
    playlistName: PropTypes.string.isRequired,
    playlistId: PropTypes.string.isRequired,
    playlistImage: PropTypes.string.isRequired,
    playlistEtag: PropTypes.string.isRequired,
    currentIndex: PropTypes.number.isRequired,
    playlistLength: PropTypes.number.isRequired,

  })).isRequired,
  isPlaying: PropTypes.func.isRequired,
  currentSong: PropTypes.func.isRequired,
  setPercentage: PropTypes.func.isRequired,
  playlistSongsById: PropTypes.objectOf(PropTypes.arrayOf).isRequired,
  setProgress: PropTypes.func.isRequired,
  setVideoDuration: PropTypes.func.isRequired,
  setTitle: PropTypes.func.isRequired,
  setArtist: PropTypes.func.isRequired,
  lastPlayedIndexPlaylistDetails: PropTypes.func.isRequired,

};

const mapDispatchToProps = {
  isPlaying,
  currentSong,
  setProgress,
  setVideoDuration,
  setPercentage,
  lastPlayedIndexPlaylistDetails,
  setTitle,
  setArtist,
};

const mapStateToProps = (state) => ({
  player: state.player,
  playlistSongsById: state.playlistSongsById,
  playlistDetails: state.playlistDetails,
});

export default connect(mapStateToProps, mapDispatchToProps)(Player);
