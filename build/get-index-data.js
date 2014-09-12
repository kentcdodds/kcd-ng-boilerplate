var path = require('path');
var fs = require('fs');
var glob = require('glob');
var _ = require('lodash-node');
var Hjson = require('hjson');
var minimatch = require('minimatch');
var async = require('async');
var argv = require('yargs').argv;

module.exports = function loadAssets(file, options, callback) {
  fs.readFile(file, 'utf8', function (err, data) {
    if (err) throw err;
    var assetConfig = Hjson.parse(data);
    var globPatterns = joinPaths(assetConfig.files);

    async.map(globPatterns, function(pattern, cb) {
      return glob(path.join(options.assetPrefix, pattern), function(err, result) {
        if (_.isEmpty(result)) {
          console.warn('get-index-data.js: Worthless pattern:', pattern);
        }
        cb(err, result);
      });
    }, function(err, result) {
      if (err) return callback(err);
      var flatResults = _.flatten(result);
      flatResults = ignoreIgnoreds(assetConfig.ignore[options.env], flatResults);
      flatResults = sortFiles(assetConfig.priorities, flatResults);
      var finalAssets = {};
      var extensionRegex = /\.([0-9a-z]+$)/i;
      _.each(flatResults, function(path) {
        var extension = extensionRegex.exec(path)[1];
        finalAssets[extension] = finalAssets[extension] || [];
        finalAssets[extension].push(path.replace(options.assetPrefix, '/'));
      });
      return finished(finalAssets);
    });
  });

  function finished(assets) {
    callback(null, {
      scripts: assets.js,
      stylesheets: assets.css,
      BASE_URL: '/',
      API_V1_URL: '/KCD/BOILERPLATE',
      APP_NAME: 'KCD Boilerplate',
      onDev: options.env !== 'prod'
    });
  }
};

function joinPaths(value, key, parentPath) {
  key = key || './';
  parentPath = parentPath || './';
  var patterns = [];
  var rootPath = path.join(parentPath, key);
  if (_.isString(value)) {
    patterns = [path.join(rootPath, value)];
  } else if (_.isArray(value)) {
    _.each(value, function(child) {
      patterns = _.union(patterns, joinPaths(child, null, rootPath));
    });
  } else if (_.isObject(value)) {
    _.each(value, function(child, name) {
      patterns = _.union(patterns, joinPaths(child, name, rootPath));
    });
  }

  return patterns;
}

function ignoreIgnoreds(ignoreds, paths) {
  if (!ignoreds) {
    return paths;
  }
  var ignoredGlobs = joinPaths(ignoreds);
  var resultPaths = [];
  matchGlobOnPaths(ignoredGlobs, paths, function(matches, path) {
    if (!matches) {
      resultPaths.push(path);
    }
  });
  return resultPaths;
}

function sortFiles(priorities, paths) {
  var priorityGlobs = joinPaths(priorities);
  var priorityPaths = [];
  matchGlobOnPaths(priorityGlobs, paths, function(matches, path, globIndex) {
    if (matches) {
      priorityPaths[globIndex] = priorityPaths[globIndex] || [];
      priorityPaths[globIndex].push(path);
    }
  });
  var flattenedPriorityPaths = _.flatten(priorityPaths);
  return _.union(flattenedPriorityPaths, paths);
}

function matchGlobOnPaths(globs, paths, cb) {
  _.each(globs, function(glob, index) {
    _.each(paths, function(path) {
      cb(minimatch(path, '**/' + glob), path, index);
    });
  });
}