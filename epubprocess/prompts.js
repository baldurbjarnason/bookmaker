'use strict';
var async, chapterGuess, confirmGuess, guess, guessAcknowledgements, guessAcknowledgments, guessAfterword, guessAppendix, guessBibliography, guessBodymatter, guessCopyright, guessDedication, guessEpilogue, guessErrata, guessForeword, guessGlossary, guessIndex, guessIntroduction, guessLandmarks, guessPreface, guessPrologue, guessStart, guessTitlepage, guessToc, landmarkCheck, promptAuthor, promptCopyright, promptDescription, promptLanguage, promptPublisher, promptSubject, promptSubject2, promptSubject3, promptTitle, promptTitlepage, promptToc, promptly;

promptly = require('promptly');

async = require('async');

promptAuthor = function(book, callback) {
  if (!book.meta.author) {
    return promptly.prompt("What is the primary author (<dc:creator>)? ", function(err, value) {
      if (err) {
        callback(err);
      }
      if (value) {
        book.meta.author = value;
      }
      return callback(null, book);
    });
  } else {
    return callback(null, book);
  }
};

promptTitle = function(book, callback) {
  if (!book.meta.title) {
    return promptly.prompt("What is the title? ", function(err, value) {
      if (err) {
        callback(err);
      }
      if (value) {
        book.meta.title = value;
      }
      return callback(null, book);
    });
  } else {
    return callback(null, book);
  }
};

promptDescription = function(book, callback) {
  if (!book.meta.description) {
    return promptly.prompt("Can you describe the book in a few words? ", function(err, value) {
      if (err) {
        callback(err);
      }
      if (value) {
        book.meta.description = value;
      }
      return callback(null, book);
    });
  } else {
    return callback(null, book);
  }
};

promptLanguage = function(book, callback) {
  if (!book.meta.lang) {
    return promptly.prompt("In what language is the book (ISO language code)? ", function(err, value) {
      if (err) {
        callback(err);
      }
      if (value) {
        book.meta.lang = value;
      }
      return callback(null, book);
    });
  } else {
    return callback(null, book);
  }
};

promptPublisher = function(book, callback) {
  if (!book.meta.publisher) {
    return promptly.prompt("Who published the book? ", function(err, value) {
      if (err) {
        callback(err);
      }
      if (value) {
        book.meta.publisher = value;
      }
      return callback(null, book);
    });
  } else {
    return callback(null, book);
  }
};

promptSubject = function(book, callback) {
  if (!book.meta.subject1) {
    return promptly.prompt("What is the book's main subject matter? ", function(err, value) {
      if (err) {
        callback(err);
      }
      if (value) {
        book.meta.subject1 = value;
      }
      return callback(null, book);
    });
  } else {
    return callback(null, book);
  }
};

promptSubject2 = function(book, callback) {
  if (!book.meta.subject2) {
    return promptly.prompt("What is the book's secondary subject matter? ", {
      "default": ''
    }, function(err, value) {
      if (err) {
        callback(err);
      }
      if (value) {
        book.meta.subject2 = value;
      }
      return callback(null, book);
    });
  } else {
    return callback(null, book);
  }
};

promptSubject3 = function(book, callback) {
  if (!book.meta.subject3) {
    return promptly.prompt("What is the book's tertiary subject matter? ", {
      "default": ''
    }, function(err, value) {
      if (err) {
        callback(err);
      }
      if (value) {
        book.meta.subject3 = value;
      }
      return callback(null, book);
    });
  } else {
    return callback(null, book);
  }
};

landmarkCheck = function(landmarks, type) {
  var landmark, _i, _len;
  for (_i = 0, _len = landmarks.length; _i < _len; _i++) {
    landmark = landmarks[_i];
    if (landmark.type === type) {
      return true;
    }
  }
};

chapterGuess = function(chapters, search) {
  var chapter, guesses, _i, _len;
  guesses = [];
  for (_i = 0, _len = chapters.length; _i < _len; _i++) {
    chapter = chapters[_i];
    if (chapter.title.match(new RegExp(search, 'i'))) {
      guesses.push(chapter);
    } else if (chapter.filename.match(new RegExp(search, 'i'))) {
      guesses.push(chapter);
    }
  }
  return guesses;
};

