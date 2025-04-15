"use strict";

var coreContentType = "application/vnd.openxmlformats-package.core-properties+xml";
var appContentType = "application/vnd.openxmlformats-officedocument.extended-properties+xml";
var customContentType = "application/vnd.openxmlformats-officedocument.custom-properties+xml";
var settingsContentType = "application/vnd.openxmlformats-officedocument.wordprocessingml.settings+xml";
var diagramDataContentType = "application/vnd.openxmlformats-officedocument.drawingml.diagramData+xml";
var diagramDrawingContentType = "application/vnd.ms-office.drawingml.diagramDrawing+xml";
module.exports = {
  settingsContentType: settingsContentType,
  coreContentType: coreContentType,
  appContentType: appContentType,
  customContentType: customContentType,
  diagramDataContentType: diagramDataContentType,
  diagramDrawingContentType: diagramDrawingContentType
};