const url = `https://api.cloudinary.com/v1_1/damuqqrxy/image/upload`

const uploadImage = async(image) => {
    const formData = new FormData()
    formData.append("file",image)
    formData.append("upload_preset","lockerroom_product")
    formData.append("format","webp")
    formData.append("quality","auto")
    formData.append("fetch_format","auto")


    const dataResponse = await fetch(url,{
        method : "post",
        body : formData
    })

    return dataResponse.json()
}

export const uploadOptimizedImage = async (image, options = {}) => {
    const {
        maxWidth = 1200,
        maxHeight = 1200,
        quality = 'auto',
        format = 'webp',
    } = options;

    const formData = new FormData();
    formData.append('file', image);
    formData.append('upload_preset', 'lockerroom_product');
    formData.append('format', format);
    formData.append('quality', quality);
    formData.append('fetch_format', 'auto');
    formData.append('transformation', JSON.stringify([
        { width: maxWidth, height: maxHeight, crop: 'limit' }
    ]));

    const response = await fetch(url, {
        method: 'POST',
        body: formData
    });

    return response.json();
};

export default uploadImage