/*
 * The MIT License (MIT)
 *
 * Copyright (c) 2014 Leinardo Smith
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 * 
 */


/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global define, brackets, $, CodeMirror, window */

/**
 * An inline editor for displaying and editing css shorthand properties in longhand format.
 */

define(function (require, exports, module) {
    "use strict";
    
    // Load dependent modules
    var CommandManager      = brackets.getModule("command/CommandManager"),
        Commands            = brackets.getModule("command/Commands"),
        DocumentManager     = brackets.getModule("document/DocumentManager"),
        DocumentModule      = brackets.getModule("document/Document"),
        Editor              = brackets.getModule("editor/Editor").Editor,
        FileSystem          = brackets.getModule("filesystem/FileSystem"),
        InlineWidget        = brackets.getModule("editor/InlineWidget").InlineWidget,
        InMemoryFile        = brackets.getModule("document/InMemoryFile"),
        _                   = brackets.getModule("thirdparty/lodash");
    
    var ShorthandManager    = require("ShorthandManager");

    var shorthandEditorTemplate    = require("text!shorthand-editor-template.html");

    /**
     * @constructor
     * @param {CSSinfo} cssInfo The provider for this shorthand property
     * @param {string} text The shorthand declaration
     * @extends {InlineWidget}
     */
    function InlineShorthandEditor(match) {
        var self = this;

        InlineWidget.call(this);

        this.shorthandText = match[0];
        this.propName = match[1];
        this.provider = ShorthandManager.getProviderForProperty(match[1]);

        $(DocumentManager).on("dirtyFlagChange", function (event, doc) {
            if (doc === self.doc) {
                // Force dirty flag false so doc is not shown in Working Set.
                doc.isDirty = false;
            }
        });
    }
    
    InlineShorthandEditor.prototype = Object.create(InlineWidget.prototype);
    InlineShorthandEditor.prototype.constructor = InlineShorthandEditor;
    InlineShorthandEditor.prototype.parentClass = InlineWidget.prototype;
    
    InlineShorthandEditor.prototype.provider = null;
    InlineShorthandEditor.prototype.text = null;
    InlineShorthandEditor.prototype.doc = null;
    InlineShorthandEditor.prototype.editor = null;
    InlineShorthandEditor.prototype.startBookmark = null;
    InlineShorthandEditor.prototype.endBookmark = null;
    InlineShorthandEditor.prototype.$header = null;
    InlineShorthandEditor.prototype.$editorHolder = null;
    
    /** 
     * @override
     * @param {!Editor} hostEditor  Outer Editor instance that inline editor will sit within.
     */
    InlineShorthandEditor.prototype.load = function (hostEditor, startBookmark, endBookmark, tree) {
        InlineShorthandEditor.prototype.parentClass.load.apply(this, arguments);
        
        // FUTURE: when we migrate to CodeMirror v3, we might be able to use markText()
        // instead of two bookmarks to track the range. (In our current old version of
        // CodeMirror v2, markText() isn't robust enough for this case.)
        this.startBookmark = startBookmark;
        this.endBookmark   = endBookmark;
        
        // We don't create the actual editor here--that will happen the first time
        // setInlineContent() is called.
        this.$htmlContent.addClass("inline-shorthand-editor");
        $(shorthandEditorTemplate).appendTo(this.$htmlContent);
        this.$header = $(".inline-editor-header", this.$htmlContent);
        this.$editorHolder = $(".inline-editor-holder", this.$htmlContent);
        
        this._done = this._done.bind(this);
        this.$btnDone = this.$htmlContent.find(".btn-shorthand-done")
            .click(this._done);
        
        this._cancel = this._cancel.bind(this);
        this.$btnCancel = this.$htmlContent.find(".btn-shorthand-cancel")
            .click(this._cancel);
        
        var self = this;
        
        // Convert shorthand declaration to longhand declaration list
        if (this.provider) {
            this.longhandText = ShorthandManager.unparseDeclarationList(
                this.provider.convertShorthandToLonghand(tree.rules[0])
            );
        }

        // Create an in-memory document with longhand text
        var filename = "temp-longhand.css",
            file = new InMemoryFile(filename, FileSystem);
        
        this.doc = new DocumentModule.Document(file, (new Date()), this.longhandText);

        var inlineContent = this.$editorHolder.get(0);
        
        // Create editor
        this.editor = new Editor(this.doc, true, inlineContent);

// TODO - Undo is not working (Redo, Cut, Copy, Paste, ...)

        // Always update the widget height when an inline editor completes a
        // display update
        $(this.editor).on("update", function (event, editor) {
            self.sizeInlineWidgetToContents(true);
        });

        // Size editor to content whenever text changes (via edits here or any
        // other view of the doc: Editor fires "change" any time its text
        // changes, regardless of origin)
        $(this.editor).on("change", function (event, editor) {
            if (self.hostEditor.isFullyVisible()) {
                self.sizeInlineWidgetToContents(true);
            }
        });

        // Prevent touch scroll events from bubbling up to the parent editor.
        this.$editorHolder.on("mousewheel.InlineShorthandEditor", function (e) {
            e.stopPropagation();
        });

        // Listen for clicks directly on us, so we can set focus back to the editor
        var clickHandler = this._onClick.bind(this);
        this.$htmlContent.on("click.InlineShorthandEditor", clickHandler);

        // Also handle mouseup in case the user drags a little bit
        this.$htmlContent.on("mouseup.InlineShorthandEditor", clickHandler);
    };
    
    /**
     * @override
     */
    InlineShorthandEditor.prototype.onAdded = function () {
        var self = this;
        
        // Call super
        InlineShorthandEditor.prototype.parentClass.onAdded.apply(this, arguments);

        if (this.editor) {
            this.editor.refresh();
        }

        // Update display of inline editors when the hostEditor signals a redraw
        CodeMirror.on(this.info, "redraw", function () {
            // At the point where we get the redraw, CodeMirror might not yet have actually
            // re-added the widget to the DOM. This is filed as https://github.com/marijnh/CodeMirror/issues/1226.
            // For now, we can work around it by doing the refresh on a setTimeout().
            window.setTimeout(function () {
                if (self.editor) {
                    self.editor.refresh();
                }
            }, 0);
        });
        
        if (this.editor) {
            this.editor.focus();
        }
    };

    /**
     * Called any time inline is closed, whether manually (via closeThisInline()) or automatically
     */
    InlineShorthandEditor.prototype.onClosed = function () {
        // Superclass onClosed() destroys editor
        InlineShorthandEditor.prototype.parentClass.onClosed.apply(this, arguments);
        
        if (this.startBookmark) {
            this.startBookmark.clear();
            this.startBookmark = null;
        }
        if (this.endBookmark) {
            this.endBookmark.clear();
            this.endBookmark = null;
        }
        
        // de-ref the Document
        this.doc = null;
        this.shorthandText = null;
        this.longhandText = null;
        this.provider = null;
        this.propName = null;

        // Remove event handlers
        this.$htmlContent.off(".InlineShorthandEditor");
        this.$editorHolder.off(".InlineShorthandEditor");

        // Return focus to main editor
        this.hostEditor.focus();
    };
    
    /**
     * propagate changes back to main doc
     */
    InlineShorthandEditor.prototype._done = function (event) {
        var newText = this.doc.getText(),
            start   = this.startBookmark.find(),
            end     = this.endBookmark.find();
        
        if (newText !== this.longhandText && start && end && this.provider) {
            var self = this;

            ShorthandManager.parseDeclarationList(newText)
                .done(function (declList) {
                    var shorthandText = ShorthandManager.unparseDeclarationList(
                        [ self.provider.convertLonghandToShorthand(declList.rules) ]
                    );

                    self.hostEditor.document.replaceRange(shorthandText, start, end);
                });
        }

        this.close();
    };
    
    /**
     * 
     */
    InlineShorthandEditor.prototype._cancel = function (event) {
        this.close();
    };
    
    /**
     * Prevent clicks in the dead areas of the inlineWidget from changing the focus and
     * insertion point in the editor. This is done by detecting clicks in the inlineWidget
     * that are not inside the editor and restoring focus and the insertion point.
     */
    InlineShorthandEditor.prototype._onClick = function (event) {
        if (!this.editor) {
            return;
        }
        
        var childEditor = this.editor,
            editorRoot = childEditor.getRootElement(),
            editorPos = $(editorRoot).offset();
        
        function containsClick($parent) {
            return $parent.find(event.target) > 0 || $parent[0] === event.target;
        }
        
        // Ignore clicks in editor and clicks on filename link
        // Check clicks on filename link in the context of the current inline widget.
        if (!containsClick($(editorRoot)) && !containsClick($(".filename", this.$htmlContent))) {
            childEditor.focus();

            if (event.pageY < editorPos.top) {
                childEditor.setCursorPos(0, 0);
            } else if (event.pageY > editorPos.top + $(editorRoot).height()) {
                var lastLine = childEditor.getLastVisibleLine();
                childEditor.setCursorPos(lastLine, childEditor.document.getLine(lastLine).length);
            }
        }
    };
    
    /**
     * Based on the position of the cursor in the inline editor, determine whether we need to change the
     * vertical scroll position of the host editor to ensure that the cursor is visible.
     */
    InlineShorthandEditor.prototype._ensureCursorVisible = function () {
        if (!this.editor) {
            return;
        }
        
        if ($.contains(this.editor.getRootElement(), window.document.activeElement)) {
            var hostScrollPos = this.hostEditor.getScrollPos(),
                cursorCoords = this.editor._codeMirror.cursorCoords();
            
            // Vertically, we want to set the scroll position relative to the overall host editor, not
            // the lineSpace of the widget itself. We don't want to modify the horizontal scroll position.
            var scrollerTop = this.hostEditor.getVirtualScrollAreaTop();
            this.hostEditor._codeMirror.scrollIntoView({
                left: hostScrollPos.x,
                top: cursorCoords.top - scrollerTop,
                right: hostScrollPos.x,
                bottom: cursorCoords.bottom - scrollerTop
            });
        }
    };

    /**
     * Sizes the inline widget height
     * @override 
     * @param {boolean} force the editor to resize
     * @param {boolean} ensureVisibility makes the parent editor scroll to display
     *                  the inline editor. Default true.
     */
    InlineShorthandEditor.prototype.sizeInlineWidgetToContents = function (force, ensureVisibility) {
        // Size the code mirror editors height to the editor content
        var widgetHeight = this.$header.outerHeight() + this.$editorHolder.height();
        if (widgetHeight) {
            this.hostEditor.setInlineWidgetHeight(this, widgetHeight, ensureVisibility);
        }
    };
    
    /**
     * Called when the editor containing the inline is made visible. Updates UI based on
     * state that might have changed while the editor was hidden.
     */
    InlineShorthandEditor.prototype.onParentShown = function () {
        InlineShorthandEditor.prototype.parentClass.onParentShown.apply(this, arguments);
        
        // Refresh line number display and codemirror line number gutter
        if (this.editor) {
            this.editor.refresh();
        }

        // We need to call this explicitly whenever the host editor is reshown
        this.sizeInlineWidgetToContents(true);
    };
    
    /**
     * Refreshes the height of the inline editor and all child editors.
     * @override
     */
    InlineShorthandEditor.prototype.refresh = function () {
        InlineShorthandEditor.prototype.parentClass.refresh.apply(this, arguments);
        this.sizeInlineWidgetToContents(true);
        if (this.editor) {
            this.editor.refresh();
        }
    };

    exports.InlineShorthandEditor = InlineShorthandEditor;
});
