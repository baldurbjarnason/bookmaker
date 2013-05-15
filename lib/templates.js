var glob = ('undefined' === typeof window) ? global : window,

Handlebars = glob.Handlebars || require('handlebars');

this["JST"] = this["JST"] || {};

this["JST"]["chapters"] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [2,'>= 1.0.0-rc.3'];
helpers = helpers || Handlebars.helpers; data = data || {};
  var buffer = "", stack1, stack2, options, functionType="function", escapeExpression=this.escapeExpression, self=this, helperMissing=helpers.helperMissing;

function program1(depth0,data) {
  
  var buffer = "";
  buffer += "\n<link href=\"../"
    + escapeExpression((typeof depth0 === functionType ? depth0.apply(depth0) : depth0))
    + "\" type=\"text/css\" rel=\"stylesheet\" />\n";
  return buffer;
  }

function program3(depth0,data) {
  
  var buffer = "";
  buffer += "\n<script src=\"../"
    + escapeExpression((typeof depth0 === functionType ? depth0.apply(depth0) : depth0))
    + "\" type=\"application/javascript\"></script>\n";
  return buffer;
  }

  buffer += "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<html xmlns=\"http://www.w3.org/1999/xhtml\" xmlns:epub=\"http://www.idpf.org/2007/ops\" lang=\""
    + escapeExpression(((stack1 = ((stack1 = depth0.meta),stack1 == null || stack1 === false ? stack1 : stack1.lang)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "\">\n<head>\n<title>";
  if (stack2 = helpers.title) { stack2 = stack2.call(depth0, {hash:{},data:data}); }
  else { stack2 = depth0.title; stack2 = typeof stack2 === functionType ? stack2.apply(depth0) : stack2; }
  buffer += escapeExpression(stack2)
    + " – "
    + escapeExpression(((stack1 = ((stack1 = depth0.meta),stack1 == null || stack1 === false ? stack1 : stack1.title)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "</title>\n";
  stack2 = helpers.each.call(depth0, ((stack1 = depth0.assets),stack1 == null || stack1 === false ? stack1 : stack1.css), {hash:{},inverse:self.noop,fn:self.program(1, program1, data),data:data});
  if(stack2 || stack2 === 0) { buffer += stack2; }
  buffer += "\n";
  stack2 = helpers.each.call(depth0, ((stack1 = depth0.assets),stack1 == null || stack1 === false ? stack1 : stack1.js), {hash:{},inverse:self.noop,fn:self.program(3, program3, data),data:data});
  if(stack2 || stack2 === 0) { buffer += stack2; }
  buffer += "\n</head>\n<body class=\"chapterBody ";
  if (stack2 = helpers.id) { stack2 = stack2.call(depth0, {hash:{},data:data}); }
  else { stack2 = depth0.id; stack2 = typeof stack2 === functionType ? stack2.apply(depth0) : stack2; }
  buffer += escapeExpression(stack2)
    + "\" id=\"";
  if (stack2 = helpers.id) { stack2 = stack2.call(depth0, {hash:{},data:data}); }
  else { stack2 = depth0.id; stack2 = typeof stack2 === functionType ? stack2.apply(depth0) : stack2; }
  buffer += escapeExpression(stack2)
    + "\">\n<h1>";
  if (stack2 = helpers.title) { stack2 = stack2.call(depth0, {hash:{},data:data}); }
  else { stack2 = depth0.title; stack2 = typeof stack2 === functionType ? stack2.apply(depth0) : stack2; }
  buffer += escapeExpression(stack2)
    + "</h1>\n\n";
  options = {hash:{},data:data};
  buffer += escapeExpression(((stack1 = helpers.process),stack1 ? stack1.call(depth0, depth0.body, options) : helperMissing.call(depth0, "process", depth0.body, options)))
    + "\n</body>\n</html>";
  return buffer;
  });

this["JST"]["content"] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [2,'>= 1.0.0-rc.3'];
helpers = helpers || Handlebars.helpers; data = data || {};
  var buffer = "", stack1, stack2, options, functionType="function", escapeExpression=this.escapeExpression, self=this, helperMissing=helpers.helperMissing;

function program1(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "\n    <dc:creator>"
    + escapeExpression(((stack1 = ((stack1 = depth0.meta),stack1 == null || stack1 === false ? stack1 : stack1.author2)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "</dc:creator>\n    ";
  return buffer;
  }

function program3(depth0,data) {
  
  var buffer = "", stack1;
  buffer += " and "
    + escapeExpression(((stack1 = ((stack1 = depth0.meta),stack1 == null || stack1 === false ? stack1 : stack1.author2)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1));
  return buffer;
  }

function program5(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "\n    <dc:subject>"
    + escapeExpression(((stack1 = ((stack1 = depth0.meta),stack1 == null || stack1 === false ? stack1 : stack1.subject2)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "</dc:subject>\n    ";
  return buffer;
  }

function program7(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "\n    <dc:subject>"
    + escapeExpression(((stack1 = ((stack1 = depth0.meta),stack1 == null || stack1 === false ? stack1 : stack1.subject3)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "</dc:subject>\n    ";
  return buffer;
  }

function program9(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "\n    <item id=\"";
  if (stack1 = helpers.globalCounter) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.globalCounter; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + "\" href=\""
    + escapeExpression((typeof depth0 === functionType ? depth0.apply(depth0) : depth0))
    + "\" media-type=\"text/css\"/>\n    ";
  return buffer;
  }

function program11(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "\n    <item id=\"";
  if (stack1 = helpers.globalCounter) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.globalCounter; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + "\" href=\""
    + escapeExpression((typeof depth0 === functionType ? depth0.apply(depth0) : depth0))
    + "\" media-type=\"image/jpeg\"/>\n    ";
  return buffer;
  }

function program13(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "\n    <item id=\"";
  if (stack1 = helpers.globalCounter) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.globalCounter; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + "\" href=\""
    + escapeExpression((typeof depth0 === functionType ? depth0.apply(depth0) : depth0))
    + "\" media-type=\"image/png\"/>\n    ";
  return buffer;
  }

function program15(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "\n    <item id=\"";
  if (stack1 = helpers.globalCounter) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.globalCounter; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + "\" href=\""
    + escapeExpression((typeof depth0 === functionType ? depth0.apply(depth0) : depth0))
    + "\" media-type=\"image/gif\"/>\n    ";
  return buffer;
  }

function program17(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "\n    <item id=\"";
  if (stack1 = helpers.globalCounter) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.globalCounter; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + "\" href=\""
    + escapeExpression((typeof depth0 === functionType ? depth0.apply(depth0) : depth0))
    + "\" media-type=\"image/svg+xml\"/>\n    ";
  return buffer;
  }

function program19(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "\n    <item id=\"";
  if (stack1 = helpers.globalCounter) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.globalCounter; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + "\" href=\""
    + escapeExpression((typeof depth0 === functionType ? depth0.apply(depth0) : depth0))
    + "\" media-type=\"application/x-font-ttf\"/>\n    ";
  return buffer;
  }

function program21(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "\n    <item id=\"";
  if (stack1 = helpers.globalCounter) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.globalCounter; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + "\" href=\""
    + escapeExpression((typeof depth0 === functionType ? depth0.apply(depth0) : depth0))
    + "\" media-type=\"application/x-font-otf\"/>\n    ";
  return buffer;
  }

function program23(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "\n    <item id=\"";
  if (stack1 = helpers.globalCounter) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.globalCounter; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + "\" href=\""
    + escapeExpression((typeof depth0 === functionType ? depth0.apply(depth0) : depth0))
    + "\" media-type=\"application/x-font-woff\"/>\n    ";
  return buffer;
  }

function program25(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "\n    <item id=\"";
  if (stack1 = helpers.globalCounter) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.globalCounter; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + "\" href=\""
    + escapeExpression((typeof depth0 === functionType ? depth0.apply(depth0) : depth0))
    + "\" media-type=\"application/javascript\"/>\n    ";
  return buffer;
  }

function program27(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "\n    ";
  stack1 = helpers['if'].call(depth0, depth0.nomanifest, {hash:{},inverse:self.program(30, program30, data),fn:self.program(28, program28, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n    ";
  return buffer;
  }
function program28(depth0,data) {
  
  
  return "\n    ";
  }

function program30(depth0,data) {
  
  var buffer = "", stack1, stack2;
  buffer += "<item id=\""
    + escapeExpression(((stack1 = depth0.id),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "\" href=\""
    + escapeExpression(((stack1 = depth0.filename),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "\" media-type=\"application/xhtml+xml\"\n    ";
  stack2 = helpers['if'].call(depth0, depth0.svg, {hash:{},inverse:self.noop,fn:self.program(31, program31, data),data:data});
  if(stack2 || stack2 === 0) { buffer += stack2; }
  buffer += "/>\n    ";
  return buffer;
  }
function program31(depth0,data) {
  
  
  return "properties=\"svg\"";
  }

function program33(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "\n  <itemref idref=\""
    + escapeExpression(((stack1 = depth0.id),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "\" linear=\"yes\"></itemref>\n  ";
  return buffer;
  }

  buffer += "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<package xmlns=\"http://www.idpf.org/2007/opf\" version=\"3.0\" xml:lang=\"en\" unique-identifier=\"uid\" prefix=\"rendition: http://www.idpf.org/vocab/rendition/# ibooks: http://vocabulary.itunes.apple.com/rdf/ibooks/vocabulary-extensions-1.0/\">\n  <metadata xmlns:dc=\"http://purl.org/dc/elements/1.1/\" xmlns:opf=\"http://www.idpf.org/2007/opf\">\n    <dc:title id=\"title\">"
    + escapeExpression(((stack1 = ((stack1 = depth0.meta),stack1 == null || stack1 === false ? stack1 : stack1.title)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "</dc:title>\n    <dc:creator>"
    + escapeExpression(((stack1 = ((stack1 = depth0.meta),stack1 == null || stack1 === false ? stack1 : stack1.author)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "</dc:creator>\n    ";
  stack2 = helpers['if'].call(depth0, ((stack1 = depth0.meta),stack1 == null || stack1 === false ? stack1 : stack1.author2), {hash:{},inverse:self.noop,fn:self.program(1, program1, data),data:data});
  if(stack2 || stack2 === 0) { buffer += stack2; }
  buffer += "\n    <dc:identifier id=\"uid\" >"
    + escapeExpression(((stack1 = ((stack1 = depth0.meta),stack1 == null || stack1 === false ? stack1 : stack1.bookId)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "</dc:identifier>\n    <dc:language>"
    + escapeExpression(((stack1 = ((stack1 = depth0.meta),stack1 == null || stack1 === false ? stack1 : stack1.lang)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "</dc:language>    \n    <meta property=\"dcterms:modified\">"
    + escapeExpression(((stack1 = ((stack1 = ((stack1 = depth0.meta),stack1 == null || stack1 === false ? stack1 : stack1.modified)),stack1 == null || stack1 === false ? stack1 : stack1.isoDate)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "</meta>\n    <dc:date>"
    + escapeExpression(((stack1 = ((stack1 = ((stack1 = depth0.meta),stack1 == null || stack1 === false ? stack1 : stack1.date)),stack1 == null || stack1 === false ? stack1 : stack1.isoDate)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "</dc:date>\n    <dc:rights>Copyright "
    + escapeExpression(((stack1 = ((stack1 = depth0.meta),stack1 == null || stack1 === false ? stack1 : stack1.copyrightYear)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + " "
    + escapeExpression(((stack1 = ((stack1 = depth0.meta),stack1 == null || stack1 === false ? stack1 : stack1.author)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1));
  stack2 = helpers['if'].call(depth0, ((stack1 = depth0.meta),stack1 == null || stack1 === false ? stack1 : stack1.author2), {hash:{},inverse:self.noop,fn:self.program(3, program3, data),data:data});
  if(stack2 || stack2 === 0) { buffer += stack2; }
  buffer += "</dc:rights>\n    <dc:description>"
    + escapeExpression(((stack1 = ((stack1 = depth0.meta),stack1 == null || stack1 === false ? stack1 : stack1.description)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "</dc:description>\n    <dc:publisher>"
    + escapeExpression(((stack1 = ((stack1 = depth0.meta),stack1 == null || stack1 === false ? stack1 : stack1.publisher)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "</dc:publisher>\n    <dc:subject>"
    + escapeExpression(((stack1 = ((stack1 = depth0.meta),stack1 == null || stack1 === false ? stack1 : stack1.subject1)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "</dc:subject>\n    ";
  stack2 = helpers['if'].call(depth0, ((stack1 = depth0.meta),stack1 == null || stack1 === false ? stack1 : stack1.subject2), {hash:{},inverse:self.noop,fn:self.program(5, program5, data),data:data});
  if(stack2 || stack2 === 0) { buffer += stack2; }
  buffer += "\n    ";
  stack2 = helpers['if'].call(depth0, ((stack1 = depth0.meta),stack1 == null || stack1 === false ? stack1 : stack1.subject3), {hash:{},inverse:self.noop,fn:self.program(7, program7, data),data:data});
  if(stack2 || stack2 === 0) { buffer += stack2; }
  buffer += "\n    <meta name=\"cover\" content=\"bookcover\" />\n    <meta property=\"ibooks:specified-fonts\">true</meta>\n    <meta property=\"ibooks:version\">"
    + escapeExpression(((stack1 = ((stack1 = depth0.meta),stack1 == null || stack1 === false ? stack1 : stack1.version)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "</meta>\n</metadata>\n  <manifest>\n    <item id=\"ncx\" href=\"toc.ncx\" media-type=\"application/x-dtbncx+xml\" />\n    <item id=\"bookcover\" href=\"cover.jpg\" media-type=\"image/jpeg\" properties=\"cover-image\"/>\n    ";
  stack2 = helpers.each.call(depth0, ((stack1 = depth0.assets),stack1 == null || stack1 === false ? stack1 : stack1.css), {hash:{},inverse:self.noop,fn:self.program(9, program9, data),data:data});
  if(stack2 || stack2 === 0) { buffer += stack2; }
  buffer += "\n    ";
  stack2 = helpers.each.call(depth0, ((stack1 = depth0.assets),stack1 == null || stack1 === false ? stack1 : stack1.jpg), {hash:{},inverse:self.noop,fn:self.program(11, program11, data),data:data});
  if(stack2 || stack2 === 0) { buffer += stack2; }
  buffer += "\n    ";
  stack2 = helpers.each.call(depth0, ((stack1 = depth0.assets),stack1 == null || stack1 === false ? stack1 : stack1.png), {hash:{},inverse:self.noop,fn:self.program(13, program13, data),data:data});
  if(stack2 || stack2 === 0) { buffer += stack2; }
  buffer += "\n    ";
  stack2 = helpers.each.call(depth0, ((stack1 = depth0.assets),stack1 == null || stack1 === false ? stack1 : stack1.gif), {hash:{},inverse:self.noop,fn:self.program(15, program15, data),data:data});
  if(stack2 || stack2 === 0) { buffer += stack2; }
  buffer += "\n    ";
  stack2 = helpers.each.call(depth0, ((stack1 = depth0.assets),stack1 == null || stack1 === false ? stack1 : stack1.svg), {hash:{},inverse:self.noop,fn:self.program(17, program17, data),data:data});
  if(stack2 || stack2 === 0) { buffer += stack2; }
  buffer += "\n    ";
  stack2 = helpers.each.call(depth0, ((stack1 = depth0.assets),stack1 == null || stack1 === false ? stack1 : stack1.ttf), {hash:{},inverse:self.noop,fn:self.program(19, program19, data),data:data});
  if(stack2 || stack2 === 0) { buffer += stack2; }
  buffer += "\n    ";
  stack2 = helpers.each.call(depth0, ((stack1 = depth0.assets),stack1 == null || stack1 === false ? stack1 : stack1.otf), {hash:{},inverse:self.noop,fn:self.program(21, program21, data),data:data});
  if(stack2 || stack2 === 0) { buffer += stack2; }
  buffer += "\n    ";
  stack2 = helpers.each.call(depth0, ((stack1 = depth0.assets),stack1 == null || stack1 === false ? stack1 : stack1.woff), {hash:{},inverse:self.noop,fn:self.program(23, program23, data),data:data});
  if(stack2 || stack2 === 0) { buffer += stack2; }
  buffer += "\n    ";
  stack2 = helpers.each.call(depth0, ((stack1 = depth0.assets),stack1 == null || stack1 === false ? stack1 : stack1.js), {hash:{},inverse:self.noop,fn:self.program(25, program25, data),data:data});
  if(stack2 || stack2 === 0) { buffer += stack2; }
  buffer += "\n\n    ";
  stack2 = helpers.each.call(depth0, depth0.outline, {hash:{},inverse:self.noop,fn:self.program(27, program27, data),data:data});
  if(stack2 || stack2 === 0) { buffer += stack2; }
  buffer += "\n\n	<item id=\"cover\" href=\"cover.html\" media-type=\"application/xhtml+xml\" />  \n	<item id=\"nav\" href=\"index.html\" media-type=\"application/xhtml+xml\" properties=\"nav\"/>\n  </manifest>\n  <spine toc=\"ncx\">\n  <itemref idref=\"cover\" linear=\"no\"></itemref>\n  ";
  stack2 = helpers.each.call(depth0, depth0.outline, {hash:{},inverse:self.noop,fn:self.program(33, program33, data),data:data});
  if(stack2 || stack2 === 0) { buffer += stack2; }
  buffer += "\n  </spine>\n      <guide>\n        <reference type=\"cover\" title=\"Cover\" href=\"cover.html\"></reference>\n        "
    + "\n        ";
  options = {hash:{},data:data};
  buffer += escapeExpression(((stack1 = helpers.opftoc),stack1 ? stack1.call(depth0, depth0.outline, options) : helperMissing.call(depth0, "opftoc", depth0.outline, options)))
    + "\n    </guide>\n</package>";
  return buffer;
  });

this["JST"]["cover"] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [2,'>= 1.0.0-rc.3'];
helpers = helpers || Handlebars.helpers; data = data || {};
  var buffer = "", stack1, stack2, functionType="function", escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  var buffer = "";
  buffer += "\n<link href=\""
    + escapeExpression((typeof depth0 === functionType ? depth0.apply(depth0) : depth0))
    + "\" type=\"text/css\" rel=\"stylesheet\" />\n";
  return buffer;
  }

  buffer += "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<html xmlns=\"http://www.w3.org/1999/xhtml\" xmlns:epub=\"http://www.idpf.org/2007/ops\" lang=\""
    + escapeExpression(((stack1 = ((stack1 = depth0.meta),stack1 == null || stack1 === false ? stack1 : stack1.lang)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "\">\n<head>\n<title>"
    + escapeExpression(((stack1 = ((stack1 = depth0.meta),stack1 == null || stack1 === false ? stack1 : stack1.title)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "</title>\n";
  stack2 = helpers.each.call(depth0, ((stack1 = depth0.assets),stack1 == null || stack1 === false ? stack1 : stack1.css), {hash:{},inverse:self.noop,fn:self.program(1, program1, data),data:data});
  if(stack2 || stack2 === 0) { buffer += stack2; }
  buffer += "\n<style type=\"text/css\">img{ max-width: 100%; }</style>\n</head>\n<body class=\"cover\">\n<div id=\"cover-image\">\n<img src=\"cover.jpg\" alt=\"Cover image for "
    + escapeExpression(((stack1 = ((stack1 = depth0.meta),stack1 == null || stack1 === false ? stack1 : stack1.title)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "\" />\n</div>\n</body>\n</html>";
  return buffer;
  });

this["JST"]["encryption"] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [2,'>= 1.0.0-rc.3'];
helpers = helpers || Handlebars.helpers; data = data || {};
  var buffer = "", stack1, functionType="function", escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  var buffer = "";
  buffer += "\n    <enc:EncryptedData>\n        <enc:EncryptionMethod Algorithm=\"http://www.idpf.org/2008/embedding\"/>\n        <enc:CipherData>\n            <enc:CipherReference URI=\""
    + escapeExpression((typeof depth0 === functionType ? depth0.apply(depth0) : depth0))
    + "\"/>\n        </enc:CipherData>\n    </enc:EncryptedData>\n    ";
  return buffer;
  }

  buffer += "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<encryption xmlns=\"urn:oasis:names:tc:opendocument:xmlns:container\" xmlns:enc=\"http://www.w3.org/2001/04/xmlenc#\">\n    ";
  stack1 = helpers.each.call(depth0, depth0.fonts, {hash:{},inverse:self.noop,fn:self.program(1, program1, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n</encryption>";
  return buffer;
  });

this["JST"]["nav"] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [2,'>= 1.0.0-rc.3'];
helpers = helpers || Handlebars.helpers; data = data || {};
  var buffer = "", stack1, stack2, functionType="function", escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  var buffer = "";
  buffer += "\n<link href=\""
    + escapeExpression((typeof depth0 === functionType ? depth0.apply(depth0) : depth0))
    + "\" type=\"text/css\" rel=\"stylesheet\" />\n";
  return buffer;
  }

function program3(depth0,data) {
  
  var buffer = "", stack1, stack2;
  buffer += "\n	<li class=\"tocitem "
    + escapeExpression(((stack1 = depth0.id),typeof stack1 === functionType ? stack1.apply(depth0) : stack1));
  stack2 = helpers['if'].call(depth0, depth0.majornavitem, {hash:{},inverse:self.noop,fn:self.program(4, program4, data),data:data});
  if(stack2 || stack2 === 0) { buffer += stack2; }
  buffer += "\" id=\"toc-"
    + escapeExpression(((stack1 = depth0.id),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "\"><a href=\""
    + escapeExpression(((stack1 = depth0.filename),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "\">"
    + escapeExpression(((stack1 = depth0.title),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "</a></li>\n    ";
  return buffer;
  }
function program4(depth0,data) {
  
  
  return " majornavitem";
  }

function program6(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "\n<p class=\"copyright\">"
    + escapeExpression(((stack1 = ((stack1 = depth0.meta),stack1 == null || stack1 === false ? stack1 : stack1.copyrightStatement)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "</p>\n";
  return buffer;
  }

function program8(depth0,data) {
  
  var buffer = "", stack1, stack2;
  buffer += "\n<p class=\"copyright\">Copyright &#xa9; "
    + escapeExpression(((stack1 = ((stack1 = depth0.meta),stack1 == null || stack1 === false ? stack1 : stack1.copyrightYear)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + " "
    + escapeExpression(((stack1 = ((stack1 = depth0.meta),stack1 == null || stack1 === false ? stack1 : stack1.author)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + " ";
  stack2 = helpers['if'].call(depth0, ((stack1 = depth0.meta),stack1 == null || stack1 === false ? stack1 : stack1.author2), {hash:{},inverse:self.noop,fn:self.program(9, program9, data),data:data});
  if(stack2 || stack2 === 0) { buffer += stack2; }
  buffer += "</p>\n";
  return buffer;
  }
function program9(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "and "
    + escapeExpression(((stack1 = ((stack1 = depth0.meta),stack1 == null || stack1 === false ? stack1 : stack1.author2)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1));
  return buffer;
  }

  buffer += "<html xmlns=\"http://www.w3.org/1999/xhtml\" xmlns:epub=\"http://www.idpf.org/2007/ops\" lang=\""
    + escapeExpression(((stack1 = ((stack1 = depth0.meta),stack1 == null || stack1 === false ? stack1 : stack1.lang)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "\">\n<head>\n<title>Table of Contents – "
    + escapeExpression(((stack1 = ((stack1 = depth0.meta),stack1 == null || stack1 === false ? stack1 : stack1.title)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "</title>\n";
  stack2 = helpers.each.call(depth0, ((stack1 = depth0.assets),stack1 == null || stack1 === false ? stack1 : stack1.css), {hash:{},inverse:self.noop,fn:self.program(1, program1, data),data:data});
  if(stack2 || stack2 === 0) { buffer += stack2; }
  buffer += "\n</head>\n<body class=\"nav\">\n<h1>Table of Contents</h1>\n<nav epub:type=\"toc\" id=\"toc\" class=\"toc h-toc\">\n<ol>\n	";
  stack2 = helpers.each.call(depth0, depth0.outline, {hash:{},inverse:self.noop,fn:self.program(3, program3, data),data:data});
  if(stack2 || stack2 === 0) { buffer += stack2; }
  buffer += "\n</ol>\n</nav>\n";
  stack2 = helpers['if'].call(depth0, ((stack1 = depth0.meta),stack1 == null || stack1 === false ? stack1 : stack1.copyrightStatement), {hash:{},inverse:self.program(8, program8, data),fn:self.program(6, program6, data),data:data});
  if(stack2 || stack2 === 0) { buffer += stack2; }
  buffer += "\n</body>\n</html>";
  return buffer;
  });

this["JST"]["title"] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [2,'>= 1.0.0-rc.3'];
helpers = helpers || Handlebars.helpers; data = data || {};
  var buffer = "", stack1, stack2, functionType="function", escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  var buffer = "";
  buffer += "\n<link href=\""
    + escapeExpression((typeof depth0 === functionType ? depth0.apply(depth0) : depth0))
    + "\" type=\"text/css\" rel=\"stylesheet\" />\n";
  return buffer;
  }

function program3(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "<h2>"
    + escapeExpression(((stack1 = ((stack1 = depth0.meta),stack1 == null || stack1 === false ? stack1 : stack1.author2)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "</h2>";
  return buffer;
  }

  buffer += "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<html xmlns=\"http://www.w3.org/1999/xhtml\" xmlns:epub=\"http://www.idpf.org/2007/ops\" lang=\""
    + escapeExpression(((stack1 = ((stack1 = depth0.meta),stack1 == null || stack1 === false ? stack1 : stack1.lang)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "\">\n<head>\n<title>"
    + escapeExpression(((stack1 = ((stack1 = depth0.meta),stack1 == null || stack1 === false ? stack1 : stack1.title)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "</title>\n";
  stack2 = helpers.each.call(depth0, ((stack1 = depth0.assets),stack1 == null || stack1 === false ? stack1 : stack1.css), {hash:{},inverse:self.noop,fn:self.program(1, program1, data),data:data});
  if(stack2 || stack2 === 0) { buffer += stack2; }
  buffer += "\n</head>\n<body class=\"title\">\n<h1>"
    + escapeExpression(((stack1 = ((stack1 = depth0.meta),stack1 == null || stack1 === false ? stack1 : stack1.title)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "</h1>\n<h2>"
    + escapeExpression(((stack1 = ((stack1 = depth0.meta),stack1 == null || stack1 === false ? stack1 : stack1.author)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "</h2>\n";
  stack2 = helpers['if'].call(depth0, ((stack1 = depth0.meta),stack1 == null || stack1 === false ? stack1 : stack1.author2), {hash:{},inverse:self.noop,fn:self.program(3, program3, data),data:data});
  if(stack2 || stack2 === 0) { buffer += stack2; }
  buffer += "\n</body>\n</html>";
  return buffer;
  });

this["JST"]["titletoc"] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [2,'>= 1.0.0-rc.3'];
helpers = helpers || Handlebars.helpers; data = data || {};
  var buffer = "", stack1, stack2, functionType="function", escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  var buffer = "";
  buffer += "\n<link href=\""
    + escapeExpression((typeof depth0 === functionType ? depth0.apply(depth0) : depth0))
    + "\" type=\"text/css\" rel=\"stylesheet\" />\n";
  return buffer;
  }

function program3(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "<h2>"
    + escapeExpression(((stack1 = ((stack1 = depth0.meta),stack1 == null || stack1 === false ? stack1 : stack1.author2)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "</h2>";
  return buffer;
  }

function program5(depth0,data) {
  
  var buffer = "", stack1, stack2;
  buffer += "\n	<li class=\"tocitem "
    + escapeExpression(((stack1 = depth0.id),typeof stack1 === functionType ? stack1.apply(depth0) : stack1));
  stack2 = helpers['if'].call(depth0, depth0.majornavitem, {hash:{},inverse:self.noop,fn:self.program(6, program6, data),data:data});
  if(stack2 || stack2 === 0) { buffer += stack2; }
  buffer += "\" id=\"toc-"
    + escapeExpression(((stack1 = depth0.id),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "\"><a href=\""
    + escapeExpression(((stack1 = depth0.filename),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "\">"
    + escapeExpression(((stack1 = depth0.title),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "</a></li>\n    ";
  return buffer;
  }
function program6(depth0,data) {
  
  
  return " majornavitem";
  }

function program8(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "\n<p class=\"copyright\">"
    + escapeExpression(((stack1 = ((stack1 = depth0.meta),stack1 == null || stack1 === false ? stack1 : stack1.copyrightStatement)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "</p>\n";
  return buffer;
  }

function program10(depth0,data) {
  
  var buffer = "", stack1, stack2;
  buffer += "\n<p class=\"copyright\">Copyright &#xa9; "
    + escapeExpression(((stack1 = ((stack1 = depth0.meta),stack1 == null || stack1 === false ? stack1 : stack1.copyrightYear)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + " "
    + escapeExpression(((stack1 = ((stack1 = depth0.meta),stack1 == null || stack1 === false ? stack1 : stack1.author)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + " ";
  stack2 = helpers['if'].call(depth0, ((stack1 = depth0.meta),stack1 == null || stack1 === false ? stack1 : stack1.author2), {hash:{},inverse:self.noop,fn:self.program(11, program11, data),data:data});
  if(stack2 || stack2 === 0) { buffer += stack2; }
  buffer += "</p>\n";
  return buffer;
  }
function program11(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "and "
    + escapeExpression(((stack1 = ((stack1 = depth0.meta),stack1 == null || stack1 === false ? stack1 : stack1.author2)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1));
  return buffer;
  }

  buffer += "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<html xmlns=\"http://www.w3.org/1999/xhtml\" xmlns:epub=\"http://www.idpf.org/2007/ops\" lang=\""
    + escapeExpression(((stack1 = ((stack1 = depth0.meta),stack1 == null || stack1 === false ? stack1 : stack1.lang)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "\">\n<head>\n<title>"
    + escapeExpression(((stack1 = ((stack1 = depth0.meta),stack1 == null || stack1 === false ? stack1 : stack1.title)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "</title>\n";
  stack2 = helpers.each.call(depth0, ((stack1 = depth0.assets),stack1 == null || stack1 === false ? stack1 : stack1.css), {hash:{},inverse:self.noop,fn:self.program(1, program1, data),data:data});
  if(stack2 || stack2 === 0) { buffer += stack2; }
  buffer += "\n</head>\n<body class=\"titletoc\">\n<h1>"
    + escapeExpression(((stack1 = ((stack1 = depth0.meta),stack1 == null || stack1 === false ? stack1 : stack1.title)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "</h1>\n<h2>"
    + escapeExpression(((stack1 = ((stack1 = depth0.meta),stack1 == null || stack1 === false ? stack1 : stack1.author)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "</h2>\n";
  stack2 = helpers['if'].call(depth0, ((stack1 = depth0.meta),stack1 == null || stack1 === false ? stack1 : stack1.author2), {hash:{},inverse:self.noop,fn:self.program(3, program3, data),data:data});
  if(stack2 || stack2 === 0) { buffer += stack2; }
  buffer += "\n<nav epub:type=\"toc\" id=\"toc\" class=\"toc h-toc\">\n<ol>\n	";
  stack2 = helpers.each.call(depth0, depth0.outline, {hash:{},inverse:self.noop,fn:self.program(5, program5, data),data:data});
  if(stack2 || stack2 === 0) { buffer += stack2; }
  buffer += "\n</ol>\n</nav>\n";
  stack2 = helpers['if'].call(depth0, ((stack1 = depth0.meta),stack1 == null || stack1 === false ? stack1 : stack1.copyrightStatement), {hash:{},inverse:self.program(10, program10, data),fn:self.program(8, program8, data),data:data});
  if(stack2 || stack2 === 0) { buffer += stack2; }
  buffer += "\n</body>\n</html>";
  return buffer;
  });

this["JST"]["toc"] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [2,'>= 1.0.0-rc.3'];
helpers = helpers || Handlebars.helpers; data = data || {};
  var buffer = "", stack1, stack2, functionType="function", escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "\n        <navPoint id=\"navPoint-";
  if (stack1 = helpers.navPoint) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.navPoint; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + "\" playOrder=\"";
  if (stack1 = helpers.chapterIndex) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.chapterIndex; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + "\">\n            <navLabel>\n                <text>"
    + escapeExpression(((stack1 = depth0.title),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "</text>\n            </navLabel>\n            <content src=\""
    + escapeExpression(((stack1 = depth0.filename),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "\"></content>\n        </navPoint>\n        ";
  return buffer;
  }

  buffer += "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"no\"?>\n\n<ncx xmlns=\"http://www.daisy.org/z3986/2005/ncx/\" version=\"2005-1\">\n    <head>\n        <meta name=\"dtb:uid\" content=\""
    + escapeExpression(((stack1 = ((stack1 = depth0.meta),stack1 == null || stack1 === false ? stack1 : stack1.bookId)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "\"></meta>\n        <meta name=\"dtb:depth\" content=\"1\"></meta>\n        <meta name=\"dtb:totalPageCount\" content=\"0\"></meta>\n        <meta name=\"dtb:maxPageNumber\" content=\"0\"></meta>\n    </head>\n    <docTitle>\n        <text>"
    + escapeExpression(((stack1 = ((stack1 = depth0.meta),stack1 == null || stack1 === false ? stack1 : stack1.title)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "</text>\n    </docTitle>\n    <navMap>\n        <navPoint id=\"navPoint-1\" playOrder=\"1\">\n            <navLabel>\n                <text>Cover</text>\n            </navLabel>\n            <content src=\"cover.html\"></content>\n        </navPoint>\n        ";
  stack2 = helpers.each.call(depth0, depth0.outline, {hash:{},inverse:self.noop,fn:self.program(1, program1, data),data:data});
  if(stack2 || stack2 === 0) { buffer += stack2; }
  buffer += "\n    </navMap>\n</ncx>";
  return buffer;
  });

if (typeof exports === 'object' && exports) {module.exports = this["JST"];}