const launchEditor = require('react-dev-utils/launchEditor');
const launchEditorEndpoint = require('react-dev-utils/launchEditorEndpoint');

module.exports = function createLaunchEditorMiddleware() {
  return function launchEditorMiddleware(req, res, next) {
    if (req.url.startsWith(launchEditorEndpoint)) {
      const lineNumber = parseInt(req.query.lineNumber, 10) || 1;

      launchEditor(req.query.fileName, lineNumber);
      res.end();
    } else {
      next();
    }
  };
};
