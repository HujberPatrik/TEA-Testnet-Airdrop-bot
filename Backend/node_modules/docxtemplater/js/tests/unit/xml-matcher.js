"use strict";

var xmlMatcher = require("../../xml-matcher.js");
var _require = require("../utils.js"),
  expect = _require.expect;
var xmlprettify = require("../xml-prettify.js");
describe("XmlMatcher", function () {
  it("should work with simple tag", function () {
    var matcher = xmlMatcher("<w:t>Text</w:t>", ["w:t"]);
    expect(matcher.matches[0].array[0]).to.be.equal("<w:t>Text</w:t>");
    expect(matcher.matches[0].array[1]).to.be.equal("<w:t>");
    expect(matcher.matches[0].array[2]).to.be.equal("Text");
    expect(matcher.matches[0].offset).to.be.equal(0);
  });
  it("should work with multiple tags", function () {
    var matcher = xmlMatcher("<w:t>Text</w:t> TAG <w:t>Text2</w:t>", ["w:t"]);
    expect(matcher.matches[1].array[0]).to.be.equal("<w:t>Text2</w:t>");
    expect(matcher.matches[1].array[1]).to.be.equal("<w:t>");
    expect(matcher.matches[1].array[2]).to.be.equal("Text2");
    expect(matcher.matches[1].offset).to.be.equal(20);
  });
  it("should work with selfclosing tag", function () {
    var matcher = xmlMatcher(' <w:spacing w:before="0" w:after="200"/> ', ["w:spacing"]);
    expect(matcher.matches.length).to.be.equal(1);
    expect(matcher.matches[0].array[0]).to.be.equal('<w:spacing w:before="0" w:after="200"/>');
  });
  it("should not match with no </w:t> starter", function () {
    var matcher = xmlMatcher("TAG<w:t>Text1</w:t>", ["w:t"]);
    expect(matcher.matches[0].array[0]).to.be.equal("<w:t>Text1</w:t>");
    expect(matcher.matches[0].array[1]).to.be.equal("<w:t>");
    expect(matcher.matches[0].array[2]).to.be.equal("Text1");
    expect(matcher.matches[0].offset).to.be.equal(3);
  });
  it("should not match with no <w:t> ender", function () {
    var matcher = xmlMatcher("<w:t>Text1</w:t>TAG", ["w:t"]);
    expect(matcher.matches.length).to.be.equal(1);
  });
});
describe("XML prettify", function () {
  it("should work with > inside attribute", function () {
    var str = xmlprettify("<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?>\n      <w:lvlText w:val=\">\"/>");
    expect(str).to.equal("<?xml version=\"1.0\" standalone=\"yes\"?>\n<w:lvlText w:val=\">\"/>\n");
  });
  it("should normalize space inside <w:rPr>", function () {
    var str = xmlprettify("<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?>\n\t  <w:rPr>\n\n</w:rPr>");
    expect(str).to.equal("<?xml version=\"1.0\" standalone=\"yes\"?>\n<w:rPr>\n</w:rPr>\n");
  });
  it("should not normalize space inside <w:t>, <t> or <a:t>", function () {
    var str = xmlprettify("<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?>\n\t  <w:t>\n\n</w:t>\n<a:t>\n\n</a:t>\n<t>\n\n</t>");
    expect(str).to.equal("<?xml version=\"1.0\" standalone=\"yes\"?>\n<w:t>\n\n</w:t>\n<a:t>\n\n</a:t>\n<t>\n\n</t>\n");
  });
  it("should deduplicate xmlns:w", function () {
    var str = '<w:sectPr xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:t xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"/></w:sectPr>';
    str = xmlprettify(str);
    expect(str).to.equal("<w:sectPr xmlns:w=\"http://schemas.openxmlformats.org/wordprocessingml/2006/main\">\n    <w:t />\n</w:sectPr>\n");
  });
  it("should normalize &#100;", function () {
    var str = '<w foo="Ry&#100;cy9Ry&#010;cy9"/>';
    str = xmlprettify(str);
    expect(str).to.equal("<w foo=\"Ry&#x64;cy9Ry&#xA;cy9\"/>\n");
  });
  it("should sort attributes", function () {
    var str = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><foo zanc="bar" bar="foo"></foo><foo zak="foo" uk="bar"/>';
    var prettified = xmlprettify(str);
    expect(prettified).to.equal("<?xml version=\"1.0\" standalone=\"yes\"?>\n<foo bar=\"foo\" zanc=\"bar\">\n</foo>\n<foo uk=\"bar\" zak=\"foo\"/>\n");
  });
  it("should remove space inside tags", function () {
    var str = "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?>\n\t<sst count=\"9\" uniqueCount=\"9\" xmlns=\"http://schemas.openxmlformats.org/spreadsheetml/2006/main\">\n\t\t<si >\n\t\t\t<t xml:space=\"preserve\">Property</t>\n\t\t</si>\n\t\t<si >\n\t\t\t<t xml:space=\"preserve\">0 $</t>\n\t\t</si>\n\t\t<si >\n\t\t\t<t xml:space=\"preserve\"/>\n\t\t</si>\n\t\t<si>\n\t\t\t<t xml:space=\"preserve\"/>\n\t\t</si>\n\t\t<si>\n\t\t\t<t xml:space=\"preserve\"/>\n\t\t</si>\n\t\t<si>\n\t\t\t<t xml:space=\"preserve\"/>\n\t\t</si >\n\t\t<si>\n\t\t\t<t xml:space=\"preserve\"/>\n\t\t</si>\n\t\t<si>\n\t\t\t<t xml:space=\"preserve\"/>\n\t\t</si>\n\t\t<si />\n\t</sst>";
    var prettified = xmlprettify(str);
    expect(prettified).to.equal("<?xml version=\"1.0\" standalone=\"yes\"?>\n<sst count=\"9\" uniqueCount=\"9\" xmlns=\"http://schemas.openxmlformats.org/spreadsheetml/2006/main\">\n    <si>\n        <t xml:space=\"preserve\">Property</t>\n    </si>\n    <si>\n        <t xml:space=\"preserve\">0 $</t>\n    </si>\n    <si>\n        <t xml:space=\"preserve\"/>\n    </si>\n    <si>\n        <t xml:space=\"preserve\"/>\n    </si>\n    <si>\n        <t xml:space=\"preserve\"/>\n    </si>\n    <si>\n        <t xml:space=\"preserve\"/>\n    </si>\n    <si>\n        <t xml:space=\"preserve\"/>\n    </si>\n    <si>\n        <t xml:space=\"preserve\"/>\n    </si>\n    <si/>\n</sst>\n");
  });
  it("should work with processing instruction : <?mso-contentType?>", function () {
    var str = xmlprettify("<?xml version=\"1.0\"?>\n<?mso-contentType?>\n<FormTemplates xmlns=\"http://schemas.microsoft.com/sharepoint/v3/contenttype/forms\">\n  <Display>DocumentLibraryForm</Display>\n  <Edit>DocumentLibraryForm</Edit>\n  <New>DocumentLibraryForm</New>\n</FormTemplates>");
    expect(str).to.equal("<?xml version=\"1.0\"?>\n<?mso-contentType?>\n<FormTemplates xmlns=\"http://schemas.microsoft.com/sharepoint/v3/contenttype/forms\">\n    <Display>DocumentLibraryForm</Display>\n    <Edit>DocumentLibraryForm</Edit>\n    <New>DocumentLibraryForm</New>\n</FormTemplates>\n");
  });
  it("should remove space in processing instruction <?space in xml   ?>", function () {
    var str = xmlprettify("<?xml version=\"1.0\"   ?>\n<a></a>");
    expect(str.replace(/\n/g, "")).to.equal('<?xml version="1.0"?><a></a>');
  });
});