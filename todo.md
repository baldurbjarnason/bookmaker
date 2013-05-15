# Todo

| = One nanoemacs in configurability

* Make HTML processing optional
* Make chapter rendering more flexible |
* Make outliner more flexible |
* Add support for .mmd .pandoc .svg .png and .jpg files as chapters
* Add support for designating own layout in yaml header
* Add support for own template folder
* Add support for shared assets
* Add support for FXL metadata
* Let people use book.yml and meta.yml if they want
* Write a readme documenting both the yaml header options and the bookmaker options.
* Landmarks nav support
* Add support for the interactive declaration in the ibooks.xml
* One idea is to rewrite the processing template helper to use the html streaming api, process the html on the fly and convert into xhtml
* Nesting in the toc
* Animations in the title page. A template that wraps every character in an classed span, every phrase/word in something and offers template generated animation code.
* Option to blacklist some fonts from mangling, e.g. OSI fonts.
* Installing template sets using component?
* Add own less.css rendering, enabling us to do things like setting @format to kindle (@format: kindle;) when rendering. This in turn enables things like .mixin () when (@format = kindle) { this is a kindle}
* Render and generate Kindle and Epubs seperately.
* Enable Kindle and EPUB specific asset folders.
* folder: true -> generates a folder
* Allow for remote assets and child processes?
* Remember to compile templates
* Smartypants for titles as well
* Abstract the outline and asset objects so that they deliver all content. E.g. the consuming function doesn't have to load anything from disk or know where the file comes from.
* Add a getChapter method that finds a specific chapter object based on Title or pathname.
* Automatically wrap images in divs that have width and height.

## Notes

One way to make rendering more configurable is to move smartypants into the Handlebars helper and add options as a second parameter to the helper registration function. That way the template helpers have access to the options object.

Or redo the renderer as a class that takes care of both helpers and the rest and takes an options object as an argument on instantiation.
