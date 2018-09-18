import imageCompression from 'browser-image-compression';
import ImageCompressor from 'image-compressor.js';
export const MAX_IMAGE_SIZE = 1;
export const MAX_IMAGE_DIM = 750;
export const IMAGE_TYPES = ["image/gif", "image/jpeg", "image/png"];

class PictureHelper {
    async compressImage(file) {
        const imageFile = file;
        const imageCompressor = new ImageCompressor();
        const options = {
            maxHeight: MAX_IMAGE_DIM,
            maxWidth: MAX_IMAGE_DIM,
            convertSize: 1000000,
            checkOrientation: true,
            success(result) {
                console.log('Upload success');
            },
            error(e) {
                console.log(e.message);
            },
        };
        const compressedFile = await imageCompressor.compress(imageFile,options)
        .then((resultFile) => {
            // Handle the compressed image file.
            return resultFile;
        })
        .catch((err) => {
            // Handle the error
            throw new Error('File is too large to compress and upload.');
        })
        return compressedFile;
    }

    validateImageType(file) {
        let fileType = file['type'];
        return IMAGE_TYPES.includes(fileType);
    }

    validateImageSize(file) {
        return (file.size /1024 / 1024 <= MAX_IMAGE_SIZE);
    }
}

export default new PictureHelper()