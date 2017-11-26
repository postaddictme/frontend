var TwemojiInput = function (obj) {
    /* Declarative Part */

    var prefix = '_twemoji',
        size = 26,
        saveAsImg = false,

        list = document.createElement('ul'),
        listWrap = document.createElement('div'),
        popover = document.createElement('div'),
        wrapper = document.createElement('div'),
        customTextarea = document.createElement('div'),
        box = document.createElement('div'),
        footer = document.createElement('div');

    /* Descriptional Part */

    function wrap() {
        wrapper.className = prefix + '_wrap';
        box.className = prefix + '_box';
        popover.className = prefix + '_popover';
        listWrap.className = prefix + '_list_wrap';
        customTextarea.className = prefix + '_textarea';
        footer.className = prefix + '_footer';

        customTextarea.setAttribute('contenteditable', 'true');

        list.style.height = (Emoji.length / 10) * size + 'px';

        obj.parentNode.insertBefore(wrapper, obj);

        wrapper.appendChild(obj);
        wrapper.appendChild(customTextarea);
        wrapper.appendChild(box);
        wrapper.appendChild(popover);
        wrapper.appendChild(footer);
        popover.appendChild(listWrap);
        listWrap.appendChild(list);
    }

    function pasteHtmlAtCaret(html) {

        var sel, range;
        if (window.getSelection) {

            // IE9 and non-IE
            sel = window.getSelection();

            if (sel.getRangeAt && sel.rangeCount) {
                range = sel.getRangeAt(0);
                range.deleteContents();

                // Range.createContextualFragment() would be useful here but is
                // only relatively recently standardized and is not supported in
                // some browsers (IE9, for one)
                var el = document.createElement("div");
                el.innerHTML = html;
                var frag = document.createDocumentFragment(), node, lastNode;
                while ((node = el.firstChild)) {
                    lastNode = frag.appendChild(node);
                }
                range.insertNode(frag);

                // Preserve the selection
                if (lastNode) {
                    range = range.cloneRange();
                    range.setStartAfter(lastNode);
                    range.collapse(true);
                    sel.removeAllRanges();
                    sel.addRange(range);
                }
            }
        } else if (document.selection && document.selection.type != "Control") {
            // IE < 9
            document.selection.createRange().pasteHTML(html);
        }
    }

    function updateList(listSize) {
        var l = Emoji.length,
            w = popover.offsetWidth,
            h = popover.offsetHeight,
            listSize = listSize || 80,
            listLength = list.children.length;

        for (var i = listLength; i < listSize; i++) {
            var listItem = document.createElement('li'),
                parsedTwemoji = twemoji.parse(Emoji[i], {size: 72});

            list.appendChild(listItem);
            listItem.innerHTML = parsedTwemoji;

            /* Prevent loosing focus */
            $(listItem).bind('mousedown', function (e) {
                e.preventDefault();
            });
            listItem.onclick = function (e) {
                var alt = this.children[0].attributes['alt'].value;

                //insertAtCursor(customTextarea, twemoji.parse(alt, {size:72}));
                customTextarea.focus();

                pasteHtmlAtCaret(twemoji.parse(alt, {size: 72}));
                updTextarea();
            };
        }
    }


    var customScroll = function (content, options) {
        var wrap = document.createElement('div'),
            master = document.createElement('div'),
            slave = document.createElement('div'),
            scrollbar = document.createElement('div'),
            placeholder = document.createElement('div');

        wrap.className = 'scroll_wrap';
        master.className = 'scroll_master';
        slave.className = 'scroll_slave';
        scrollbar.className = 'scroll_bar';
        placeholder.className = 'scroll_placeholder';

        wrap.style.width = options ? options.width + 'px' : '150px';
        wrap.style.height = slave.style.height = options ? options.height + 'px' : '225px';
        master.style.height = options ? options.height + 20 + 'px' : '170px';

        /*
         width = 300px, while we do not use our own custom scroll bar
         slave.style.width = options ? options.width-20 +'px' : '130px';
         */

        slave.style.width = options ? options.width + 'px' : '130px';

        content.parentNode.insertBefore(wrap, content);
        wrap.appendChild(slave);
        wrap.appendChild(master);
        wrap.appendChild(scrollbar);
        slave.appendChild(content);
        master.appendChild(placeholder);

        scrollbar.style.height = (wrap.scrollHeight - 30) * (wrap.scrollHeight / slave.scrollHeight) + 'px';
        placeholder.style.height = (Emoji.length / 10) * size + 50 + 'px';//embarrassing hack

        function moveScroll() {
            var top = (wrap.scrollHeight - 38) * (master.scrollTop / master.scrollHeight);
            scrollbar.style.top = top + 'px';
        }

        master.onscroll = function (e) {
            moveScroll();
            slave.scrollTop = master.scrollTop;
            options.onscroll(master.scrollTop);
        };

        slave.onscroll = function () {
            master.scrollTop = slave.scrollTop;
            options.onscroll(slave.scrollTop);
        };

    };

    function init() {
        wrap();
        updateList();
        customTextarea.innerHTML = twemoji.parse(obj.value);
        var scrollList = new customScroll(list, {
            width: 300,
            height: 225,
            onscroll: function (scrollTop) {
                // Render emoji only when it needs
                // 5 rows and 5 cols = 25 items
                var listSize = (parseInt(scrollTop / size) * 10) + 120;
                updateList(listSize);
            }
        });
    }

    /* Application Part */
    function getContentEditableText(text) {
        var ce = $("<pre />").html(text);
        ce.find("br").replaceWith("\n");
        ce.find("img").replaceWith(function () {
            return this.alt;
        });

        return ce.text();
    }

    function updTextarea(e, customVal) {
        var val = customVal || customTextarea.innerHTML;
        val = getContentEditableText(val);
        obj.value = val;
        var characters = val.length;
        if (val.match(/#[\S]/g) == null) {
            var hashtags = 0;
        } else {
            //var hashtags = val.match(/(#\w+)/g).length;
            var hashtags = val.match(/#[\S]/g).length;
        }
        footer.innerHTML = "";

        if (characters <= 2000) {
            footer.innerHTML = '<i class="fa fa-font"></i>: ' + (2000 - characters);
        } else {
            footer.innerHTML = '<i class="fa fa-font"></i>: ' + '<span style="color: red;">' + (characters - 2000) + '</span>';
        }
        if (hashtags <= 30) {
            footer.innerHTML += '   <b>#</b>: ' + (30 - hashtags);
        } else {
            footer.innerHTML += '   <b>#</b>: ' + '<span style="color: red;">' + (hashtags - 30) + '</span>';
        }

    }

    function toggleBox() {
        var currentClass = wrapper.className;
        if (currentClass.match('__open', 'g')) {
            wrapper.className = currentClass.replace(/ __open/g, '');
            //AnimateRotate(-360);
            $('._twemoji_box').css('background-position', '0px -24px');
        } else {
            wrapper.className += ' __open';
            //AnimateRotate(180);
            $('._twemoji_box').css('background-position', 'center 0px');
        }
    }

    function closeBox() {
        var currentClass = wrapper.className;
        wrapper.className = currentClass.replace(/ __open/g, '');
        //AnimateRotate(-360);
        $('._twemoji_box').css('background-position', '0px -24px');
    }

    function openBox() {
        wrapper.className += ' __open';
        //AnimateRotate(180);
        $('._twemoji_box').css('background-position', 'center 0px');
    }

    function checkMouseFocus() {
        if ($(popover).is(":hover")) {
            // nothing
        } else {
            closeBox();
        }
    }

    //rotate smile box icon on click
    function AnimateRotate(d) {
        $({deg: 0}).animate({deg: d}, {
            step: function (now, fx) {
                $("._twemoji_box").css({
                    transform: "rotate(" + now + "deg)"
                });
            }
        });
    }

    function getSelectionTextInfo(el) {
        var atEnd = false;
        var selRange, testRange;
        if (window.getSelection) {
            var sel = window.getSelection();
            if (sel.rangeCount) {
                selRange = sel.getRangeAt(0);
                testRange = selRange.cloneRange();

                testRange.selectNodeContents(el);
                testRange.setStart(selRange.endContainer, selRange.endOffset);
                atEnd = (testRange.toString() == "");
            }
        } else if (document.selection && document.selection.type != "Control") {
            selRange = document.selection.createRange();
            testRange = selRange.duplicate();

            testRange.moveToElementText(el);
            testRange.setEndPoint("StartToEnd", selRange);
            atEnd = (testRange.text == "");
        }

        return atEnd;
    }

    customTextarea.onkeyup = updTextarea;
    customTextarea.onblur = updTextarea;
    customTextarea.onkeydown = (function (e) {
        // trap the return key being pressed
        if (e.keyCode === 13) {
            // Check if there is some text after cursor
            var atEnd = getSelectionTextInfo(this);
            // insert 2 br tags (if only one br tag is inserted the cursor won't go to the next line)
            if (atEnd) {
                document.execCommand('insertHTML', false, '<br><br>');
            } else {
                document.execCommand('insertHTML', false, '<br>');
            }

            // prevent the default behaviour of return key pressed
            return false;
        }
    });


    $(box).bind('mouseenter', function (e) {
        openBox();
    });
    $(box).bind('mouseleave', function (e) {
        setTimeout(checkMouseFocus, 300);
    });
    $(popover).bind('mouseleave', function (e) {
        closeBox();
    });

    document.onclick = function (e) {
        if (e.target != box && e.target != wrap && e.target != list && !e.ctrlKey) {
            //wrapper.className = wrapper.className.replace(/ __open/g,'');
        }
    };

    init();
    updTextarea(customTextarea);

    return customTextarea;
};
