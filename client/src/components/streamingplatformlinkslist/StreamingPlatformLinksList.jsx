import React from 'react';
import './streamingplatformlinkslist.css';

import { GetPlatformIcon, GetPlatformNameString } from '../../utils/HyperlinkUtils';

const StreamingPlatformLinksList = ({streamingPlatformsLinks}) => {

    return (
        <div className='fto__page__track--streaming_platform_items'>
            {streamingPlatformsLinks.map((streamPlatformInfo, it) => {
                return (
                    <a className='fto__page__track--streaming_platform_item' target="_blank" rel="noopener noreferrer" key={it} href={streamPlatformInfo.link_url}>
                        <img src={ GetPlatformIcon(streamPlatformInfo.platform_type) } alt='platform_icon'/>
                        <div className='fto__page__track--streaming_platform_item_right'> 
                            <p>{ GetPlatformNameString(streamPlatformInfo.platform_type) }</p>
                            <h5 className='fto__page__track--streaming_platform_item-subheader subheader_color'>
                                {streamPlatformInfo.link_url}
                            </h5>
                        </div>
                    </a>
                )}
            )}
        </div>
    )
}

export default StreamingPlatformLinksList