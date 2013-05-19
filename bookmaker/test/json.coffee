'use strict'

chai = require 'chai'
should = chai.should()
index = require '../src/index'
Chapter = index.Chapter
Book = index.Book
SubOutline = index.SubOutline
Assets = index.Assets
zipStream = require('zipstream-contentment')
fs = require 'fs'
whenjs = require('when')
callbacks = require 'when/callbacks'

testoutline = {
  id: 'titlepage',
  filename: 'title.html',
  title: 'Title Page',
  render: true,
  template: 'title.hbs',
  majornavitem: true,
  subChapters: [
    {
      id: 'nav',
      filename: 'index.html',
      render: false,
      title: 'Table of Contents',
      nomanifest: true,
      majornavitem: true,
      toc: true
    },
    {
      id: 'titlepage',
      filename: 'title.html',
      title: 'Title Page',
      render: true,
      template: 'title.hbs',
      majornavitem: true
    },
    {
      id: 'titletoc',
      filename: 'title.html',
      title: 'Contents',
      render: true,
      template: 'titletoc.hbs',
      majornavitem: true,
      toc: true
    },
    {
      type: 'md'
      body: '# This is Markdown!'
    }]
}
testbook = {}
testchapters =  [{
    type: 'md',
    title: 'Markdown',
    body: '# header\n\nTest'
  },
  {
    type: 'html',
    id: 'htmlexample',
    filename: 'htmlexample.html',
    title: 'HTML',
    arbitraryMeta: 'is arbitrary'
    body: '<h1>header</h1><p>Test<br>&lsquo;&mdash;&rsquo;&ldquo;&ndash;&rdquo;&nbsp;</p>'
  },
  {
    type: 'xhtml',
    title: 'XHTML',
    body: '<h1>header</h1><p>Test<br/></p>'
  },
  {
    type: 'hbs',
    title: 'Template',
    body: '<h1>{{title}}</h1><p>Test<br>&lsquo;&mdash;&rsquo;&ldquo;&ndash;&rdquo;&nbsp;</p>'
  }
]

