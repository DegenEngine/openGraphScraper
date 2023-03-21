import fields from './fields';
import type {
  ImageObject,
  MusicSongObject,
  OgObject,
  OpenGraphScraperOptions,
  TwitterImageObject,
  TwitterPlayerObject,
  VideoObject,
} from './types';

const mediaMapperTwitterImage = (item: TwitterImageObject) => ({
  alt: item[3],
  height: item[2],
  url: item[0],
  width: item[1],
});

const mediaMapperTwitterPlayer = (item: TwitterPlayerObject) => ({
  height: item[2],
  stream: item[3],
  url: item[0],
  width: item[1],
});

const mediaMapperMusicSong = (item: MusicSongObject) => ({
  disc: item[2],
  track: item[1],
  url: item[0],
});

const mediaMapper = (item: ImageObject | VideoObject) => ({
  height: item[2],
  type: item[3],
  url: item[0],
  width: item[1],
});

const mediaSorter = (
  a: ImageObject | TwitterImageObject | VideoObject | TwitterPlayerObject,
  b: ImageObject | TwitterImageObject | VideoObject | TwitterPlayerObject,
) => {
  if (!(a.url && b.url)) {
    return 0;
  }

  const aRes = a.url.match(/\.(\w{2,5})$/);
  const aExt = (aRes && aRes[1].toLowerCase()) || null;
  const bRes = b.url.match(/\.(\w{2,5})$/);
  const bExt = (bRes && bRes[1].toLowerCase()) || null;

  if (aExt === 'gif' && bExt !== 'gif') {
    return -1;
  } if (aExt !== 'gif' && bExt === 'gif') {
    return 1;
  }
  return Math.max(b.width, b.height) - Math.max(a.width, a.height);
};

const mediaSorterMusicSong = (a: MusicSongObject, b: MusicSongObject) => {
  if (!(a.track && b.track)) {
    return 0;
  } if (a.disc > b.disc) {
    return 1;
  } if (a.disc < b.disc) {
    return -1;
  }
  return a.track - b.track;
};

// lodash zip replacement
const zip = (array, ...args) => {
  if (array === undefined) return [];
  return array
    .map((value, idx) => [value, ...args.map((arr) => arr[idx])]);
};

/**
 * formats the multiple media values
 *
 * @param {object} ogObject - the current ogObject
 * @param {object} options - options for ogs
 * @return {object} object with ogs results with updated media values
 *
 */
