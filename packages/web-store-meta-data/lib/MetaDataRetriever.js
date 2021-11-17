import { constructUrl } from 'url-constructor';

export function getUrlSlugAndMetaDataFromStoreData(storeData, s3Bucket) {
    const { url_slug } = storeData;
    const generalData = storeData.general;
    if (!generalData) {
        throw new Error('general field not found in storeData', storeData);
    }
    const metaTitle = generalData.page_title;
    const metaDescription = generalData.description;
    const ogImageObject = generalData.og_image;
    const { name } = storeData;
    const ogImage = ogImageObject ? constructUrl(ogImageObject, s3Bucket, false) : null;
    const ogImageSecureUrl = ogImageObject ? constructUrl(ogImageObject, s3Bucket, true) : null;

    return {
        urlSlug: url_slug,
        metaTitle,
        metaDescription,
        ogImage,
        ogImageSecureUrl,
        name,
    };
}
