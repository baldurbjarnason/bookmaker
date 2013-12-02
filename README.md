# bookmaker

*A node module for parsing, messing-about-with, and writing out EPUB files.*

## Big picture

This is a collection of objects and functions for converting digital books to and from EPUB.

Currently it implements fromEpub (both EPUB2 and EPUB3) and toEpub (EPUB3 only) methods. Its internal structure is a subset of that of EPUB3 so not all EPUB3 features are supported and some conversions will be lossy. It will get better but full EPUB3 is not on the cards (some bits of that spec are just plain dumb).

The idea is that this module will be used to create grunt plugins and command line tools. Serverside use is also a possibility but I haven't looked at all into what that would entail or require.

## The Basics

The simple version for loading an epub:

```
var bookmaker = require('bookmaker');

bookmaker.fromEpub('path/to/epubfile.epub', function(null, book) {
	console.log(book);
});
```

The book object has a book.meta object with the ebook's metadata and a book.chapters object which is an array of the book's chapters. Each chapter is an abstract version of the xhtml file where metadata has been parsed into a javascript object and the body of the chapter is accessible as chapter.body.

Obfuscated fonts should automatically be de-obfuscated.


The simple version for writing out an epub, assuming you have already loaded the 'book' object:

```
var bookmaker = require('bookmaker');
var fs = require('fs');

var out = fs.createWriteStream('path/to/output/file.epub');

bookmaker.toEpub(book, out, { obfuscateFonts: true }, function(null, bytes) {
	console.log(bytes);
});
```

The `obfuscateFonts: true` option is the only config option that toEpub currently supports.

There are other methods and functions but a lot of those will be rewritten or removed soon and so shouldn't be used.

## Development

Tests use [mocha](https://npmjs.org/package/mocha). The project is written in coffeescript but I am open to rewriting it in plain javascript once I'm happy with the basic feature set. Grunt is used to drive the coffeescript->js conversion and lint the files in the process. Templates are written in [nunjucks](https://npmjs.org/package/nunjucks). The loggers use [winston](https://npmjs.org/package/winston) but replacing those should be simple for those who need something different.

## Todo

* Thorough tests. Current tests barely even cover the basics. I have a set of production test files that need to be boiled down to tests suitable for this project. Things like how we handle complex EPUB3 metadata is completely untested at the moment and probably broken in several ways.
* Rewrite how we use objects so that a more functional style of programming can be used by those who prefer that. Currently there are several gotchas that might bite those who try to manipulate the book.chapters array directly. So, move away from methods and switch to using proper functions everywhere.
* Rewrite the structure of the book objects. Currently configuration data is stored on the object, metadata is stored on the book.meta object, and the chapters are stored in the book.chapters array. I think migrating config data to a book.config object might be cleaner.
* Write other exporters (I have an attempt at a hal+json export floating around somewhere).
* Rewrite and clean up the Gruntfile.js.
* Rewrite tests to use grunt to run and clean up the tests.
* Bugfixes. Shitloads of bugfixes.