guessLandmarks = function(book, callback) {
  var guess, landmarkqueries, query, _i, _len;
  landmarkqueries = [
    {
      search: 'contents',
      type: 'toc'
    }, {
      search: 'copyright',
      type: 'copyright-page'
    }, {
      search: 'index',
      type: 'index'
    }, {
      search: 'appendix',
      type: 'appendix'
    }, {
      search: 'foreword',
      type: 'foreword'
    }, {
      search: 'afterword',
      type: 'afterword'
    }, {
      search: 'introduction',
      type: 'introduction'
    }, {
      search: 'preface',
      type: 'preface'
    }, {
      search: 'prologue',
      type: 'prologue'
    }, {
      search: 'epilogue',
      type: 'epilogue'
    }, {
      search: 'glossary',
      type: 'glossary'
    }, {
      search: 'bibliography',
      type: 'bibliography'
    }, {
      search: 'errata',
      type: 'errata'
    }, {
      search: 'acknowledgments',
      type: 'acknowledgments'
    }, {
      search: 'acknowledgements',
      type: 'acknowledgments'
    }, {
      search: 'title',
      type: 'titlepage'
    }, {
      search: 'dedication',
      type: 'dedication'
    }
  ];
  if (!book.meta.landmarks) {
    book.meta.landmarks = [];
  }
  for (_i = 0, _len = landmarkqueries.length; _i < _len; _i++) {
    query = landmarkqueries[_i];
    if (!landmarkCheck(book.meta.landmarks(query.type))) {
      guess = chapterGuess(book.chapters(type.search));
      book.meta.landmarks.push({
        type: query.type,
        href: guess.filename,
        title: guess.title
      });
    }
  }
  return callback(null, book);
};

confirmGuess = function(query, guess, callback) {
  var question;
  if (query.plural) {
    question = "Is the chapter '" + guess.title + "' (" + guess.filename + ") one of the book's " + query.question + "? ";
  } else {
    question = "Is the chapter '" + guess.title + "' (" + guess.filename + ") the book's " + query.question + "? ";
  }
  return promptly.confirm(question, function(err, value) {
    if (err) {
      callback(err);
    }
    if (value) {
      query.book.meta.landmarks.push({
        type: query.type,
        href: guess.filename,
        title: guess.title
      });
    }
    return callback();
  });
};

guess = function(query) {
  var guesses, landmark;
  if (!query.book.meta.landmarks) {
    query.book.meta.landmarks = [];
  }
  landmark = landmarkCheck(query.book.meta.landmarks, query.type);
  if (!landmark) {
    guesses = chapterGuess(query.book.chapters, query.search);
    if (guesses.length > 0) {
      return async.mapSeries(guesses, confirmGuess.bind(null, query), function() {
        return query.callback(null, query.book);
      });
    } else {
      return query.callback(null, query.book);
    }
  } else {
    return query.callback(null, query.book);
  }
};

guessToc = function(book, callback) {
  var query;
  query = {
    search: 'contents',
    type: 'toc',
    question: "ToC",
    book: book,
    guess: guess,
    callback: callback
  };
  return guess(query);
};

promptToc = function(book, callback) {
  var toc;
  toc = landmarkCheck(book.meta.landmarks, 'toc');
  if (!toc) {
    return promptly.confirm("Do you want me to generate an HTML ToC? ", function(err, value) {
      if (err) {
        callback(err);
      }
      book.generate.htmlToC = value;
      return callback(null, book);
    });
  } else {
    return callback(null, book);
  }
};

guessCopyright = function(book, callback) {
  var query;
  query = {
    search: 'copyright',
    type: 'copyright-page',
    question: "Copyright page",
    book: book,
    guess: guess,
    callback: callback
  };
  return guess(query);
};

promptCopyright = function(book, callback) {
  var copyrightpage;
  copyrightpage = landmarkCheck(book.meta.landmarks, 'copyright-page');
  if (!copyrightpage) {
    return promptly.confirm("Do you want me to generate a copyright page from the book's metadata? ", function(err, value) {
      if (err) {
        callback(err);
      }
      if (value === true) {
        return promptly.choose("Where do you want the copyright page placed (Front|Back)? ", ['Front', 'Back'], function(err, value) {
          if (value === 'Back') {
            book.generate.copyrightBack = true;
          } else {
            book.generate.copyrightFront = true;
          }
          return callback(null, book);
        });
      } else {
        return callback(null, book);
      }
    });
  } else {
    return callback(null, book);
  }
};

guessIndex = function(book, callback) {
  var query;
  query = {
    search: 'index',
    type: 'index',
    question: "Index",
    book: book,
    guess: guess,
    callback: callback
  };
  return guess(query);
};

guessAppendix = function(book, callback) {
  var query;
  query = {
    plural: true,
    search: 'appendix',
    type: 'appendix',
    question: "Appendices",
    book: book,
    guess: guess,
    callback: callback
  };
  return guess(query);
};

