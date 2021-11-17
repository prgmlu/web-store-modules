import React, { Component } from 'react';
import { BackgroundLODs } from 'three-background';
import { ThreeJSWorldContext } from './ThreeJSWorldContext';
import TiledSceneBackground from '../../lib/TiledSceneBackground';

class RoomTiledBackground extends Component {
    constructor(props) {
        super(props);
        this.onLOD0Loaded = this.onLOD0Loaded.bind(this);
        this.onLOD1Loaded = this.onLOD1Loaded.bind(this);
        this.onLOD2Loaded = this.onLOD2Loaded.bind(this);
        this.onLOD3Loaded = this.onLOD3Loaded.bind(this);

        this.state = {
            leftImageUrls: null,
            rightImageUrls: null,
            topImageUrls: null,
            bottomImageUrls: null,
            backImageUrls: null,
            frontImageUrls: null,
        };
    }

    componentDidMount() {
        const s3_bucket_base = 'https://s3.amazonaws.com/obsess-test-image';
        // https://s3.amazonaws.com/obsess-test-image/2k/2k_back_0_0.jpg
        function makeImageUrls(face, tilePerRow, tilePerColumn, lodPrefix) {
            const urls = [];
            for (let i = 0; i < tilePerRow * tilePerColumn; i++) {
                const row = Math.floor(i / tilePerColumn);
                const column = i % tilePerRow;
                const url = `${s3_bucket_base}/${lodPrefix}/${lodPrefix}_${face}_${row}_${column}.jpg`;
                urls.push(url);
            }
            return urls;
        }

        const leftUrlsLOD2 = makeImageUrls('left', 4, 4, '2k');
        const rightUrlsLOD2 = makeImageUrls('right', 4, 4, '2k');
        const topUrlsLOD2 = makeImageUrls('top', 4, 4, '2k');
        const bottomUrlsLOD2 = makeImageUrls('bottom', 4, 4, '2k');
        const backUrlsLOD2 = makeImageUrls('back', 4, 4, '2k');
        const frontUrlsLOD2 = makeImageUrls('front', 4, 4, '2k');

        const leftUrlsLOD3 = makeImageUrls('left', 8, 8, '4k');
        const rightUrlsLOD3 = makeImageUrls('right', 8, 8, '4k');
        const topUrlsLOD3 = makeImageUrls('top', 8, 8, '4k');
        const bottomUrlsLOD3 = makeImageUrls('bottom', 8, 8, '4k');
        const backUrlsLOD3 = makeImageUrls('back', 8, 8, '4k');
        const frontUrlsLOD3 = makeImageUrls('front', 8, 8, '4k');

        const leftImageUrls = {
            [BackgroundLODs.LOD0]: leftUrlsLOD2.slice(0, 1),
            [BackgroundLODs.LOD1]: leftUrlsLOD2.slice(0, 4),
            [BackgroundLODs.LOD2]: leftUrlsLOD2,
            [BackgroundLODs.LOD3]: leftUrlsLOD3,
        };
        const rightImageUrls = {
            [BackgroundLODs.LOD0]: rightUrlsLOD2.slice(0, 1),
            [BackgroundLODs.LOD1]: rightUrlsLOD2.slice(0, 4),
            [BackgroundLODs.LOD2]: rightUrlsLOD2,
            [BackgroundLODs.LOD3]: rightUrlsLOD3,
        };
        const topImageUrls = {
            [BackgroundLODs.LOD0]: topUrlsLOD2.slice(0, 1),
            [BackgroundLODs.LOD1]: topUrlsLOD2.slice(0, 4),
            [BackgroundLODs.LOD2]: topUrlsLOD2,
            [BackgroundLODs.LOD3]: topUrlsLOD3,
        };
        const bottomImageUrls = {
            [BackgroundLODs.LOD0]: bottomUrlsLOD2.slice(0, 1),
            [BackgroundLODs.LOD1]: bottomUrlsLOD2.slice(0, 4),
            [BackgroundLODs.LOD2]: bottomUrlsLOD2,
            [BackgroundLODs.LOD3]: bottomUrlsLOD3,
        };
        const backImageUrls = {
            [BackgroundLODs.LOD0]: backUrlsLOD2.slice(0, 1),
            [BackgroundLODs.LOD1]: backUrlsLOD2.slice(0, 4),
            [BackgroundLODs.LOD2]: backUrlsLOD2,
            [BackgroundLODs.LOD3]: backUrlsLOD3,
        };
        const frontImageUrls = {
            [BackgroundLODs.LOD0]: frontUrlsLOD2.slice(0, 1),
            [BackgroundLODs.LOD1]: frontUrlsLOD2.slice(0, 4),
            [BackgroundLODs.LOD2]: frontUrlsLOD2,
            [BackgroundLODs.LOD3]: frontUrlsLOD3,
        };

        this.setState({
            leftImageUrls,
            rightImageUrls,
            topImageUrls,
            bottomImageUrls,
            backImageUrls,
            frontImageUrls,
        });
    }

    onLOD0Loaded() {
        console.log('background is ready for lod0!'); // eslint-disable-line no-console
    }

    onLOD1Loaded() {
        console.log('background is ready for lod1!'); // eslint-disable-line no-console
    }

    onLOD2Loaded() {
        console.log('background is ready for lod2!'); // eslint-disable-line no-console
    }

    onLOD3Loaded() {
        console.log('background is ready for lod3!'); // eslint-disable-line no-console
    }

    render() {
        const { threeJSWorldContext } = this.props;
        const {
            leftImageUrls,
            rightImageUrls,
            topImageUrls,
            bottomImageUrls,
            backImageUrls,
            frontImageUrls,
        } = this.state;
        if (!leftImageUrls || !rightImageUrls || !topImageUrls || !bottomImageUrls || !backImageUrls || !frontImageUrls) {
            return <></>;
        }
        return (
            <TiledSceneBackground
                threeJSWorldContext={threeJSWorldContext}
                leftImageUrls={leftImageUrls}
                rightImageUrls={rightImageUrls}
                topImageUrls={topImageUrls}
                bottomImageUrls={bottomImageUrls}
                backImageUrls={backImageUrls}
                frontImageUrls={frontImageUrls}
                onLOD0Loaded={this.onLOD0Loaded}
                onLOD1Loaded={this.onLOD1Loaded}
                onLOD2Loaded={this.onLOD2Loaded}
                onLOD3Loaded={this.onLOD3Loaded}
                initStoreScene={() => {}}
            />
        );
    }
}

export default (props) => (
    <ThreeJSWorldContext.Consumer>
        {(threeJSWorldContextValue) => (
            <RoomTiledBackground
                {...props}
                threeJSWorldContext={threeJSWorldContextValue}
            />
        )}
    </ThreeJSWorldContext.Consumer>
);
