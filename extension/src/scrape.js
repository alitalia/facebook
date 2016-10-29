import { getTimeISO8601, normalizeUrl } from './utils';

const SCRAPERS = {
    'feed': scrapePost,
    'sponsored': scrapePost
};

export function scrape (elem) {
    const postType = identify(elem);

    return SCRAPERS[postType](postType, elem);
}

export function identify (elem) {
    if (elem.find('.uiStreamSponsoredLink').length === 1) {
        return 'sponsored';
    } else {
        return 'feed';
    }
}

export function scrapePost (postType, elem) {
    // Skip if the post is not top level
    if (elem.parents('.userContentWrapper').length) {
        return null;
    }

    // This is a bit rude... :/
    var fromProfile, isPublic;
    try {
        fromProfile = elem.find('[data-hovercard^="/ajax/hovercard/"]')
                          .attr('href')
                          .split('?')[0];

        isPublic = elem.find('[data-hover="tooltip"][role][aria-label][data-tooltip-content]')
                       .attr('aria-label')
                       .split(':')
                       .pop()
                       .trim() === 'Public';
    } catch (e) {
        console.log("note: Public not found");
        return null;
    }

    return {
        type: 'impression',
        visibility: isPublic ? 'public' : 'private',
        fromProfile: fromProfile,
        /* API to be expanded, this is home some client side parser can
         * get delegated and reported */
        metadata: isPublic ? {
          'postType': postType,
          'timestamp': elem.find('.fsm abbr').attr('data-utime'),
          'postLink': normalizeUrl(elem.find('.fsm a').attr('href'))
            /* TODO author info + promoted Href */
        } : null,
        impressionTime: getTimeISO8601()
    };
}

export function scrapeUserData (elem) {
    const info = elem.find('.fbxWelcomeBoxName');
    const parsedInfo = {
        // even if the id is a number, I feel more comfortable to cast it to a String
        id: String(JSON.parse(info.attr('data-gt')).bmid),
        href: info.attr('href').split('?')[0]
    };

    return parsedInfo;
}