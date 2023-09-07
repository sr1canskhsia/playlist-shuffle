import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
  BiVolumeMute,
  BiVolumeLow,
  BiVolumeFull,
} from 'react-icons/bi';
import { isMutedActive, setVolume } from '../../../redux/actions/playerActions';

function VolumeManager({ player, isMutedActive, setVolume }) {
  const handleIconClick = () => {
    if (player.isMutedActive === true) {
      isMutedActive(false);
    } else {
      isMutedActive(true);
    }
  };

  const handleChange = (e) => {
    isMutedActive(false);
    setVolume(parseFloat(e.target.value));
  };

  return (
    <div className="flex justify-center md:w-1/5 md:items-center">
      { (player.volume >= 0.50 && player.isMutedActive === false)
      && (
      <BiVolumeFull
        className="text-primaryColor dark:text-primaryColorDarkMode  hover:drop-shadow-svgShadow hover:scale-110"
        size={30}
        onClick={handleIconClick}
      />
      )}
      { (player.volume < 0.50 && player.isMutedActive === false)
      && (
      <BiVolumeLow
        className="text-primaryColor dark:text-primaryColorDarkMode hover:drop-shadow-svgShadow hover:scale-110"
        size={30}
        onClick={handleIconClick}
      />
      )}
      { player.isMutedActive === true && (
      <BiVolumeMute
        className="text-primaryColor dark:text-primaryColorDarkMode  hover:drop-shadow-svgShadow hover:scale-110"
        size={30}
        onClick={handleIconClick}
      />
      )}
      <input
        aria-label="volume manager"
        type="range"
        className="w-3/5"
        name="volume"
        id="volume"
        value={player.volume}
        min={0}
        onChange={(e) => handleChange(e)}
        max={1}
        step="any"
      />
    </div>

  );
}

VolumeManager.propTypes = {
  player: PropTypes.shape({
    isPlaying: PropTypes.bool.isRequired,
    currentSong: PropTypes.string.isRequired,
    isShuffleActive: PropTypes.bool.isRequired,
    isLoopActive: PropTypes.bool.isRequired,
    currentActivePlaylistId: PropTypes.string.isRequired,
    isMutedActive: PropTypes.bool.isRequired,
    volume: PropTypes.number.isRequired,
  }).isRequired,
  isMutedActive: PropTypes.func.isRequired,
  setVolume: PropTypes.func.isRequired,

};

const mapDispatchToProps = {
  isMutedActive,
  setVolume,
};

const mapStateToProps = (state) => ({
  player: state.player,
  playlistSongsById: state.playlistSongsById,
  playlistDetails: state.playlistDetails,
});

export default connect(mapStateToProps, mapDispatchToProps)(VolumeManager);
