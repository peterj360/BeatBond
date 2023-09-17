import * as mm from 'music-metadata';

const getMimeType = (extension) => {
    switch (extension) {
      case 'mp3':
        return 'audio/mpeg';
      case 'wav':
        return 'audio/wav';
      case 'aac':
        return 'audio/aac';
      case 'm4a':
        return 'audio/mp4';
      default:
        throw new Error('Unsupported audio format');
    }
}

const getAudioDuration = async (fileBuffer, fileExtension) => {
  try {
    const mimeType = getMimeType(fileExtension); 

    const metadata = await mm.parseBuffer(fileBuffer, mimeType, { duration: true });
    
    return metadata.format.duration;
  } catch (error) {
    console.error('Error in getAudioDuration:', error);
    throw error;
  }
}

export default getAudioDuration;