/* eslint prefer-arrow-callback: 0 */
/* eslint func-names: 0 */
/* eslint object-shorthand: 0 */

define(['css!./css/aside.css'], function () {
    'use strict';
    return {
        getView: function (bannerContext) {
            const div = document.createElement('div');
            div.setAttribute('class', 'banner');
            div.innerText = '';
            setTimeout(() => {
                bannerContext
                    .getService('examples.shop.resources:banners')
                    .then((service) => {
                        service.getBanner(banner => {
                            div.innerText = banner.name;
                            div.setAttribute('style',
                                'background-color:' + banner.color
                                + '; border: 1px solid #ccc;');
                        });
                    })
                    .catch(e => console.error(e));
            }, 2000);
            return div;
        }
    };
});