describe 'JsonBook',
  () ->
    beforeEach (done) ->
      assets = new Assets("test/files/", "assets/")
      testbook = new Book({
        title: 'The Wonderful Wizard of Oz',
        author: 'L. Frank Baum',
        bookId: "this-is-an-id"
        lang: "en"
        cover: "assets/cover.jpg"
        description: 'foo'
        publisher: 'Bar'
        subject1: 'Foobar'
        version: "1.0"
        date: "15 May 2013"
        copyrightYear: "19watsit"
        modified: "19 May 2013"
        }, assets)
      for chap in testchapters
        testbook.addChapter(new Chapter(chap))
      testbook.meta.start = testbook.chapters[1]
      testbook.assets.init().then(() ->
        done())
    describe '#toJSON',
      () ->
        it 'Renders the book to json',
          () ->
            json = testbook.toJSON()
            json.should.equal("{\n  \"title\": \"The Wonderful Wizard of Oz\",\n  \"author\": \"L. Frank Baum\",\n  \"bookId\": \"this-is-an-id\",\n  \"lang\": \"en\",\n  \"cover\": null,\n  \"description\": \"foo\",\n  \"publisher\": \"Bar\",\n  \"subject1\": \"Foobar\",\n  \"version\": \"1.0\",\n  \"date\": \"Wed May 15 2013 00:00:00 GMT+0100 (BST)\",\n  \"copyrightYear\": \"19watsit\",\n  \"modified\": \"Sun May 19 2013 00:00:00 GMT+0100 (BST)\",\n  \"start\": \"./htmlexample.json\",\n  \"_links\": {\n    \"self\": {\n      \"href\": \"index.json\"\n    },\n    \"cover\": {\n      \"href\": \"assets/cover.jpg\"\n    },\n    \"start\": {\n      \"href\": \"./htmlexample.json\"\n    },\n    \"chapters\": [\n      {\n        \"href\": \"chapters/doc1.json\"\n      },\n      {\n        \"href\": \"./htmlexample.json\"\n      },\n      {\n        \"href\": \"chapters/doc2.json\"\n      },\n      {\n        \"href\": \"chapters/doc3.json\"\n      }\n    ],\n    \"images\": [\n      \"assets/noise.png\",\n      \"assets/cover.jpg\",\n      \"assets/texture.jpg\"\n    ],\n    \"stylesheets\": [\n      \"assets/style.css\"\n    ],\n    \"javascript\": [\n      \"assets/jquery.js\",\n      \"assets/jquery2.js\"\n    ]\n  }\n}")
            json = testbook.toJSON({ embedChapters: true })
            json.should.equal("{\n  \"title\": \"The Wonderful Wizard of Oz\",\n  \"author\": \"L. Frank Baum\",\n  \"bookId\": \"this-is-an-id\",\n  \"lang\": \"en\",\n  \"cover\": null,\n  \"description\": \"foo\",\n  \"publisher\": \"Bar\",\n  \"subject1\": \"Foobar\",\n  \"version\": \"1.0\",\n  \"date\": \"Wed May 15 2013 00:00:00 GMT+0100 (BST)\",\n  \"copyrightYear\": \"19watsit\",\n  \"modified\": \"Sun May 19 2013 00:00:00 GMT+0100 (BST)\",\n  \"start\": \"./htmlexample.json\",\n  \"_links\": {\n    \"self\": {\n      \"href\": \"index.json\"\n    },\n    \"cover\": {\n      \"href\": \"assets/cover.jpg\"\n    },\n    \"start\": {\n      \"href\": \"./htmlexample.json\"\n    },\n    \"chapters\": [\n      \"{\\n  \\\"type\\\": \\\"html\\\",\\n  \\\"title\\\": \\\"Markdown\\\",\\n  \\\"body\\\": \\\"<h1 id=\\\\\\\"h1-1\\\\\\\">header</h1>\\\\n\\\\n<p class=\\\\\\\"noindent\\\\\\\" id=\\\\\\\"p-1\\\\\\\">Test</p>\\\\n\\\",\\n  \\\"id\\\": \\\"doc1\\\",\\n  \\\"filename\\\": \\\"chapters/doc1.html\\\",\\n  \\\"_links\\\": {\\n    \\\"toc\\\": {\\n      \\\"href\\\": \\\"../index.json\\\",\\n      \\\"name\\\": \\\"JSON\\\"\\n    },\\n    \\\"self\\\": {\\n      \\\"href\\\": \\\"chapters/doc1.json\\\"\\n    },\\n    \\\"stylesheets\\\": [\\n      {\\n        \\\"href\\\": \\\"assets/style.css\\\"\\n      }\\n    ],\\n    \\\"next\\\": {\\n      \\\"href\\\": \\\"./htmlexample.undefined\\\"\\n    }\\n  }\\n}\",\n      \"{\\n  \\\"type\\\": \\\"html\\\",\\n  \\\"id\\\": \\\"htmlexample\\\",\\n  \\\"filename\\\": \\\"htmlexample.html\\\",\\n  \\\"title\\\": \\\"HTML\\\",\\n  \\\"arbitraryMeta\\\": \\\"is arbitrary\\\",\\n  \\\"body\\\": \\\"<h1 id=\\\\\\\"h1-1\\\\\\\">header</h1><p class=\\\\\\\"noindent\\\\\\\" id=\\\\\\\"p-1\\\\\\\">Test<br />‘—’“–”&#160;</p>\\\",\\n  \\\"_links\\\": {\\n    \\\"toc\\\": {\\n      \\\"href\\\": \\\"index.json\\\",\\n      \\\"name\\\": \\\"JSON\\\"\\n    },\\n    \\\"self\\\": {\\n      \\\"href\\\": \\\"./htmlexample.json\\\"\\n    },\\n    \\\"stylesheets\\\": [\\n      {\\n        \\\"href\\\": \\\"assets/style.css\\\"\\n      }\\n    ],\\n    \\\"prev\\\": {\\n      \\\"href\\\": \\\"chapters/doc1.undefined\\\"\\n    },\\n    \\\"next\\\": {\\n      \\\"href\\\": \\\"chapters/doc2.undefined\\\"\\n    }\\n  }\\n}\",\n      \"{\\n  \\\"type\\\": \\\"html\\\",\\n  \\\"title\\\": \\\"XHTML\\\",\\n  \\\"body\\\": \\\"<h1>header</h1><p>Test<br/></p>\\\",\\n  \\\"id\\\": \\\"doc2\\\",\\n  \\\"filename\\\": \\\"chapters/doc2.html\\\",\\n  \\\"_links\\\": {\\n    \\\"toc\\\": {\\n      \\\"href\\\": \\\"../index.json\\\",\\n      \\\"name\\\": \\\"JSON\\\"\\n    },\\n    \\\"self\\\": {\\n      \\\"href\\\": \\\"chapters/doc2.json\\\"\\n    },\\n    \\\"stylesheets\\\": [\\n      {\\n        \\\"href\\\": \\\"assets/style.css\\\"\\n      }\\n    ],\\n    \\\"prev\\\": {\\n      \\\"href\\\": \\\"./htmlexample.undefined\\\"\\n    },\\n    \\\"next\\\": {\\n      \\\"href\\\": \\\"chapters/doc3.undefined\\\"\\n    }\\n  }\\n}\",\n      \"{\\n  \\\"type\\\": \\\"html\\\",\\n  \\\"title\\\": \\\"Template\\\",\\n  \\\"body\\\": \\\"<h1 id=\\\\\\\"h1-1\\\\\\\">Template</h1><p class=\\\\\\\"noindent\\\\\\\" id=\\\\\\\"p-1\\\\\\\">Test<br />‘—’“–”&#160;</p>\\\",\\n  \\\"id\\\": \\\"doc3\\\",\\n  \\\"filename\\\": \\\"chapters/doc3.html\\\",\\n  \\\"_links\\\": {\\n    \\\"toc\\\": {\\n      \\\"href\\\": \\\"../index.json\\\",\\n      \\\"name\\\": \\\"JSON\\\"\\n    },\\n    \\\"self\\\": {\\n      \\\"href\\\": \\\"chapters/doc3.json\\\"\\n    },\\n    \\\"stylesheets\\\": [\\n      {\\n        \\\"href\\\": \\\"assets/style.css\\\"\\n      }\\n    ],\\n    \\\"prev\\\": {\\n      \\\"href\\\": \\\"chapters/doc2.undefined\\\"\\n    }\\n  }\\n}\"\n    ],\n    \"images\": [\n      \"assets/noise.png\",\n      \"assets/cover.jpg\",\n      \"assets/texture.jpg\"\n    ],\n    \"stylesheets\": [\n      \"assets/style.css\"\n    ],\n    \"javascript\": [\n      \"assets/jquery.js\",\n      \"assets/jquery2.js\"\n    ]\n  }\n}")


