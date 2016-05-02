define(['app', 'jquery', 'lodash'], function(app, $, _) { 'use strict';

    var inlineTextClasses = [
        'text-lowercase',
        'text-uppercase',
        'text-capitalize',
        'text-muted',
        'text-primary',
        'text-success',
        'text-info',
        'text-warning',
        'text-danger',
        'small',
    ];

    var blockTextClasses = inlineTextClasses.concat([
        'text-left',
        'text-center',
        'text-right',
        'text-justify',
        'text-nowrap'
    ]);

    var blockTextStyles = {
        'text-align' : ['left', 'right', 'center', 'justify']
    };

    var whitelist = {
        div      : { class : blockTextClasses, style : blockTextStyles, align : ['left', 'right', 'center', 'justify'] },
        p        : { class : blockTextClasses, style : blockTextStyles, align : ['left', 'right', 'center', 'justify'] },
        h1       : { class : blockTextClasses, style : blockTextStyles, align : ['left', 'right', 'center', 'justify'] },
        h2       : { class : blockTextClasses, style : blockTextStyles, align : ['left', 'right', 'center', 'justify'] },
        h3       : { class : blockTextClasses, style : blockTextStyles, align : ['left', 'right', 'center', 'justify'] },
        h4       : { class : blockTextClasses, style : blockTextStyles, align : ['left', 'right', 'center', 'justify'] },
        h5       : { class : blockTextClasses, style : blockTextStyles, align : ['left', 'right', 'center', 'justify'] },
        br       : { },
        a        : { class : inlineTextClasses, href : [] },// style : [] },
        span     : { class : inlineTextClasses },// style : [] },
        b        : { class : inlineTextClasses }, //bold
        strong   : { class : inlineTextClasses }, //bold
        i        : { class : inlineTextClasses }, // italic
        em       : { class : inlineTextClasses }, // italic
        u        : { class : inlineTextClasses }, // Underline
        s        : { class : inlineTextClasses }, //Strikethrough
        strike   : { class : inlineTextClasses }, //Strikethrough
        ins      : { class : inlineTextClasses }, //Inserted text
        del      : { class : inlineTextClasses }, //Delted text
        mark     : { class : inlineTextClasses }, // Marked text
        small    : { class : inlineTextClasses }, // Small text
        sup      : { class : inlineTextClasses }, // superscripts
        sub      : { class : inlineTextClasses }, // subscripts
        pre      : { },
        ol       : { },
        ul       : { },
        li       : { class : inlineTextClasses },
    };

    app.filter('sanitizeHtml', [function() {

        return function(unsafeHtml) {

            var virtualDom = $('<div>');

            virtualDom.html(unsafeHtml);

            var elements = virtualDom.find('*').toArray();

            elements.forEach(function(element) {

                var tagInfo = whitelist[element.tagName.toLowerCase()];

                if(!tagInfo) {
                    element.remove();
                    return;
                }

                var attributes = []; // clone attributes NamedNodeMap to array;

                for(var i=0; i<element.attributes.length;++i)
                    attributes[i] = element.attributes[i];

                attributes.forEach(function(attr){

                    var attrInfo = tagInfo[attr.name.toLowerCase()];

                    if(!attrInfo) {
                        $(element).removeAttr(attr.name);
                        return;
                    }

                    if(attr.name.toLowerCase()=='style') {

                        var styles = [];

                        for(var i=0; i<element.style.length;++i)
                            styles[i] = element.style[i];

                        styles.forEach(function(style){
                            var styleInfo = attrInfo[style.toLowerCase()] || [];
                            element.style[style] = _.intersection([element.style[style]], styleInfo).join(' ') || null;
                        });
                    }
                    else {
                        if(attrInfo.length) {
                            attr.value = _.intersection((attr.value||'').split(' '), attrInfo);
                        }
                    }
                });
            });

            return virtualDom.html();
        };
    }]);

    app.filter('safeHtml', ["$sce", function($sce) {
        return function(sanitizedHtml) {
            return $sce.trustAsHtml(sanitizedHtml);
        };
    }]);

});