guessForeword = function(book, callback) {
  var query;
  query = {
    search: 'foreword',
    type: 'foreword',
    question: "Foreword",
    book: book,
    guess: guess,
    callback: callback
  };
  return guess(query);
};

guessAfterword = function(book, callback) {
  var query;
  query = {
    search: 'afterword',
    type: 'afterword',
    question: "Afterword",
    book: book,
    guess: guess,
    callback: callback
  };
  return guess(query);
};

guessIntroduction = function(book, callback) {
  var query;
  query = {
    search: 'introduction',
    type: 'introduction',
    question: "Introduction",
    book: book,
    guess: guess,
    callback: callback
  };
  return guess(query);
};

guessPreface = function(book, callback) {
  var query;
  query = {
    search: 'preface',
    type: 'preface',
    question: "Preface",
    book: book,
    guess: guess,
    callback: callback
  };
  return guess(query);
};

guessPrologue = function(book, callback) {
  var query;
  query = {
    search: 'prologue',
    type: 'prologue',
    question: "Prologue",
    book: book,
    guess: guess,
    callback: callback
  };
  return guess(query);
};

guessEpilogue = function(book, callback) {
  var query;
  query = {
    search: 'epilogue',
    type: 'epilogue',
    question: "Epilogue",
    book: book,
    guess: guess,
    callback: callback
  };
  return guess(query);
};

guessGlossary = function(book, callback) {
  var query;
  query = {
    search: 'glossary',
    type: 'glossary',
    question: "Glossary",
    book: book,
    guess: guess,
    callback: callback
  };
  return guess(query);
};

guessBibliography = function(book, callback) {
  var query;
  query = {
    search: 'bibliography',
    type: 'bibliography',
    question: "Bibliography",
    book: book,
    guess: guess,
    callback: callback
  };
  return guess(query);
};

guessErrata = function(book, callback) {
  var query;
  query = {
    search: 'errata',
    type: 'errata',
    question: "Errata",
    book: book,
    guess: guess,
    callback: callback
  };
  return guess(query);
};

guessAcknowledgments = function(book, callback) {
  var query;
  query = {
    search: 'acknowledgments',
    type: 'acknowledgments',
    question: "acknowledgments",
    book: book,
    guess: guess,
    callback: callback
  };
  return guess(query);
};

guessAcknowledgements = function(book, callback) {
  var query;
  query = {
    search: 'acknowledgements',
    type: 'acknowledgments',
    question: "acknowledgments",
    book: book,
    guess: guess,
    callback: callback
  };
  return guess(query);
};

guessTitlepage = function(book, callback) {
  var query;
  query = {
    search: 'title',
    type: 'titlepage',
    question: "Title Page",
    book: book,
    guess: guess,
    callback: callback
  };
  return guess(query);
};

guessStart = function(book, callback) {
  var query;
  query = {
    search: 'chapterone',
    type: 'bodymatter',
    question: "start",
    book: book,
    guess: guess,
    callback: callback
  };
  return guess(query);
};

promptTitlepage = function(book, callback) {
  var titlepage;
  titlepage = landmarkCheck(book.meta.landmarks, 'titlepage');
  if (!titlepage) {
    return promptly.confirm("Do you want me to generate a Title Page? ", function(err, value) {
      if (err) {
        callback(err);
      }
      book.generate.titlepage = value;
      return callback(null, book);
    });
  } else {
    return callback(null, book);
  }
};

guessDedication = function(book, callback) {
  var query;
  query = {
    search: 'dedication',
    type: 'dedication',
    question: "dedication",
    book: book,
    guess: guess,
    callback: callback
  };
  return guess(query);
};

guessBodymatter = function(book, callback) {
  var query;
  query = {
    search: 'bodymatter',
    type: 'bodymatter',
    question: "start",
    book: book,
    guess: guess,
    callback: callback
  };
  return guess(query);
};

module.exports = {
  guessLandmarks: guessLandmarks,
  metadata: [promptAuthor, promptTitle, promptDescription, promptLanguage, promptPublisher, promptSubject, promptSubject2],
  landmarks: [guessToc, promptToc, guessCopyright, guessIndex, guessAppendix, guessForeword, guessAfterword, guessIntroduction, guessPreface, guessPrologue, guessEpilogue, guessGlossary, guessBibliography, guessErrata, guessAcknowledgments, guessAcknowledgements, guessTitlepage, guessDedication, guessStart, guessBodymatter],
  generate: [promptToc, promptCopyright, promptTitlepage]
};
