iD.ui.TagEditor = function() {
    var event = d3.dispatch('changeTags', 'choose', 'close', 'change', 'message'),
        taginfo = iD.taginfo(),
        presetData = iD.presetData(),
        inspectorbody,
        entity,
        tags,
        presetMatch,
        presetUI,
        presetGrid,
        tagList,
        context;

    function tageditor(selection, tagview, preset) {

        entity = selection.datum();

        if (preset) {
            tags = _.omit(tags, _.keys(presetMatch.match.tags));
        }

        presetMatch = preset || presetData.matchTags(entity);

        selection.html('');

        var editorwrap = selection.append('div')
            .attr('class', 'inspector-inner tag-wrap fillL2');

        var typewrap = editorwrap.append('div')
            .attr('class', 'type inspector-inner fillL')
            .on('click', function() {
                event.choose();
            });

        typewrap.append('h4')
            .text('Type');

        typewrap.append('img')
            .attr('class', 'preset-icon')
            .attr('src', presetMatch ? '/presets/maki/' + presetMatch.icon : '');

        var typelabel = typewrap.append('div')
            .attr('class', 'preset-label-wrap');

        typelabel.append('h3')
            .attr('class', 'preset-name')
            .text(presetMatch ? presetMatch.name : '');

        typelabel.append('span')
            .attr('class', 'preset-geometry')
            .text(entity.geometry(context.graph()));

        typewrap.append('div')
            .attr('class', 'info fillD');

        var namewrap = editorwrap.append('div')
                .attr('class', 'head inspector-inner fillL'),
            namelabel = namewrap.append('h4')
                .text('Name'),
            h2 = namewrap.append('h2');

        h2.append('div')
            .attr('class', 'info fillD');

        var name = h2.append('input')
            .attr('placeholder', 'name')
            .property('value', function() {
                return entity.tags.name || '';
            })
            .on('keyup', function() {
                var tags = tageditor.tags();
                tags.name = this.value;
                tageditor.tags(tags);
                event.change();
            });

        event.on('change.name', function() {
            var tags = tageditor.tags();
            name.property('value', tags.name);
        });


        presetUI = iD.ui.preset()
            .on('change', function(tags) {
                event.change();
            });

        tagList = iD.ui.Taglist()
            .context(context)
            .on('change', function(tags) {
                event.change();
            });

        var tageditorpreset = editorwrap.append('div')
            .attr('class', 'inspector-preset cf');

        if (presetMatch && !tagview) {
            tageditorpreset.call(presetUI
                    .preset(presetMatch));
        }

        event.message('Edit ' + (presetMatch && presetMatch.name || ''));

        var taglistwrap = editorwrap.append('div').call(tagList);

        tageditor.tags(tags);
    }

    function drawHead(selection) {
        var entity = selection.datum();

        var h2 = selection.append('h2');

        h2.append('span')
            .attr('class', 'icon big icon-pre-text big-' + entity.geometry(context.graph()));

        h2.append('span')
            .text(entity.friendlyName());
    }

    tageditor.tags = function(newtags) {
        if (!arguments.length) {
            return _.extend(presetUI.tags(), tagList.tags());
        } else {
            tags = newtags;
            if (presetUI && tagList) {
                presetUI.change(tags);
                tagList.tags(_.omit(tags, _.keys(presetUI.tags() || {})));
            }
            return tageditor;
        }
    };

    tageditor.presetData = function(_) {
        presetData = _;
        return tageditor;
    };

    tageditor.context = function(_) {
        context = _;
        return tageditor;
    };

    return d3.rebind(tageditor, event, 'on');
};
