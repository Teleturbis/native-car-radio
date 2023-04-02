import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { Alert, Button, Linking, StyleSheet, View, Text } from 'react-native';

const track = {
  name: '',
  album: {
    images: [{ url: '' }],
  },
  artists: [{ name: '' }],
};

function WebPlayback(props) {
  const [is_paused, setPaused] = useState(false);
  const [is_active, setActive] = useState(false);
  const [player, setPlayer] = useState(undefined);
  const [current_track, setTrack] = useState(track);
  const [deviceId, setDeviceId] = useState('');
  const [devices, setDevices] = useState(null);
  const [raspi, setRaspi] = useState(null);
  const [recentlyPlayed, setRecentlyPlayed] = useState(null);

  useEffect(() => {
    /*
    ** Load the Spotify SDK script
    ** React-Native does not support the script tag!!
    ** Take a look here: https://github.com/lufinkey/react-native-spotify
    */
    useEffect(() => {
      const script = document.createElement('script');
      script.src = 'https://sdk.scdn.co/spotify-player.js';
      script.async = true;

      document.body.appendChild(script);
    }, []);

    window.onSpotifyWebPlaybackSDKReady = () => {
      const player = new window.Spotify.Player({
        name: 'Web Playback SDK',
        getOAuthToken: (cb) => {
          cb(props.token);
        },
        volume: 0.5,
      });

      setPlayer(player);

      player.addListener('ready', ({ device_id }) => {
        console.log('Ready with Device ID', device_id);
        setDeviceId(device_id);
      });

      player.addListener('not_ready', ({ device_id }) => {
        console.log('Device ID has gone offline', device_id);
      });

      player.addListener('player_state_changed', (state) => {
        if (!state) {
          return;
        }

        setTrack(state.track_window.current_track);
        setPaused(state.paused);

        player.getCurrentState().then((state) => {
          !state ? setActive(false) : setActive(true);
        });
      });

      player.connect();
    };
  }, []);

  async function pause() {
    axios
      .get(
        'https://api.spotify.com/v1/me/player/devices',

        {
          headers: {
            Authorization: `Bearer ${props.token}`,
          },
        }
      )
      .then((response) => {
        setDevices(response.data.devices);
      })
      .catch((error) => {
        console.log(error);
      });
  }

  useEffect(() => {
    if (!devices) return;
    const raspi = devices.find(
      (device) => device.name === 'raspotify (raspberrypi)'
    );
    const track = {
      offset: null,
      album: null,
    };

    if (!raspi) return;

    setRaspi(raspi);
    console.log(raspi);

    axios
      .get('https://api.spotify.com/v1/me/player/recently-played?limit=1', {
        headers: {
          Authorization: `Bearer ${props.token}`,
        },
      })
      .then((response) => {
        console.log(response.data);
        track.offset = response.data.items[0].track.track_number;
        track.album = response.data.items[0].track.album.uri;
        setRecentlyPlayed({ offset: track.offset, album: track.album });
      })
      .catch((error) => {
        console.log(error);
      });

    if (track.album == null || track.offset == null) return;
  }, [devices]);

  useEffect(() => {
    if (!raspi || recentlyPlayed == null) return;
    axios
      .put(
        `https://api.spotify.com/v1/me/player/play?device_id=${raspi.id}`,
        {
          context_uri: recentlyPlayed.album,
          offset: {
            position: recentlyPlayed.offset,
          },
          position_ms: 0,
        },
        {
          headers: {
            Authorization: `Bearer ${props.token}`,
          },
        }
      )
      .then((response) => {
        console.log(response);
      })
      .catch((error) => {
        console.log(error);
      });
  }, [raspi]);

  return <Button onPress={() => pause()} title='Pause' />;
}

export default WebPlayback;
