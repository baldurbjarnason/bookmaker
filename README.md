# bookmaker

> A node module for digital book formats

## Big picture

This is a collection of objects and functions for converting digital books to and from a few formats.

Currently it implements fromEpub, toJSON, and toEpub methods. Its internal structure is a subset of that of Epub3 so not all Epub3 features are supported and some conversions will be lossy. It will get better but full Epub3 is not on the cards (some bits of that spec are just plain dumb).

The idea is that this will become the basis for grunt plugins and command line tools.