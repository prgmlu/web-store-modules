export default function fetchSVGStringAsync(url) {
    return new Promise((resolve, reject) => {
        fetch(url)
            .then((response) => {
                if (response.status === 200) {
                    return response.text();
                }
                throw new Error('svg load error!');
            })
            .then((svgString) => {
                resolve(svgString);
            })
            .catch((error) => reject(error));
    });
}
