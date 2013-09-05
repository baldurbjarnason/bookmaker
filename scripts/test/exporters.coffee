'use strict'

chai = require 'chai'
should = chai.should()
index = require '../src/index'
Chapter = index.Chapter
Book = index.Book
Assets = index.Assets
zipStream = require('zipstream-contentment')
fs = require 'fs'
glob = require 'glob'

testoutline = {
  id: 'titlepage',
  filename: 'title.html',
  title: 'Title Page',
  render: true,
  template: 'title.hbs',
  majornavitem: true
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
        date: "2013-05-15T00:00:00Z"
        copyrightYear: "19watsit"
        modified: "2013-05-19T00:00:00Z"
        }, assets)
      for chap in testchapters
        testbook.addChapter(new Chapter(chap))
      testbook.meta.start = testbook.chapters[1]
      testbook.assets.init(done)
    describe '#toJSON',
      () ->
        it 'Renders the book to json',
          () ->
            json = testbook.toJSON()
            json.should.equal("{\n  \"title\": \"The Wonderful Wizard of Oz\",\n  \"author\": \"L. Frank Baum\",\n  \"bookId\": \"this-is-an-id\",\n  \"lang\": \"en\",\n  \"description\": \"foo\",\n  \"publisher\": \"Bar\",\n  \"subject1\": \"Foobar\",\n  \"version\": \"1.0\",\n  \"date\": \"2013-05-15T00:00:00Z\",\n  \"copyrightYear\": \"19watsit\",\n  \"modified\": \"2013-05-19T00:00:00Z\",\n  \"_links\": {\n    \"self\": {\n      \"href\": \"index.json\",\n      \"type\": \"application/hal+json\",\n      \"hreflang\": \"en\"\n    },\n    \"cover\": [\n      {\n        \"href\": \"assets/cover.jpg\",\n        \"type\": \"image/jpeg\",\n        \"title\": \"Cover Image\"\n      }\n    ],\n    \"start\": {\n      \"href\": \"htmlexample.json\",\n      \"type\": \"application/hal+json\"\n    },\n    \"chapters\": [\n      {\n        \"href\": \"chapters/doc1.json\",\n        \"type\": \"application/hal+json\",\n        \"hreflang\": \"en\",\n        \"title\": \"Markdown\"\n      },\n      {\n        \"href\": \"htmlexample.json\",\n        \"type\": \"application/hal+json\",\n        \"hreflang\": \"en\",\n        \"title\": \"HTML\"\n      },\n      {\n        \"href\": \"chapters/doc2.json\",\n        \"type\": \"application/hal+json\",\n        \"hreflang\": \"en\",\n        \"title\": \"XHTML\"\n      },\n      {\n        \"href\": \"chapters/doc3.json\",\n        \"type\": \"application/hal+json\",\n        \"hreflang\": \"en\",\n        \"title\": \"Template\"\n      }\n    ],\n    \"images\": [\n      {\n        \"href\": \"assets/noise.png\",\n        \"type\": \"image/png\"\n      },\n      {\n        \"href\": \"assets/cover.jpg\",\n        \"type\": \"image/jpeg\"\n      },\n      {\n        \"href\": \"assets/texture.jpg\",\n        \"type\": \"image/jpeg\"\n      }\n    ],\n    \"stylesheets\": [\n      {\n        \"href\": \"assets/style.css\",\n        \"type\": \"text/css\"\n      }\n    ],\n    \"javascript\": [\n      {\n        \"href\": \"assets/jquery.js\",\n        \"type\": \"application/javascript\"\n      },\n      {\n        \"href\": \"assets/jquery2.js\",\n        \"type\": \"application/javascript\"\n      }\n    ]\n  }\n}")
            json = testbook.toJSON({ embedChapters: true })
            json.should.equal("{\n  \"title\": \"The Wonderful Wizard of Oz\",\n  \"author\": \"L. Frank Baum\",\n  \"bookId\": \"this-is-an-id\",\n  \"lang\": \"en\",\n  \"description\": \"foo\",\n  \"publisher\": \"Bar\",\n  \"subject1\": \"Foobar\",\n  \"version\": \"1.0\",\n  \"date\": \"2013-05-15T00:00:00Z\",\n  \"copyrightYear\": \"19watsit\",\n  \"modified\": \"2013-05-19T00:00:00Z\",\n  \"_links\": {\n    \"self\": {\n      \"href\": \"index.json\",\n      \"type\": \"application/hal+json\",\n      \"hreflang\": \"en\"\n    },\n    \"cover\": [\n      {\n        \"href\": \"assets/cover.jpg\",\n        \"type\": \"image/jpeg\",\n        \"title\": \"Cover Image\"\n      }\n    ],\n    \"start\": {\n      \"href\": \"htmlexample.json\",\n      \"type\": \"application/hal+json\"\n    },\n    \"chapters\": [\n      \"{\\n  \\\"type\\\": \\\"html\\\",\\n  \\\"title\\\": \\\"Markdown\\\",\\n  \\\"body\\\": \\\"<h1 id=\\\\\\\"h1-1\\\\\\\">header</h1>\\\\n<p class=\\\\\\\"noindent\\\\\\\" id=\\\\\\\"p-1\\\\\\\">Test</p>\\\\n\\\",\\n  \\\"id\\\": \\\"doc1\\\",\\n  \\\"_links\\\": {\\n    \\\"toc\\\": {\\n      \\\"href\\\": \\\"../index.json\\\",\\n      \\\"name\\\": \\\"TOC-JSON\\\",\\n      \\\"type\\\": \\\"application/hal+json\\\"\\n    },\\n    \\\"self\\\": {\\n      \\\"href\\\": \\\"doc1.json\\\",\\n      \\\"type\\\": \\\"application/hal+json\\\"\\n    },\\n    \\\"stylesheets\\\": [\\n      {\\n        \\\"href\\\": \\\"../assets/style.css\\\",\\n        \\\"type\\\": \\\"text/css\\\"\\n      }\\n    ],\\n    \\\"javascript\\\": [\\n      {\\n        \\\"href\\\": \\\"../assets/jquery.js\\\",\\n        \\\"type\\\": \\\"application/javascript\\\"\\n      },\\n      {\\n        \\\"href\\\": \\\"../assets/jquery2.js\\\",\\n        \\\"type\\\": \\\"application/javascript\\\"\\n      }\\n    ],\\n    \\\"next\\\": {\\n      \\\"href\\\": \\\"../htmlexample.json\\\",\\n      \\\"type\\\": \\\"application/hal+json\\\"\\n    }\\n  }\\n}\",\n      \"{\\n  \\\"type\\\": \\\"html\\\",\\n  \\\"id\\\": \\\"htmlexample\\\",\\n  \\\"title\\\": \\\"HTML\\\",\\n  \\\"arbitraryMeta\\\": \\\"is arbitrary\\\",\\n  \\\"body\\\": \\\"<h1 id=\\\\\\\"h1-1\\\\\\\">header</h1><p class=\\\\\\\"noindent\\\\\\\" id=\\\\\\\"p-1\\\\\\\">Test<br />‘—’“–”&#160;</p>\\\",\\n  \\\"_links\\\": {\\n    \\\"toc\\\": {\\n      \\\"href\\\": \\\"index.json\\\",\\n      \\\"name\\\": \\\"TOC-JSON\\\",\\n      \\\"type\\\": \\\"application/hal+json\\\"\\n    },\\n    \\\"self\\\": {\\n      \\\"href\\\": \\\"htmlexample.json\\\",\\n      \\\"type\\\": \\\"application/hal+json\\\"\\n    },\\n    \\\"stylesheets\\\": [\\n      {\\n        \\\"href\\\": \\\"assets/style.css\\\",\\n        \\\"type\\\": \\\"text/css\\\"\\n      }\\n    ],\\n    \\\"javascript\\\": [\\n      {\\n        \\\"href\\\": \\\"assets/jquery.js\\\",\\n        \\\"type\\\": \\\"application/javascript\\\"\\n      },\\n      {\\n        \\\"href\\\": \\\"assets/jquery2.js\\\",\\n        \\\"type\\\": \\\"application/javascript\\\"\\n      }\\n    ],\\n    \\\"prev\\\": {\\n      \\\"href\\\": \\\"chapters/doc1.json\\\",\\n      \\\"type\\\": \\\"application/hal+json\\\"\\n    },\\n    \\\"next\\\": {\\n      \\\"href\\\": \\\"chapters/doc2.json\\\",\\n      \\\"type\\\": \\\"application/hal+json\\\"\\n    }\\n  }\\n}\",\n      \"{\\n  \\\"type\\\": \\\"html\\\",\\n  \\\"title\\\": \\\"XHTML\\\",\\n  \\\"body\\\": \\\"<h1>header</h1><p>Test<br/></p>\\\",\\n  \\\"id\\\": \\\"doc2\\\",\\n  \\\"_links\\\": {\\n    \\\"toc\\\": {\\n      \\\"href\\\": \\\"../index.json\\\",\\n      \\\"name\\\": \\\"TOC-JSON\\\",\\n      \\\"type\\\": \\\"application/hal+json\\\"\\n    },\\n    \\\"self\\\": {\\n      \\\"href\\\": \\\"doc2.json\\\",\\n      \\\"type\\\": \\\"application/hal+json\\\"\\n    },\\n    \\\"stylesheets\\\": [\\n      {\\n        \\\"href\\\": \\\"../assets/style.css\\\",\\n        \\\"type\\\": \\\"text/css\\\"\\n      }\\n    ],\\n    \\\"javascript\\\": [\\n      {\\n        \\\"href\\\": \\\"../assets/jquery.js\\\",\\n        \\\"type\\\": \\\"application/javascript\\\"\\n      },\\n      {\\n        \\\"href\\\": \\\"../assets/jquery2.js\\\",\\n        \\\"type\\\": \\\"application/javascript\\\"\\n      }\\n    ],\\n    \\\"prev\\\": {\\n      \\\"href\\\": \\\"../htmlexample.json\\\",\\n      \\\"type\\\": \\\"application/hal+json\\\"\\n    },\\n    \\\"next\\\": {\\n      \\\"href\\\": \\\"doc3.json\\\",\\n      \\\"type\\\": \\\"application/hal+json\\\"\\n    }\\n  }\\n}\",\n      \"{\\n  \\\"type\\\": \\\"html\\\",\\n  \\\"title\\\": \\\"Template\\\",\\n  \\\"body\\\": \\\"<h1 id=\\\\\\\"h1-1\\\\\\\">Template</h1><p class=\\\\\\\"noindent\\\\\\\" id=\\\\\\\"p-1\\\\\\\">Test<br />‘—’“–”&#160;</p>\\\",\\n  \\\"id\\\": \\\"doc3\\\",\\n  \\\"_links\\\": {\\n    \\\"toc\\\": {\\n      \\\"href\\\": \\\"../index.json\\\",\\n      \\\"name\\\": \\\"TOC-JSON\\\",\\n      \\\"type\\\": \\\"application/hal+json\\\"\\n    },\\n    \\\"self\\\": {\\n      \\\"href\\\": \\\"doc3.json\\\",\\n      \\\"type\\\": \\\"application/hal+json\\\"\\n    },\\n    \\\"stylesheets\\\": [\\n      {\\n        \\\"href\\\": \\\"../assets/style.css\\\",\\n        \\\"type\\\": \\\"text/css\\\"\\n      }\\n    ],\\n    \\\"javascript\\\": [\\n      {\\n        \\\"href\\\": \\\"../assets/jquery.js\\\",\\n        \\\"type\\\": \\\"application/javascript\\\"\\n      },\\n      {\\n        \\\"href\\\": \\\"../assets/jquery2.js\\\",\\n        \\\"type\\\": \\\"application/javascript\\\"\\n      }\\n    ],\\n    \\\"prev\\\": {\\n      \\\"href\\\": \\\"doc2.json\\\",\\n      \\\"type\\\": \\\"application/hal+json\\\"\\n    }\\n  }\\n}\"\n    ],\n    \"images\": [\n      {\n        \"href\": \"assets/noise.png\",\n        \"type\": \"image/png\"\n      },\n      {\n        \"href\": \"assets/cover.jpg\",\n        \"type\": \"image/jpeg\"\n      },\n      {\n        \"href\": \"assets/texture.jpg\",\n        \"type\": \"image/jpeg\"\n      }\n    ],\n    \"stylesheets\": [\n      {\n        \"href\": \"assets/style.css\",\n        \"type\": \"text/css\"\n      }\n    ],\n    \"javascript\": [\n      {\n        \"href\": \"assets/jquery.js\",\n        \"type\": \"application/javascript\"\n      },\n      {\n        \"href\": \"assets/jquery2.js\",\n        \"type\": \"application/javascript\"\n      }\n    ]\n  }\n}")
    describe '#toJsonFiles',
      () ->
        it 'Renders the book to json files',
          (done) ->
            success = () ->
              done()
            test = () ->
              testfiles = glob("test/files/json/**/*", (er, files) ->
                files.join().should.equal("test/files/json/assets,test/files/json/assets/SourceSansPro-Regular.otf,test/files/json/assets/SourceSansPro-Regular.ttf,test/files/json/assets/cover.jpg,test/files/json/assets/jquery.js,test/files/json/assets/jquery2.js,test/files/json/assets/noise.png,test/files/json/assets/style.css,test/files/json/assets/texture.jpg,test/files/json/chapters,test/files/json/chapters/doc1.json,test/files/json/chapters/doc2.json,test/files/json/chapters/doc3.json,test/files/json/htmlexample.json,test/files/json/index.json")
                done())
            testbook.toJsonFiles('test/files/json/', { baseurl: 'http://oz.studiotendra.com/book/1/json/'}, test)
    describe '#toHtmlFiles',
      () ->
        it 'Renders the book to html files',
          (done) ->
            success = () ->
              done()
            test = () ->
              testfiles = glob("test/files/html/**/*", (er, files) ->
                files.join().should.equal("test/files/html/assets,test/files/html/assets/SourceSansPro-Regular.otf,test/files/html/assets/SourceSansPro-Regular.ttf,test/files/html/assets/cover.jpg,test/files/html/assets/jquery.js,test/files/html/assets/jquery2.js,test/files/html/assets/noise.png,test/files/html/assets/style.css,test/files/html/assets/texture.jpg,test/files/html/chapters,test/files/html/chapters/doc1.html,test/files/html/chapters/doc2.html,test/files/html/chapters/doc3.html,test/files/html/cover.html,test/files/html/htmlexample.html,test/files/html/index.html")
                done())
            testbook.toHtmlFiles('test/files/html/', { baseurl: 'http://oz.studiotendra.com/book/1/html/'}, test)
    describe '#toHtmlandJsonFiles',
      () ->
        it 'Renders the book to html and json files',
          (done) ->
            success = () ->
              done()
            test = () ->
              testfiles = glob("test/files/htmlandjson/**/*", (er, files) ->
                files.join().should.equal("test/files/htmlandjson/assets,test/files/htmlandjson/assets/SourceSansPro-Regular.otf,test/files/htmlandjson/assets/SourceSansPro-Regular.ttf,test/files/htmlandjson/assets/cover.jpg,test/files/htmlandjson/assets/jquery.js,test/files/htmlandjson/assets/jquery2.js,test/files/htmlandjson/assets/noise.png,test/files/htmlandjson/assets/style.css,test/files/htmlandjson/assets/texture.jpg,test/files/htmlandjson/chapters,test/files/htmlandjson/chapters/doc1.html,test/files/htmlandjson/chapters/doc1.json,test/files/htmlandjson/chapters/doc2.html,test/files/htmlandjson/chapters/doc2.json,test/files/htmlandjson/chapters/doc3.html,test/files/htmlandjson/chapters/doc3.json,test/files/htmlandjson/cover.html,test/files/htmlandjson/htmlexample.html,test/files/htmlandjson/htmlexample.json,test/files/htmlandjson/index.html,test/files/htmlandjson/index.json")
                done())
            testbook.toHtmlAndJsonFiles('test/files/htmlandjson/', { baseurl: 'http://oz.studiotendra.com/book/1/htmlandjson/'}, test)



