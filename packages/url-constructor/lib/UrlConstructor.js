const UrlOriginEnum = Object.freeze({
    S3: 's3',
    External: 'external',
    CDN: 'cdn',
    NON_SECURED_CDN: 'httpcdn',
});
const OriginUrlPrefixDict = {
    [UrlOriginEnum.S3]: 'https://s3.amazonaws.com/',
    [UrlOriginEnum.CDN]: 'https://cdn.obsess-vr.com/',
    [UrlOriginEnum.NON_SECURED_CDN]: 'http://cdn.obsess-vr.com/', // * IMPORTANT: this exists because og:image (for facebook) can't validate https links.
};

export function constructUrl(urlObject, s3Bucket, isHttps = true) {
    if (!urlObject || !urlObject.origin || !urlObject.path) {
        const errorMessage = 'Cannot construct url from invalid input';
        throw new Error(errorMessage);
    }
    const { origin } = urlObject;
    const { path } = urlObject;
    if (typeof origin !== 'string' || typeof path !== 'string') {
        const errorMessage = 'Cannot construct url from invalid input';
        throw new Error(errorMessage);
    }

    let url = '';

    switch (origin) {
        case UrlOriginEnum.S3:
            url = `${OriginUrlPrefixDict[UrlOriginEnum.S3] + s3Bucket}/${s3Bucket}/${path}`;
            break;
        case UrlOriginEnum.CDN:
            url = `${(isHttps ? OriginUrlPrefixDict[UrlOriginEnum.CDN] : OriginUrlPrefixDict[UrlOriginEnum.NON_SECURED_CDN]) + s3Bucket}/${path}`;
            break;
        case UrlOriginEnum.External:
            url = path;
            break;
        default:
            url = path;
            break;
    }
    return url;
}

export class UrlConstructor {
    constructor(s3Bucket) {
        this.s3Bucket = s3Bucket;
    }

    constructUrl(urlObject) {
        constructUrl(urlObject, this.s3Bucket);
    }
}