export function mediaSetup(ogObject: OgObject, options: OpenGraphScraperOptions) {
  // sets ogImage image/width/height/type to null if one these exists
  if (ogObject.ogImage || ogObject.ogImageWidth || ogObject.ogImageHeight || ogObject.ogImageType) {
    ogObject.ogImage = ogObject.ogImage ? ogObject.ogImage : [null];
    ogObject.ogImageWidth = ogObject.ogImageWidth ? ogObject.ogImageWidth : [null];
    ogObject.ogImageHeight = ogObject.ogImageHeight ? ogObject.ogImageHeight : [null];
    ogObject.ogImageType = ogObject.ogImageType ? ogObject.ogImageType : [null];
  }

  // format images and limit to 10
  const ogImages: ImageObject[] = zip(
    ogObject.ogImage,
    ogObject.ogImageWidth,
    ogObject.ogImageHeight,
    ogObject.ogImageType,
  )
    .map(mediaMapper)
    .filter((value, index) => index < 10)
    .sort(mediaSorter);

  // sets ogVideo video/width/height/type to null if one these exists
  if (ogObject.ogVideo || ogObject.ogVideoWidth || ogObject.ogVideoHeight || ogObject.ogVideoType) {
    ogObject.ogVideo = ogObject.ogVideo ? ogObject.ogVideo : [null];
    ogObject.ogVideoWidth = ogObject.ogVideoWidth ? ogObject.ogVideoWidth : [null];
    ogObject.ogVideoHeight = ogObject.ogVideoHeight ? ogObject.ogVideoHeight : [null];
    ogObject.ogVideoType = ogObject.ogVideoType ? ogObject.ogVideoType : [null];
  }

  // format videos and limit to 10
  const ogVideos: VideoObject[] = zip(
    ogObject.ogVideo,
    ogObject.ogVideoWidth,
    ogObject.ogVideoHeight,
    ogObject.ogVideoType,
  )
    .map(mediaMapper)
    .filter((value, index) => index < 10)
    .sort(mediaSorter);

  // sets twitter image image/width/height/type to null if one these exists
  if (
    ogObject.twitterImageSrc
    || ogObject.twitterImage
    || ogObject.twitterImageWidth
    || ogObject.twitterImageHeight
    || ogObject.twitterImageAlt
  ) {
    ogObject.twitterImageSrc = ogObject.twitterImageSrc ? ogObject.twitterImageSrc : [null];
    ogObject.twitterImage = ogObject.twitterImage ? ogObject.twitterImage : ogObject.twitterImageSrc; // deafult to twitterImageSrc
    ogObject.twitterImageWidth = ogObject.twitterImageWidth ? ogObject.twitterImageWidth : [null];
    ogObject.twitterImageHeight = ogObject.twitterImageHeight ? ogObject.twitterImageHeight : [null];
    ogObject.twitterImageAlt = ogObject.twitterImageAlt ? ogObject.twitterImageAlt : [null];
  }

  // format twitter images and limit to 10
  const twitterImages: TwitterImageObject[] = zip(
    ogObject.twitterImage,
    ogObject.twitterImageWidth,
    ogObject.twitterImageHeight,
    ogObject.twitterImageAlt,
  ).map(mediaMapperTwitterImage).filter((value, index) => index < 10).sort(mediaSorter);

  // sets twitter player/width/height/stream to null if one these exists
  if (ogObject.twitterPlayer
    || ogObject.twitterPlayerWidth
    || ogObject.twitterPlayerHeight
    || ogObject.twitterPlayerStream
  ) {
    ogObject.twitterPlayer = ogObject.twitterPlayer ? ogObject.twitterPlayer : [null];
    ogObject.twitterPlayerWidth = ogObject.twitterPlayerWidth ? ogObject.twitterPlayerWidth : [null];
    ogObject.twitterPlayerHeight = ogObject.twitterPlayerHeight ? ogObject.twitterPlayerHeight : [null];
    ogObject.twitterPlayerStream = ogObject.twitterPlayerStream ? ogObject.twitterPlayerStream : [null];
  }

  // format twitter player and limit to 10
  const twitterPlayers: TwitterPlayerObject[] = zip(
    ogObject.twitterPlayer,
    ogObject.twitterPlayerWidth,
    ogObject.twitterPlayerHeight,
    ogObject.twitterPlayerStream,
  ).map(mediaMapperTwitterPlayer)
    .filter((value, index) => index < 10)
    .sort(mediaSorter);

  // sets music song/songTrack/songDisc to null if one these exists
  if (ogObject.musicSong || ogObject.musicSongTrack || ogObject.musicSongDisc) {
    ogObject.musicSong = ogObject.musicSong ? ogObject.musicSong : [null];
    ogObject.musicSongTrack = ogObject.musicSongTrack ? ogObject.musicSongTrack : [null];
    ogObject.musicSongDisc = ogObject.musicSongDisc ? ogObject.musicSongDisc : [null];
  }

  // format music songs and limit to 10
  const musicSongs: MusicSongObject[] = zip(ogObject.musicSong, ogObject.musicSongTrack, ogObject.musicSongDisc)
    .map(mediaMapperMusicSong)
    .filter((value, index) => index < 10)
    .sort(mediaSorterMusicSong);

  // remove old values since everything will live under the main property
  fields.filter((item) => (item.multiple && item.fieldName && item.fieldName.match('(ogImage|ogVideo|twitter|musicSong).*')))
    .forEach((item) => {
      delete ogObject[item.fieldName];
    });

  if (options.allMedia) {
    if (ogImages.length) ogObject.ogImage = ogImages;
    if (ogVideos.length) ogObject.ogVideo = ogVideos;
    if (twitterImages.length) ogObject.twitterImage = twitterImages;
    if (twitterPlayers.length) ogObject.twitterPlayer = twitterPlayers;
    if (musicSongs.length) ogObject.musicSong = musicSongs;
  } else {
    if (ogImages.length) [ogObject.ogImage] = ogImages;
    if (ogVideos.length) [ogObject.ogVideo] = ogVideos;
    if (twitterImages.length) [ogObject.twitterImage] = twitterImages;
    if (twitterPlayers.length) [ogObject.twitterPlayer] = twitterPlayers;
    if (musicSongs.length) [ogObject.musicSong] = musicSongs;
  }

  return ogObject;
}

export default mediaSetup;
