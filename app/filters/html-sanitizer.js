define(['app', 'jquery'], function(app, $) { 'use strict';

    var whitelist = {
        div  : { class : [], style : [] },
        span : { class : [], style : [] },
        h1   : { },
        h2   : { },
        h3   : { },
        h4   : { },
        h5   : { },
        p    : { class : [], style : [] },
        br   : { },
        b    : { },
        i    : { },
        u    : { },
        pre  : { },
        ol   : { },
        ul   : { },
        li   : { },
        sup  : { },
        sub  : { },
    };

    app.filter('sanitizeHtml', ["$sce", function($sce) {

        return function(unsafeHtml) {

            var virtualDom = $('<div>');

            virtualDom.html(unsafeHtml);

            virtualDom.find('*').each(function(i, elem) {

                var tagInfo = whitelist[elem.tagName.toLowerCase()];

                if(!tagInfo) {
                    elem.remove();
                    return;
                }

                $.each(elem.attributes, function(i, attr){

                    var attrInfo = tagInfo[attr.name.toLowerCase()];

                    if(!attrInfo) {
                        $(elem).removeAttr(attr.name);
                    }
                    // Todo enable value whitelist;
                });
            });

            return $sce.trustAsHtml(virtualDom.html());
        };
    }]);
});
