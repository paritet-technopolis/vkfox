define(['jtoh'], function (jtoh) {
    return [
        {className: 'navbar navbar-static-top', innerHTML: {className: 'navbar-inner', innerHTML: {
            tagName: 'form',
            className: 'navbar-form',
            innerHTML: [
                {tagName: 'input', attributes: {
                    type: 'text',
                    placeholder: 'Search...',
                    class: 'search-form span2 typeahead'
                }},
                {
                    className: 'btn-group pull-right',
                    attributes: {'data-toggle': 'buttons-checkbox'},
                    innerHTML: [
                        // {tagName: 'button', attributes: {type: 'button'}, className: 'btn', innerHTML: '&#9794;'},
                        // {tagName: 'button', attributes: {type: 'button'}, className: 'btn', innerHTML: '&#9792;'},
                        // {tagName: 'button', attributes: {type: 'button'}, className: 'btn', innerHTML: '1'},
                        {
                            tagName: 'button',
                            className: 'btn dropdown-toggle',
                            attributes: {'data-toggle': 'dropdown', type: 'button'},
                            innerHTML: [
                                {tagName: 'i', className: 'icon-align-justify'}, ' ',
                                {className: 'caret'}
                            ]
                        },
                        {
                            tagName: 'ul',
                            className: 'dropdown-menu',
                            innerHTML: [
                                {tagName: 'li', innerHTML: {
                                    tagName: 'label',
                                    className: 'checkbox',
                                    innerHTML: 'zzz'
                                }}
                            ]
                        }
                    ]
                }
            ]
        }}},
        {className: 'items'}
    ];
});